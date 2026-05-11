"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Universal popup-return bridge.
 *
 * MercadoPago's `auto_return` redirects the popup window back to this page
 * with `payment_id`, `status`, and `external_reference` query params. We
 * forward them to the opener via postMessage so the original tab can
 * verify the payment server-side and update its UI, then close the popup.
 *
 * Falls back to a manual "Cerrar ventana" button if there's no opener
 * (e.g. user navigated here directly).
 */
function PaymentReturnInner() {
  const params = useSearchParams();
  const provider = params.get("provider") || "mp";
  // MercadoPago carries the result as payment_id/collection_id + status.
  // Stripe carries it as session_id (no separate status — payment_status is
  // checked server-side via getCheckoutSession). The cancel_url variant for
  // Stripe sets `cancelled=1` so we can surface a different message.
  const paymentId = params.get("payment_id") || params.get("collection_id");
  const sessionId = params.get("session_id");
  const cancelled = params.get("cancelled") === "1";
  const status = cancelled
    ? "cancelled"
    : params.get("status") || params.get("collection_status") || (sessionId ? "complete" : null);
  const externalReference = params.get("external_reference");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const opener = window.opener;
    if (!opener) return;
    try {
      opener.postMessage(
        {
          source: "phoenix-payment-return",
          provider,
          paymentId,
          sessionId,
          status,
          externalReference,
        },
        window.location.origin,
      );
    } catch {
      // postMessage will throw if the opener is gone — fall through to manual close.
    }
    // Give the opener a tick to process the message before closing.
    const t = window.setTimeout(() => {
      try {
        window.close();
      } catch {
        // ignore
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [provider, paymentId, sessionId, status, externalReference]);

  const isSuccess = status === "approved" || status === "complete";
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="bg-surface border border-border rounded-2xl p-8 max-w-md text-center space-y-3">
        <h1 className="text-lg font-bold text-foreground">
          {cancelled ? "Pago cancelado" : "Pago procesado"}
        </h1>
        <p className="text-sm text-muted">
          {isSuccess
            ? "Pago aprobado. Volviendo a Phoenix Arena..."
            : cancelled
            ? "Cerrando ventana..."
            : `Estado: ${status || "desconocido"}. Volviendo a Phoenix Arena...`}
        </p>
        <button
          onClick={() => {
            try {
              window.close();
            } catch {
              window.location.href = "/wallet";
            }
          }}
          className="px-4 py-2 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors"
        >
          Cerrar ventana
        </button>
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PaymentReturnInner />
    </Suspense>
  );
}
