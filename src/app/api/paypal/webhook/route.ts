import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  decodePayPalCustomId,
  getPayPalCapture,
  verifyPayPalWebhookSignature,
} from "@/lib/paypal";

/**
 * POST /api/paypal/webhook
 *
 * Receives PayPal events. We act on PAYMENT.CAPTURE.COMPLETED — the only
 * event that means money landed. The capture's `custom_id` carries
 * `<userId>:<amountUsdCents>` (set in create-order) so the handler can
 * credit the right wallet without keeping pending state server-side.
 *
 * Per project decision: webhooks only credit the wallet.
 *
 * PayPal recommends verifying signatures by calling their verification
 * endpoint — see verifyPayPalWebhookSignature in src/lib/paypal.ts. The
 * webhook id (from PayPal dashboard) lives in PAYPAL_WEBHOOK_ID.
 */
export async function POST(request: NextRequest) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID no configurado");
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  // Must use the raw body for signature verification.
  const rawBody = await request.text();

  const ok = await verifyPayPalWebhookSignature({
    rawBody,
    headers: {
      transmissionId: request.headers.get("paypal-transmission-id"),
      transmissionTime: request.headers.get("paypal-transmission-time"),
      certUrl: request.headers.get("paypal-cert-url"),
      authAlgo: request.headers.get("paypal-auth-algo"),
      transmissionSig: request.headers.get("paypal-transmission-sig"),
    },
    webhookId,
  });

  if (!ok) return NextResponse.json({ error: "Firma invalida" }, { status: 400 });

  let event: {
    event_type?: string;
    resource?: {
      id?: string;
      custom_id?: string;
      amount?: { value?: string; currency_code?: string };
      supplementary_data?: { related_ids?: { order_id?: string } };
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ received: true, ignored: event.event_type });
  }

  const captureId = event.resource?.id;
  // Reference key we use across the codebase is the order_id (matches what
  // paypal-join / paypal capture-order store as Transaction.reference). If
  // it's not in supplementary_data, fall back to the capture id — at worst
  // the synchronous and webhook records get split, but each is still
  // idempotent against duplicates of itself.
  const orderId =
    event.resource?.supplementary_data?.related_ids?.order_id || captureId;
  if (!orderId) return NextResponse.json({ error: "order_id ausente" }, { status: 400 });

  // Trust the capture id but re-fetch it to confirm completion + amount.
  let capture;
  try {
    if (!captureId) throw new Error("missing capture id");
    capture = await getPayPalCapture(captureId);
  } catch (err) {
    console.error("PayPal webhook: getPayPalCapture failed:", err);
    return NextResponse.json({ error: "Error al verificar el pago" }, { status: 500 });
  }

  if (capture.status !== "COMPLETED") {
    return NextResponse.json({ received: true, ignored: capture.status });
  }

  const decoded = decodePayPalCustomId(capture.custom_id);
  // Prefer the amount encoded in custom_id (what we promised at order
  // creation time) over the captured amount, so partial-capture quirks
  // don't change what we credit.
  const amountUsd = decoded
    ? decoded.amountUsd
    : parseFloat(capture.amount?.value || "0");
  const userId = decoded?.userId;

  if (!userId || !Number.isFinite(amountUsd) || amountUsd <= 0) {
    console.error(`PayPal webhook: missing userId in custom_id for capture ${captureId}`);
    return NextResponse.json({ received: true, ignored: "missing_user" });
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: { reference: orderId, type: "deposit" },
    });
    if (existing) return;
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      console.error(`PayPal webhook: wallet not found for user ${userId}`);
      return;
    }
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amountUsd } },
    });
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: "deposit",
        amount: amountUsd,
        description: `Deposito via PayPal (webhook) - $${amountUsd.toFixed(2)}`,
        status: "completed",
        reference: orderId,
      },
    });
  });

  return NextResponse.json({ received: true });
}
