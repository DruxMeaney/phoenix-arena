import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { capturePayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/db";

/** POST /api/paypal/capture-order — Capture payment after user approval */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { orderId } = body as { orderId: string };

  if (!orderId) {
    return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
  }

  try {
    const capture = await capturePayPalOrder(orderId);

    if (capture.status === "COMPLETED") {
      const capturedAmount = parseFloat(
        capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0"
      );

      if (capturedAmount > 0) {
        // Credit the user's wallet
        const wallet = await prisma.wallet.findUnique({
          where: { userId: user.id },
        });

        if (wallet) {
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: capturedAmount } },
          });

          await prisma.transaction.create({
            data: {
              walletId: wallet.id,
              type: "deposit",
              amount: capturedAmount,
              description: `Deposito via PayPal - $${capturedAmount.toFixed(2)}`,
              status: "completed",
              reference: orderId,
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        amount: capturedAmount,
        message: "Deposito exitoso",
        paypalOrderId: orderId,
      });
    }

    return NextResponse.json(
      { error: "El pago no fue completado", status: capture.status },
      { status: 400 }
    );
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.json(
      { error: "Error al procesar el pago" },
      { status: 500 }
    );
  }
}
