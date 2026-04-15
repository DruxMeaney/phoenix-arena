import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createPayPalOrder } from "@/lib/paypal";

/** POST /api/paypal/create-order — Create a PayPal order for deposit */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { amount } = body as { amount: number };

  if (!amount || amount < 1 || amount > 1000) {
    return NextResponse.json(
      { error: "El monto debe ser entre $1 y $1,000 USD" },
      { status: 400 }
    );
  }

  try {
    const order = await createPayPalOrder(amount);

    // Find the approval URL
    const approvalUrl = order.links?.find(
      (l: { rel: string; href: string }) => l.rel === "approve"
    )?.href;

    return NextResponse.json({
      orderId: order.id,
      approvalUrl,
      status: order.status,
    });
  } catch (error) {
    console.error("PayPal create order error:", error);
    return NextResponse.json(
      { error: "Error al crear la orden de PayPal" },
      { status: 500 }
    );
  }
}
