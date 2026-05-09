import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createPreference, encodeExternalReference, ExternalRefKind } from "@/lib/mercadopago";

const MIN_USD = 1;
const MAX_USD = 1000;

/**
 * POST /api/mercadopago/create-preference
 *
 * Body: { amount: number (USD), purpose: "wallet_topup" | "tournament_join", tournamentId?: string }
 *
 * Returns: { preferenceId, initPoint, amountMxn, amountUsd }
 */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const amount = Number(body?.amount);
  const purpose: ExternalRefKind = body?.purpose === "tournament_join" ? "tournament_join" : "wallet_topup";
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
      ? `Inscripcion torneo Phoenix Arena ($${amount.toFixed(2)})`
      : `Recarga Phoenix Arena - $${amount.toFixed(2)}`;

  const externalReference = encodeExternalReference(purpose, user.id, amount, tournamentId);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const returnUrl = `${baseUrl}/payment-return?provider=mp`;

  try {
    const pref = await createPreference({
      amountUsd: amount,
      description,
      externalReference,
      returnUrl,
      payerEmail: user.email,
    });
    return NextResponse.json(pref);
  } catch (err) {
    console.error("MercadoPago create preference error:", err);
    return NextResponse.json({ error: "Error al crear orden de MercadoPago" }, { status: 500 });
  }
}
