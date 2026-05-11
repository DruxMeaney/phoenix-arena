/**
 * Stripe REST API client. Uses direct fetch instead of the SDK to match the
 * pattern of paypal.ts / mercadopago.ts. Stripe supports USD natively so no
 * currency conversion is needed (unlike MercadoPago).
 *
 * NOTE on TOS: Stripe restricts "skill-based gaming with cash prizes". The
 * account must be approved for this category before going live. See
 * https://stripe.com/restricted-businesses.
 */

const STRIPE_BASE = "https://api.stripe.com/v1";

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY no configurado");
  return key;
}

/** Encode a plain object as application/x-www-form-urlencoded body Stripe expects. */
function encodeFormBody(data: Record<string, unknown>, prefix = ""): URLSearchParams {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === "object" && item !== null) {
          for (const [sk, sv] of encodeFormBody(item as Record<string, unknown>, `${key}[${i}]`)) {
            params.append(sk, sv);
          }
        } else {
          params.append(`${key}[${i}]`, String(item));
        }
      });
    } else if (typeof v === "object") {
      for (const [sk, sv] of encodeFormBody(v as Record<string, unknown>, key)) {
        params.append(sk, sv);
      }
    } else {
      params.append(key, String(v));
    }
  }
  return params;
}

async function stripeRequest<T>(method: "GET" | "POST", path: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${STRIPE_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: body ? encodeFormBody(body).toString() : undefined,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Stripe ${method} ${path} failed (${res.status}): ${errText}`);
  }
  return (await res.json()) as T;
}

export type CheckoutSessionMetadata = {
  /** "wallet_topup" | "tournament_join" — what the payment is for. */
  kind: "wallet_topup" | "tournament_join";
  /** User who initiated the payment. */
  userId: string;
  /** Original USD amount in cents (string for Stripe metadata constraints). */
  amountUsdCents: string;
  /** Tournament id when kind = "tournament_join". */
  tournamentId?: string;
};

export type CreatedCheckoutSession = {
  sessionId: string;
  url: string;
  amountUsd: number;
};

/** Create a Checkout Session for a USD amount. Returns the hosted URL. */
export async function createCheckoutSession(opts: {
  amountUsd: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string | null;
  metadata: CheckoutSessionMetadata;
}): Promise<CreatedCheckoutSession> {
  const amountCents = Math.round(opts.amountUsd * 100);

  const body: Record<string, unknown> = {
    mode: "payment",
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: { name: opts.description },
        },
        quantity: 1,
      },
    ],
    metadata: opts.metadata as unknown as Record<string, unknown>,
  };
  if (opts.customerEmail) body.customer_email = opts.customerEmail;

  const session = await stripeRequest<{ id: string; url: string }>("POST", "/checkout/sessions", body);
  return { sessionId: session.id, url: session.url, amountUsd: opts.amountUsd };
}

export type CheckoutSession = {
  id: string;
  payment_status: string; // "paid" | "unpaid" | "no_payment_required"
  status: string; // "open" | "complete" | "expired"
  amount_total: number;
  currency: string;
  customer_email: string | null;
  metadata: Record<string, string>;
  payment_intent: string | null;
};

/** Retrieve a Checkout Session by id to verify payment_status. */
export async function getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>("GET", `/checkout/sessions/${sessionId}`);
}
