import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { getCheckoutSession } from "@/lib/stripe";

/** Tolerance (seconds) for the webhook timestamp — protects against replays. */
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

/**
 * Verify a Stripe webhook signature against `payload` (raw request body, exact
 * bytes — never reparse JSON first). Returns true if valid.
 *
 * https://stripe.com/docs/webhooks/signatures
 */
function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  // Header format: "t=<timestamp>,v1=<sig>,v1=<sig>..."
  const parts = header.split(",").reduce<Record<string, string[]>>((acc, kv) => {
    const [k, v] = kv.split("=");
    if (!k || !v) return acc;
    if (!acc[k]) acc[k] = [];
    acc[k].push(v);
    return acc;
  }, {});
  const ts = parts.t?.[0];
  const sigs = parts.v1 || [];
  if (!ts || sigs.length === 0) return false;

  // Reject stale timestamps (replay protection).
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > TIMESTAMP_TOLERANCE_SECONDS) return false;

  const signedPayload = `${ts}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  // Constant-time compare against any of the candidate signatures.
  return sigs.some((s) => {
    if (s.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(s, "hex"), Buffer.from(expected, "hex"));
  });
}

/**
 * POST /api/stripe/webhook
 *
 * Receives Stripe events. We only care about `checkout.session.completed`
 * for now — it gives us session_id, which we re-fetch to authoritatively
 * verify payment_status before crediting. Idempotent via Transaction
 * .reference = session_id, so a webhook arriving after the synchronous
 * capture (or vice versa) is a no-op.
 *
 * Per project decision: webhooks only credit the wallet. They never auto-
 * inscribe the user to a tournament — the user retries the join with the
 * new balance.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET no configurado");
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  // IMPORTANT: must verify against the raw request body, not JSON.parse'd.
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("stripe-signature");
  if (!signatureHeader || !verifyStripeSignature(rawBody, signatureHeader, secret)) {
    return NextResponse.json({ error: "Firma invalida" }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: { id?: string } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    // Ignore other events but respond 200 so Stripe doesn't retry.
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const sessionId = event.data?.object?.id;
  if (!sessionId) return NextResponse.json({ error: "session_id ausente" }, { status: 400 });

  // Fetch the canonical session from Stripe — defense in depth against a
  // valid-signature event with tampered body.
  let session;
  try {
    session = await getCheckoutSession(sessionId);
  } catch (err) {
    console.error("Stripe webhook: getCheckoutSession failed:", err);
    return NextResponse.json({ error: "Error al verificar la sesion" }, { status: 500 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, ignored: "not_paid" });
  }

  const md = session.metadata || {};
  const userId = md.userId;
  const amountUsd = Number(md.amountUsdCents) / 100;
  if (!userId || !Number.isFinite(amountUsd) || amountUsd <= 0) {
    return NextResponse.json({ error: "Metadata incompleta" }, { status: 400 });
  }

  // Idempotent credit.
  await prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: { reference: sessionId, type: "deposit" },
    });
    if (existing) return;
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      console.error(`Stripe webhook: wallet not found for user ${userId}`);
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
        description: `Deposito via Stripe (webhook) - $${amountUsd.toFixed(2)}`,
        status: "completed",
        reference: sessionId,
      },
    });
  });

  return NextResponse.json({ received: true });
}
