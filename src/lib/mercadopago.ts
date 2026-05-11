/**
 * MercadoPago REST API client (Mexico / MXN).
 *
 * Wallet balances are stored in USD; the platform converts USD→MXN at
 * preference creation using `MXN_PER_USD`. The original USD amount is
 * stored in the preference's `external_reference` so the capture endpoint
 * credits the wallet with the value the user expected to deposit.
 */

const MP_BASE = "https://api.mercadopago.com";

/** Static USD→MXN rate used at preference creation. */
export function getMxnPerUsd(): number {
  const raw = process.env.MXN_PER_USD;
  const parsed = raw ? parseFloat(raw) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return 18;
  return parsed;
}

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  return token;
}

export type ExternalRefKind = "wallet_topup" | "tournament_join";

/**
 * Encode the original USD amount + intent into the preference's
 * `external_reference` so the capture endpoint can reconstruct it without
 * trusting client input.
 */
export function encodeExternalReference(
  kind: ExternalRefKind,
  userId: string,
  amountUsd: number,
  extra?: string,
): string {
  // Format: "<kind>:<userId>:<amountUsdCents>:<extra?>"
  const parts = [kind, userId, String(Math.round(amountUsd * 100))];
  if (extra) parts.push(extra);
  return parts.join(":");
}

export function decodeExternalReference(ref: string | null | undefined):
  | { kind: ExternalRefKind; userId: string; amountUsd: number; extra: string | null }
  | null {
  if (!ref) return null;
  const [kind, userId, cents, ...rest] = ref.split(":");
  if (kind !== "wallet_topup" && kind !== "tournament_join") return null;
  const c = Number(cents);
  if (!Number.isFinite(c) || c <= 0) return null;
  return {
    kind,
    userId,
    amountUsd: c / 100,
    extra: rest.length > 0 ? rest.join(":") : null,
  };
}

export type CreatedPreference = {
  preferenceId: string;
  initPoint: string;
  amountMxn: number;
  amountUsd: number;
};

/** Create a MercadoPago checkout preference for a USD amount. */
export async function createPreference(opts: {
  amountUsd: number;
  description: string;
  externalReference: string;
  returnUrl: string;
  payerEmail?: string | null;
}): Promise<CreatedPreference> {
  const amountMxn = Math.round(opts.amountUsd * getMxnPerUsd() * 100) / 100;

  // MercadoPago rejects localhost / non-public hosts in back_urls when paired
  // with auto_return ("Host not in allowlist"). In dev we omit both: the user
  // sees MP's default thank-you page after payment and the popup-close listener
  // on the frontend handles the return.
  const isLocalReturnUrl = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|::1)/i.test(opts.returnUrl);

  const res = await fetch(`${MP_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: opts.description,
          quantity: 1,
          unit_price: amountMxn,
          currency_id: "MXN",
        },
      ],
      external_reference: opts.externalReference,
      ...(isLocalReturnUrl
        ? {}
        : {
            back_urls: {
              success: opts.returnUrl,
              failure: opts.returnUrl,
              pending: opts.returnUrl,
            },
            auto_return: "approved",
          }),
      ...(opts.payerEmail ? { payer: { email: opts.payerEmail } } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MercadoPago create preference failed: ${err}`);
  }

  const data = await res.json();
  // In sandbox the production init_point still works, but the SDK convention
  // is to prefer sandbox_init_point when running with test credentials.
  const useSandbox = process.env.MERCADOPAGO_MODE === "sandbox";
  const initPoint = useSandbox && data.sandbox_init_point ? data.sandbox_init_point : data.init_point;

  return {
    preferenceId: data.id,
    initPoint,
    amountMxn,
    amountUsd: opts.amountUsd,
  };
}

export type MercadoPagoPayment = {
  id: number;
  status: string; // approved | pending | rejected | in_process | refunded | charged_back | cancelled
  status_detail: string;
  external_reference: string | null;
  transaction_amount: number;
  currency_id: string;
  payer?: { email?: string };
};

/** Fetch a payment by id to verify its status server-side. */
export async function getPayment(paymentId: string): Promise<MercadoPagoPayment> {
  const res = await fetch(`${MP_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MercadoPago get payment failed: ${err}`);
  }
  return (await res.json()) as MercadoPagoPayment;
}
