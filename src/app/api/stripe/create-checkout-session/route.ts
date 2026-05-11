import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";

const MIN_USD = 1;
const MAX_USD = 1000;

/**
 * POST /api/stripe/create-checkout-session
 *
 * Body: { amount: number (USD), purpose: "wallet_topup" | "tournament_join", tournamentId?: string }
 *
 * Returns: { sessionId, url, amountUsd }
 */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const amount = Number(body?.amount);
  const purpose = body?.purpose === "tournament_join" ? "tournament_join" : "wallet_topup";
  const tournamentId: string | undefined = body?.tournamentId;

  if (!Number.isFinite(amount) || amount < MIN_USD || amount > MAX_USD) {
    return NextResponse.json(
      { error: `El monto debe ser entre $${MIN_USD} y $${MAX_USD} USD` },
      { status: 400 },
    );
  }
  if (purpose === "tournament_join" && !tournamentId) {
    return NextResponse.json({ error: "tournamentId requerido para tournament_join" }, { status: 400 });
  }

  const description =
    purpose === "tournament_join"
      ? `Inscripcion torneo Phoenix Arena - $${amount.toFixed(2)}`
      : `Recarga Phoenix Arena - $${amount.toFixed(2)}`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const successUrl = `${baseUrl}/payment-return?provider=stripe&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/payment-return?provider=stripe&cancelled=1`;

  try {
    const session = await createCheckoutSession({
      amountUsd: amount,
      description,
      successUrl,
      cancelUrl,
      customerEmail: user.email,
      metadata: {
        kind: purpose,
        userId: user.id,
        amountUsdCents: String(Math.round(amount * 100)),
        ...(tournamentId ? { tournamentId } : {}),
      },
    });
    return NextResponse.json(session);
  } catch (err) {
    console.error("Stripe create checkout session error:", err);
    return NextResponse.json({ error: "Error al crear sesion de Stripe" }, { status: 500 });
  }
}
