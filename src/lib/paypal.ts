/**
 * PayPal REST API v2 client.
 * Uses direct fetch instead of SDK for lighter bundle and better compatibility.
 */

const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/** Get an OAuth2 access token from PayPal. */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("PayPal auth failed");
  const data = await res.json();
  return data.access_token;
}

/**
 * Encode the userId and USD amount (cents) into a PayPal `custom_id` field
 * so webhook handlers can identify the payer without keeping pending state
 * server-side. Format: "userId:amountUsdCents". PayPal allows up to 127
 * characters and the cuid + cents fits comfortably.
 */
export function encodePayPalCustomId(userId: string, amountUsd: number): string {
  return `${userId}:${Math.round(amountUsd * 100)}`;
}

export function decodePayPalCustomId(customId: string | null | undefined):
  | { userId: string; amountUsd: number }
  | null {
  if (!customId) return null;
  const [userId, cents] = customId.split(":");
  if (!userId || !cents) return null;
  const c = Number(cents);
  if (!Number.isFinite(c) || c <= 0) return null;
  return { userId, amountUsd: c / 100 };
}

/** Create a PayPal order for a deposit. */
export async function createPayPalOrder(
  amount: number,
  options: { currency?: string; customId?: string } = {},
) {
  const currency = options.currency ?? "USD";
  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: `Deposito Phoenix Arena - $${amount.toFixed(2)}`,
          ...(options.customId ? { custom_id: options.customId } : {}),
        },
      ],
      application_context: {
        brand_name: "Phoenix Arena",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?payment=cancelled`,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal create order failed: ${err}`);
  }

  return res.json();
}

/**
 * Verify a PayPal webhook event server-side via PayPal's verification API.
 * Returns true if PayPal confirms the signature is valid.
 *
 * https://developer.paypal.com/api/rest/webhooks/rest/#link-verifywebhooksignature
 */
export async function verifyPayPalWebhookSignature(opts: {
  rawBody: string;
  headers: {
    transmissionId: string | null;
    transmissionTime: string | null;
    certUrl: string | null;
    authAlgo: string | null;
    transmissionSig: string | null;
  };
  webhookId: string;
}): Promise<boolean> {
  const { transmissionId, transmissionTime, certUrl, authAlgo, transmissionSig } = opts.headers;
  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false;
  }

  const accessToken = await getAccessToken();
  let webhookEvent;
  try {
    webhookEvent = JSON.parse(opts.rawBody);
  } catch {
    return false;
  }

  const res = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: opts.webhookId,
      webhook_event: webhookEvent,
    }),
  });

  if (!res.ok) return false;
  const data = (await res.json()) as { verification_status?: string };
  return data.verification_status === "SUCCESS";
}

/** Get details of a captured payment by capture id. */
export async function getPayPalCapture(captureId: string) {
  const accessToken = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/payments/captures/${captureId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal get capture failed: ${err}`);
  }
  return res.json();
}

/** Capture a PayPal order after user approval. */
export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal capture failed: ${err}`);
  }

  return res.json();
}
