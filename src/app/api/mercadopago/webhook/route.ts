import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { decodeExternalReference, getPayment } from "@/lib/mercadopago";

const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

/**
 * Verify a MercadoPago webhook signature.
 *
 * MP's `x-signature` header carries `ts=<ts>,v1=<hex>`. The signed payload
 * is `id:<id>;request-id:<request-id>;ts:<ts>;` where `<id>` is the
 * resource id from the URL (`data.id` query param) and `<request-id>` is
 * the `x-request-id` header.
 *
 * https://www.mercadopago.com.mx/developers/en/docs/checkout-pro/additional-content/your-integrations/notifications/webhooks#bookmark_validate_the_origin_of_the_notification
 */
function verifyMercadoPagoSignature(opts: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string | null;
  secret: string;
}): boolean {
  if (!opts.signatureHeader || !opts.requestId || !opts.dataId) return false;

  const parts = opts.signatureHeader.split(",").reduce<Record<string, string>>((acc, kv) => {
    const [k, v] = kv.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  const ts = parts.ts;
  const sig = parts.v1;
  if (!ts || !sig) return false;

  const now = Math.floor(Date.now() / 1000);
  // MP sends ts in milliseconds; tolerate either ms or s by checking both.
  const tsSec = Number(ts) > 1e12 ? Math.floor(Number(ts) / 1000) : Number(ts);
  if (Math.abs(now - tsSec) > TIMESTAMP_TOLERANCE_SECONDS) return false;

  const manifest = `id:${opts.dataId};request-id:${opts.requestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", opts.secret).update(manifest).digest("hex");

  if (sig.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

/**
 * POST /api/mercadopago/webhook
 *
 * MP webhooks are categorised by `type` — we only act on `payment`. We
 * re-fetch the payment via the API to confirm status, then credit the
 * wallet idempotently via Transaction.reference = paymentId.
 *
 * Per project decision: webhooks only credit the wallet.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("MERCADOPAGO_WEBHOOK_SECRET no configurado");
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  // MP sends data.id as a query string, e.g. ?id=12345&topic=payment
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("id");

  if (
    !verifyMercadoPagoSignature({
      signatureHeader: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
      dataId,
      secret,
    })
  ) {
    return NextResponse.json({ error: "Firma invalida" }, { status: 400 });
  }

  let event: { type?: string; data?: { id?: string | number } };
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  if (event.type !== "payment") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const paymentId = String(event.data?.id ?? dataId ?? "");
  if (!paymentId) return NextResponse.json({ error: "payment id ausente" }, { status: 400 });

  let payment;
  try {
    payment = await getPayment(paymentId);
  } catch (err) {
    console.error("MercadoPago webhook: getPayment failed:", err);
    return NextResponse.json({ error: "Error al verificar el pago" }, { status: 500 });
  }

  if (payment.status !== "approved") {
    return NextResponse.json({ received: true, ignored: payment.status });
  }

  const ref = decodeExternalReference(payment.external_reference);
  if (!ref) {
    return NextResponse.json({ received: true, ignored: "missing_external_reference" });
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: { reference: paymentId, type: "deposit" },
    });
    if (existing) return;
    const wallet = await tx.wallet.findUnique({ where: { userId: ref.userId } });
    if (!wallet) {
      console.error(`MercadoPago webhook: wallet not found for user ${ref.userId}`);
      return;
    }
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: ref.amountUsd } },
    });
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: "deposit",
        amount: ref.amountUsd,
        description: `Deposito via MercadoPago (webhook) - $${ref.amountUsd.toFixed(2)}`,
        status: "completed",
        reference: paymentId,
      },
    });
  });

  return NextResponse.json({ received: true });
}
