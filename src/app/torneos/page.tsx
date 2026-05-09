"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { resolvePrizeSplits } from "@/lib/prize-splits";

/* ───── SVG Icons ───── */
function TrophyIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function UsersIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DollarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function GamepadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="6" y1="11" x2="10" y2="11" /><line x1="8" y1="9" x2="8" y2="13" />
      <line x1="15" y1="12" x2="15.01" y2="12" /><line x1="18" y1="10" x2="18.01" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5Z" />
    </svg>
  );
}

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ChevronRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CheckCircleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

/* ───── Data ───── */
type Tab = "activos" | "proximos" | "finalizados" | "rapida";

type TournamentEntryDTO = {
  userId: string;
  paidAmount: number | null;
  user?: { id: string; username: string; avatar: string | null; tier: string };
};

type TournamentDTO = {
  id: string;
  name: string;
  game: string;
  format: string;
  tournamentType: string;
  entryFee: number;
  prizePool: number;
  maxSlots: number;
  filledSlots: number;
  status: string; // registration | check_in | in_progress | paused | finished | cancelled
  startDate: string | null;
  prizeDistribution: string;
  customPrizeSplits: string | null;
  entries: TournamentEntryDTO[];
};

const bracketData = {
  round1: [] as { a: string; b: string; winner: string }[],
  round2: [] as { a: string; b: string; winner: string }[],
  final: null as { a: string; b: string; winner: string } | null,
};

const howItWorksSteps = [
  { title: "Explora torneos", desc: "Revisa los torneos disponibles y elige el que mas te guste." },
  { title: "Registrate", desc: "Paga la entrada con tu saldo de wallet y confirma tu lugar." },
  { title: "Confirma tu equipo", desc: "Si es por equipos, invita a tus companeros antes del inicio." },
  { title: "Juega tus partidas", desc: "Sigue el bracket y reporta resultados despues de cada ronda." },
  { title: "Sube evidencia", desc: "Captura de pantalla o foto del marcador final." },
  { title: "Cobra tu premio", desc: "Los premios se depositan automaticamente a tu wallet." },
];

/* ───── Helpers ───── */
function badgeClass(tournamentType: string) {
  if (tournamentType === "pro") return "badge-pro";
  if (tournamentType === "amateur" || tournamentType === "mixto") return "badge-am";
  return "badge-detri";
}

function statusBadge(status: string) {
  if (status === "in_progress")
    return <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-success/15 text-success"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> En Curso</span>;
  if (status === "registration")
    return <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Registro Abierto</span>;
  if (status === "check_in")
    return <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400"><span className="h-1.5 w-1.5 rounded-full bg-purple-400" /> Check-In</span>;
  if (status === "cancelled")
    return <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400">Cancelado</span>;
  if (status === "finished")
    return <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">Finalizado</span>;
  return <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-3 text-muted">{status}</span>;
}

function formatStartDate(iso: string | null): string {
  if (!iso) return "Por definir";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Por definir";
  return d.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
}

function tournamentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    detri: "Detri", amateur: "Amateur", pro: "Pro", skills: "Skills",
    evento: "Evento", mixto: "Mixto", novice: "Novice", invitacional: "Invitacional",
    clasificatorio: "Clasificatorio", weekly: "Semanal", monthly: "Mensual", showmatch: "Showmatch",
  };
  return labels[type] || type;
}

/* ───── Components ───── */
function BracketMatch({ a, b, winner, round }: { a: string; b: string; winner: string; round: string }) {
  return (
    <div className="flex flex-col bg-surface-2 border border-border rounded-lg overflow-hidden text-xs min-w-[130px]">
      <div className={`px-3 py-1.5 flex items-center justify-between ${winner === "a" ? "bg-success/10 text-success font-semibold" : "text-muted"}`}>
        <span className="truncate">{a}</span>
        {winner === "a" && <CheckCircleIcon className="h-3 w-3 shrink-0 ml-1" />}
      </div>
      <div className="h-px bg-border" />
      <div className={`px-3 py-1.5 flex items-center justify-between ${winner === "b" ? "bg-success/10 text-success font-semibold" : "text-muted"}`}>
        <span className="truncate">{b}</span>
        {winner === "b" && <CheckCircleIcon className="h-3 w-3 shrink-0 ml-1" />}
      </div>
    </div>
  );
}

type PaymentPopupResult = { paymentId: string | null; status: string | null };

/**
 * Open a checkout URL in a popup. For PayPal we just wait for the popup to
 * close (the order id is known beforehand). For MercadoPago we additionally
 * listen for a postMessage from /payment-return carrying `paymentId`.
 */
function openPaymentPopup(url: string, expectedProvider: "paypal" | "mp"): Promise<PaymentPopupResult> {
  return new Promise((resolve) => {
    const w = 480;
    const h = 720;
    const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
    const popup = window.open(url, "phoenix-checkout", `width=${w},height=${h},left=${left},top=${top}`);
    if (!popup) {
      window.location.href = url;
      return;
    }

    let settled = false;
    const settle = (val: PaymentPopupResult) => {
      if (settled) return;
      settled = true;
      window.removeEventListener("message", listener);
      window.clearInterval(interval);
      resolve(val);
    };

    const listener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.source !== "phoenix-payment-return") return;
      if (data.provider !== expectedProvider) return;
      settle({
        paymentId: typeof data.paymentId === "string" ? data.paymentId : null,
        status: typeof data.status === "string" ? data.status : null,
      });
    };

    const interval = window.setInterval(() => {
      if (popup.closed) settle({ paymentId: null, status: null });
    }, 600);

    window.addEventListener("message", listener);
  });
}

function TournamentCard({
  t,
  currentUserId,
  walletBalance,
  onChange,
}: {
  t: TournamentDTO;
  currentUserId: string | null;
  walletBalance: number | null;
  onChange: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<null | "join" | "leave" | "paypal" | "mercadopago">(null);
  const [error, setError] = useState<string | null>(null);

  const pct = t.maxSlots > 0 ? Math.round((t.filledSlots / t.maxSlots) * 100) : 0;
  const distribution = useMemo(
    () => resolvePrizeSplits(t.prizeDistribution, t.customPrizeSplits),
    [t.prizeDistribution, t.customPrizeSplits],
  );
  const isJoined = !!currentUserId && t.entries.some((e) => e.userId === currentUserId);
  const isFull = t.filledSlots >= t.maxSlots;
  const canJoin = t.status === "registration" && !isFull && !isJoined && !!currentUserId;
  const canLeave = t.status === "registration" && isJoined;
  const balance = walletBalance ?? 0;
  const needsTopUp = canJoin && balance < t.entryFee;

  const handleJoinWithWallet = useCallback(async () => {
    setBusy("join");
    setError(null);
    try {
      const res = await fetch(`/api/tournaments/${t.id}/join`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error al inscribirse");
      await onChange();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }, [t.id, onChange]);

  const handleLeave = useCallback(async () => {
    if (!window.confirm(`Salir de "${t.name}"? Se reembolsara la entrada.`)) return;
    setBusy("leave");
    setError(null);
    try {
      const res = await fetch(`/api/tournaments/${t.id}/leave`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error al salir");
      await onChange();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }, [t.id, t.name, onChange]);

  const handlePayPalJoin = useCallback(async () => {
    setBusy("paypal");
    setError(null);
    try {
      // Top up the missing portion of the entry fee. PayPal create-order
      // requires a minimum of $1, so round up if the gap is smaller — the
      // remainder stays in the wallet as credit.
      const topUp = Math.max(t.entryFee - balance, 1);
      const orderRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(topUp.toFixed(2)) }),
      });
      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) throw new Error(orderData.error || "Error al crear orden de PayPal");
      const { orderId, approvalUrl } = orderData as { orderId: string; approvalUrl: string };
      if (!approvalUrl) throw new Error("PayPal no devolvio URL de aprobacion");

      await openPaymentPopup(approvalUrl, "paypal");

      // Capture + join in one shot. If the user closed the popup without paying,
      // PayPal will return an error here — surface it to the user.
      const joinRes = await fetch(`/api/tournaments/${t.id}/paypal-join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const joinData = await joinRes.json().catch(() => ({}));
      if (!joinRes.ok) throw new Error(joinData.error || "El pago no se completo");
      await onChange();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }, [t.id, t.entryFee, balance, onChange]);

  const handleMercadoPagoJoin = useCallback(async () => {
    setBusy("mercadopago");
    setError(null);
    try {
      const topUp = Math.max(t.entryFee - balance, 1);
      const prefRes = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(topUp.toFixed(2)),
          purpose: "tournament_join",
          tournamentId: t.id,
        }),
      });
      const prefData = await prefRes.json().catch(() => ({}));
      if (!prefRes.ok) throw new Error(prefData.error || "Error al crear orden de MercadoPago");
      const { initPoint } = prefData as { initPoint: string };
      if (!initPoint) throw new Error("MercadoPago no devolvio URL de pago");

      const result = await openPaymentPopup(initPoint, "mp");
      if (!result.paymentId) throw new Error("Pago cancelado o no completado");

      const joinRes = await fetch(`/api/tournaments/${t.id}/mercadopago-join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: result.paymentId }),
      });
      const joinData = await joinRes.json().catch(() => ({}));
      if (!joinRes.ok) throw new Error(joinData.error || "El pago no se completo");
      await onChange();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }, [t.id, t.entryFee, balance, onChange]);

  return (
    <div className="bg-surface border border-border rounded-xl p-5 card-hover flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`${badgeClass(t.tournamentType)} text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wide`}>
              {tournamentTypeLabel(t.tournamentType)}
            </span>
            {statusBadge(t.status)}
            {isJoined && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">Inscrito</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-foreground mt-1">{t.name}</h3>
        </div>
        <TrophyIcon className="h-6 w-6 text-red-400 shrink-0" />
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-muted"><GamepadIcon /> {t.game}</div>
        <div className="flex items-center gap-1.5 text-muted"><UsersIcon /> {t.format}</div>
        <div className="flex items-center gap-1.5 text-muted"><DollarIcon /> Entrada: ${t.entryFee.toFixed(2)}</div>
        <div className="flex items-center gap-1.5 text-muted"><ClockIcon /> {formatStartDate(t.startDate)}</div>
      </div>

      {/* Prize pool */}
      <div className="bg-surface-2 rounded-lg p-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">Pozo de premios</p>
          <p className="text-xl font-bold text-blue-400">${t.prizePool.toFixed(2)}</p>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {distribution.slice(0, 4).map((d, i) => (
            <span key={i} className="text-[10px] bg-surface-3 border border-border-light text-muted px-1.5 py-0.5 rounded">
              {i === 0 ? "1ro" : i === 1 ? "2do" : i === 2 ? "3ro" : "4to"} {d}%
            </span>
          ))}
          {distribution.length > 4 && (
            <span className="text-[10px] bg-surface-3 border border-border-light text-muted px-1.5 py-0.5 rounded">
              +{distribution.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-muted mb-1.5">
          <span>Cupos</span>
          <span>{t.filledSlots}/{t.maxSlots}</span>
        </div>
        <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-main rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>
      )}

      {/* CTA */}
      {!currentUserId ? (
        <a href="/login" className="w-full py-2.5 rounded-lg text-sm font-semibold bg-surface-3 border border-border text-muted hover:text-foreground text-center transition-colors">
          Inicia sesion para inscribirte
        </a>
      ) : t.status === "in_progress" || t.status === "check_in" ? (
        <button className="w-full py-2.5 rounded-lg text-sm font-semibold bg-surface-3 border border-border text-muted cursor-default">
          Ver Bracket
        </button>
      ) : t.status === "finished" || t.status === "cancelled" ? (
        <button className="w-full py-2.5 rounded-lg text-sm font-semibold bg-surface-3 border border-border text-muted cursor-default">
          {t.status === "finished" ? "Torneo finalizado" : "Torneo cancelado"}
        </button>
      ) : canLeave ? (
        <button
          onClick={handleLeave}
          disabled={busy !== null}
          className="w-full py-2.5 rounded-lg text-sm font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          {busy === "leave" ? "Saliendo..." : "Salir (reembolso)"}
        </button>
      ) : isFull ? (
        <button className="w-full py-2.5 rounded-lg text-sm font-semibold bg-surface-3 border border-border text-muted cursor-default">
          Torneo lleno
        </button>
      ) : needsTopUp ? (
        <div className="space-y-2">
          <p className="text-xs text-muted">
            Saldo actual: <span className="text-foreground font-medium">${balance.toFixed(2)}</span>. Faltan ${(t.entryFee - balance).toFixed(2)}.
          </p>
          <button
            onClick={handlePayPalJoin}
            disabled={busy !== null}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-gradient-main text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy === "paypal" ? "Procesando..." : `Pagar con PayPal ($${t.entryFee.toFixed(2)})`}
          </button>
          <button
            onClick={handleMercadoPagoJoin}
            disabled={busy !== null}
            className="w-full py-2.5 rounded-lg text-sm font-semibold border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 transition-colors"
          >
            {busy === "mercadopago" ? "Procesando..." : `Pagar con MercadoPago ($${t.entryFee.toFixed(2)})`}
          </button>
        </div>
      ) : (
        <button
          onClick={handleJoinWithWallet}
          disabled={busy !== null}
          className="w-full py-2.5 rounded-lg text-sm font-semibold bg-gradient-main text-white hover:opacity-90 disabled:opacity-50"
        >
          {busy === "join" ? "Inscribiendo..." : `Inscribirme ($${t.entryFee.toFixed(2)})`}
        </button>
      )}
    </div>
  );
}

/* ───── Page ───── */
export default function TorneosPage() {
  const [tab, setTab] = useState<Tab>("rapida");

  // Tournament data
  const [tournaments, setTournaments] = useState<TournamentDTO[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);
  const [tournamentsError, setTournamentsError] = useState<string | null>(null);

  // Authenticated user (for join eligibility) + wallet balance (for PayPal fallback)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const fetchTournaments = useCallback(async () => {
    try {
      setTournamentsError(null);
      const res = await fetch("/api/tournaments");
      if (!res.ok) throw new Error("Error al cargar torneos");
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (err) {
      setTournamentsError((err as Error).message);
    } finally {
      setTournamentsLoading(false);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/users/me");
      if (!res.ok) {
        setCurrentUserId(null);
        setWalletBalance(null);
        return;
      }
      const data = await res.json();
      setCurrentUserId(data.user?.id ?? null);
      setWalletBalance(typeof data.user?.balance === "number" ? data.user.balance : null);
    } catch {
      setCurrentUserId(null);
      setWalletBalance(null);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
    fetchMe();
  }, [fetchTournaments, fetchMe]);

  const refreshAfterJoin = useCallback(async () => {
    await Promise.all([fetchTournaments(), fetchMe()]);
  }, [fetchTournaments, fetchMe]);

  const activeTournaments = useMemo(
    () => tournaments.filter((t) => t.status === "registration" || t.status === "in_progress" || t.status === "check_in"),
    [tournaments],
  );
  const upcomingTournaments = useMemo(
    () =>
      tournaments.filter((t) => {
        if (t.status !== "registration") return false;
        if (!t.startDate) return false;
        return new Date(t.startDate).getTime() > Date.now();
      }),
    [tournaments],
  );
  const finishedTournaments = useMemo(
    () => tournaments.filter((t) => t.status === "finished"),
    [tournaments],
  );

  const [qmAmount, setQmAmount] = useState(10);
  const [qmSearching, setQmSearching] = useState(false);
  const [qmResult, setQmResult] = useState<{ matched: boolean; opponent?: string; amount?: number; message: string } | null>(null);

  const handleQuickMatch = async () => {
    setQmSearching(true);
    setQmResult(null);
    try {
      const res = await fetch("/api/quickmatch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: qmAmount, game: "Warzone" }) });
      const data = await res.json();
      setQmResult(res.ok ? data : { matched: false, message: data.error || "Error" });
    } catch { setQmResult({ matched: false, message: "Error de conexion" }); }
    setQmSearching(false);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "rapida", label: "Partida Rapida" },
    { key: "activos", label: "Activos" },
    { key: "proximos", label: "Proximos" },
    { key: "finalizados", label: "Finalizados" },
  ];

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <TrophyIcon className="h-7 w-7 text-red-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient">Torneos Phoenix Arena</h1>
          </div>
          <p className="text-muted text-lg max-w-2xl">
            Compite en torneos organizados, escala el bracket y llevate premios reales.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-2 rounded-xl p-1 mb-8 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === t.key
                  ? "bg-surface-3 text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Partida Rapida tab */}
        {tab === "rapida" && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-main mx-auto flex items-center justify-center shadow-lg mb-4" style={{ boxShadow: "0 0 30px rgba(220,38,38,0.3)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <h2 className="text-xl font-bold">Partida Rapida</h2>
              <p className="text-sm text-muted mt-1">Emparejamiento 1v1 instantaneo contra un rival de tu nivel</p>
            </div>

            <div className="bg-surface/40 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-5">
              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wider">Monto</label>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {[5, 10, 20, 50].map((amt) => (
                    <button key={amt} onClick={() => setQmAmount(amt)} className={`py-3 rounded-xl font-bold text-lg transition-all ${qmAmount === amt ? "bg-gradient-main text-white shadow-lg" : "bg-surface-2 border border-border text-foreground hover:border-red-500/50"}`}>
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-surface-2 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">Modalidad</span><span className="font-medium">1v1 Warzone</span></div>
                <div className="flex justify-between"><span className="text-muted">Premio</span><span className="text-success font-medium">${(qmAmount * 2 * 0.9).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted">Comision</span><span>10%</span></div>
              </div>
              <p className="text-xs text-muted">El sistema busca un rival de tu tier con monto similar. +5 XP por partida.</p>
              <button onClick={handleQuickMatch} disabled={qmSearching} className="w-full py-4 rounded-xl bg-gradient-main text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 shadow-lg">
                {qmSearching ? "Buscando rival..." : "Buscar Partida"}
              </button>
            </div>

            {qmResult && (
              <div className={`rounded-2xl p-5 text-center ${qmResult.matched ? "bg-success/10 border border-success/30" : "bg-blue-500/10 border border-blue-500/30"}`}>
                <h3 className={`font-bold mb-1 ${qmResult.matched ? "text-success" : "text-blue-400"}`}>{qmResult.matched ? "Rival encontrado" : "En cola"}</h3>
                <p className="text-sm text-muted">{qmResult.matched ? `vs ${qmResult.opponent} por $${qmResult.amount}` : qmResult.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Active tab */}
        {tab === "activos" && (
          <div className="space-y-12">
            {/* Cards grid */}
            {tournamentsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse h-72" />
                ))}
              </div>
            ) : tournamentsError ? (
              <div className="bg-surface border border-red-500/30 rounded-xl p-6 text-center">
                <p className="text-red-400 text-sm mb-3">{tournamentsError}</p>
                <button onClick={fetchTournaments} className="px-4 py-2 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors">Reintentar</button>
              </div>
            ) : activeTournaments.length === 0 ? (
              <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted text-sm">
                No hay torneos activos por ahora. Vuelve pronto.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeTournaments.map((t) => (
                  <TournamentCard
                    key={t.id}
                    t={t}
                    currentUserId={currentUserId}
                    walletBalance={walletBalance}
                    onChange={refreshAfterJoin}
                  />
                ))}
              </div>
            )}

            {/* Bracket - Copa Phoenix Semanal #12 */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Bracket: Copa Phoenix Semanal #12</h2>
              <p className="text-sm text-muted mb-6">Eliminacion directa - 8 equipos</p>

              <div className="overflow-x-auto pb-4">
                <div className="flex items-center gap-6 min-w-[680px]">
                  {/* Round 1 */}
                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Cuartos</p>
                    {bracketData.round1.map((m, i) => (
                      <BracketMatch key={i} a={m.a} b={m.b} winner={m.winner} round="qf" />
                    ))}
                  </div>

                  {/* Connectors */}
                  <div className="flex flex-col gap-[72px] pt-7">
                    {[0, 1].map((i) => (
                      <div key={i} className="flex items-center">
                        <ChevronRightIcon className="h-5 w-5 text-border-light" />
                      </div>
                    ))}
                  </div>

                  {/* Round 2 */}
                  <div className="flex flex-col gap-[72px]">
                    <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Semifinal</p>
                    {bracketData.round2.map((m, i) => (
                      <BracketMatch key={i} a={m.a} b={m.b} winner={m.winner} round="sf" />
                    ))}
                  </div>

                  {/* Connector */}
                  <div className="flex items-center pt-7">
                    <ChevronRightIcon className="h-5 w-5 text-border-light" />
                  </div>

                  {/* Final */}
                  {bracketData.final && (
                  <div className="flex flex-col">
                    <p className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-1">Final</p>
                    <BracketMatch a={bracketData.final.a} b={bracketData.final.b} winner={bracketData.final.winner} round="f" />
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-success">
                      <TrophyIcon className="h-3.5 w-3.5" />
                      <span className="font-semibold">Campeon: {bracketData.final.winner === "a" ? bracketData.final.a : bracketData.final.b}</span>
                    </div>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming tab */}
        {tab === "proximos" && (
          tournamentsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse h-48" />
              ))}
            </div>
          ) : upcomingTournaments.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted text-sm">
              No hay torneos proximos programados.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingTournaments.map((t) => (
                <TournamentCard
                  key={t.id}
                  t={t}
                  currentUserId={currentUserId}
                  walletBalance={walletBalance}
                  onChange={refreshAfterJoin}
                />
              ))}
            </div>
          )
        )}

        {/* Finished tab */}
        {tab === "finalizados" && (
          tournamentsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[0, 1].map((i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse h-32" />
              ))}
            </div>
          ) : finishedTournaments.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center text-muted text-sm">
              No hay torneos finalizados todavia.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {finishedTournaments.map((t) => {
                const winnerEntry = t.entries.find((e) => e.user); // entries don't include placement here
                return (
                  <div key={t.id} className="bg-surface border border-border rounded-xl p-5 card-hover flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground">{t.name}</h3>
                      <span className="text-xs bg-surface-3 text-muted px-2 py-0.5 rounded-full">{formatStartDate(t.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <GamepadIcon /> {t.game}
                      <span className="text-border-light">|</span>
                      <UsersIcon /> {t.entries.length} participantes
                    </div>
                    <div className="bg-surface-2 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrophyIcon className="h-5 w-5 text-warning" />
                        <div>
                          <p className="text-xs text-muted">{t.format}</p>
                          <p className="font-bold text-foreground">{winnerEntry?.user?.username || "Resultados pendientes"}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-blue-400">${t.prizePool.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* How tournaments work */}
        <section className="mt-16 pt-12 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-8">Como funcionan los torneos</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {howItWorksSteps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-main text-white text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prize distribution table */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Distribucion de premios</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="pb-3 pr-6 font-semibold">Posicion</th>
                  <th className="pb-3 pr-6 font-semibold">Torneos Estandar</th>
                  <th className="pb-3 pr-6 font-semibold">Torneos Premium</th>
                  <th className="pb-3 font-semibold">Eventos Especiales</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {[
                  { pos: "1er Lugar", std: "50%", prem: "45%", evt: "40%" },
                  { pos: "2do Lugar", std: "30%", prem: "25%", evt: "25%" },
                  { pos: "3er Lugar", std: "20%", prem: "15%", evt: "15%" },
                  { pos: "4to Lugar", std: "---", prem: "10%", evt: "10%" },
                  { pos: "5to - 8vo", std: "---", prem: "5%", evt: "10%" },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-3 pr-6 font-medium">{r.pos}</td>
                    <td className="py-3 pr-6">{r.std}</td>
                    <td className="py-3 pr-6">{r.prem}</td>
                    <td className="py-3">{r.evt}</td>
                  </tr>
                ))}
                <tr className="text-muted text-xs">
                  <td className="pt-3 pr-6" colSpan={4}>
                    La plataforma retiene una comision del 10%-20% para operaciones y organizacion.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
