"use client";

import { useState, useEffect, useCallback } from "react";

/* ── SVG Icons ───────────────────────────────────────────────── */
const IconWallet = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M16 14h.01"/><path d="M22 10V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2"/></svg>
);
const IconDeposit = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v15m0 0-5-5m5 5 5-5"/><path d="M3 21h18"/></svg>
);
const IconWithdraw = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21V6m0 0-5 5m5-5 5 5"/><path d="M3 3h18"/></svg>
);
const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s8 3 8 10-8 10-8 10S4 19 4 12 12 2 12 2z"/><path d="m9 12 2 2 4-4"/></svg>
);
const IconEye = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
);
const IconPercent = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
);
const IconLock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
);
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const predefinedAmounts = [5, 10, 20, 50, 100];

type WalletTransaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
};

type WalletSnapshot = {
  balance: number;
  heldBalance: number;
  transactions?: WalletTransaction[];
};

const readWallet = async (): Promise<WalletSnapshot | null> => {
  try {
    const res = await fetch("/api/wallet");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

/* ── Component ────────────────────────────────────────────────── */
export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"depositar" | "retirar">("depositar");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [heldBalance, setHeldBalance] = useState(0);
  const [txList, setTxList] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchWallet = useCallback(async () => {
    const data = await readWallet();
    if (data) {
      setBalance(data.balance);
      setHeldBalance(data.heldBalance);
      setTxList(data.transactions || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    readWallet().then((data) => {
      if (cancelled) return;
      if (data) {
        setBalance(data.balance);
        setHeldBalance(data.heldBalance);
        setTxList(data.transactions || []);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const handleDeposit = async () => {
    const amt = selectedAmount || parseFloat(customAmount);
    if (!amt || amt < 1) { setMessage({ type: "error", text: "Ingresa un monto valido" }); return; }

    setDepositLoading(true);
    setMessage(null);

    try {
      // Try PayPal first
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.approvalUrl) {
          window.location.href = data.approvalUrl;
          return;
        }
      }

      // Fallback to direct deposit (demo mode)
      const depositRes = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deposit", amount: amt }),
      });

      if (depositRes.ok) {
        setMessage({ type: "success", text: `Deposito de $${amt.toFixed(2)} exitoso` });
        setSelectedAmount(null);
        setCustomAmount("");
        fetchWallet();
      } else {
        const err = await depositRes.json();
        setMessage({ type: "error", text: err.error || "Error al depositar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexion" });
    }
    setDepositLoading(false);
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt < 10) { setMessage({ type: "error", text: "El retiro minimo es $10.00" }); return; }

    setWithdrawLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw", amount: amt }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Retiro de $${amt.toFixed(2)} en proceso` });
        setWithdrawAmount("");
        fetchWallet();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Error al retirar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexion" });
    }
    setWithdrawLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
            <IconWallet />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Mi Monedero</h1>
            <p className="text-sm text-muted">Administra tus fondos de manera segura</p>
          </div>
        </div>

        {/* ── Balance Card ────────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 glow">
          <p className="text-sm text-muted mb-1">Saldo Disponible</p>
          <p className="text-4xl sm:text-5xl font-bold text-gradient tracking-tight">
            {loading ? "..." : `$${balance.toFixed(2)}`}
          </p>
          <p className="text-sm text-muted mt-2">Fondos en Garantia: ${heldBalance.toFixed(2)}</p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setActiveTab("depositar")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "depositar"
                  ? "bg-gradient-main text-white shadow-lg"
                  : "bg-surface-2 border border-border text-foreground hover:border-red-500"
              }`}
            >
              <IconDeposit /> Depositar
            </button>
            <button
              onClick={() => setActiveTab("retirar")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "retirar"
                  ? "bg-gradient-blue text-white shadow-lg"
                  : "bg-surface-2 border border-border text-foreground hover:border-blue-500"
              }`}
            >
              <IconWithdraw /> Retirar
            </button>
          </div>
        </div>

        {/* ── Deposit / Withdraw Tabs ─────────────────────────── */}
        {activeTab === "depositar" ? (
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-semibold">Depositar Fondos</h2>

            {/* Predefined amounts */}
            <div>
              <p className="text-sm text-muted mb-3">Selecciona un monto rapido</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                    className={`py-3 rounded-xl text-center font-semibold transition-all card-hover ${
                      selectedAmount === amt
                        ? "bg-gradient-main text-white border border-transparent glow"
                        : "bg-surface-2 border border-border hover:border-red-500/50"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <p className="text-sm text-muted mb-2">O ingresa un monto personalizado</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-semibold">$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted/50 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Payment methods */}
            <div>
              <p className="text-sm text-muted mb-3">Metodo de pago</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 bg-[#0070ba]/10 border border-[#0070ba]/30 rounded-xl cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[#0070ba]/15 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0070ba"><path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H8.044a.483.483 0 0 1-.477-.558L7.82 20.9l.164-1.035.015-.098a.804.804 0 0 1 .794-.68h.5c3.238 0 5.774-1.314 6.514-5.12.256-1.313.192-2.447-.3-3.327a2.74 2.74 0 0 0-.788-.837c.467.192.87.464 1.181.837l.167-.162zM17.167 5.5c-.467-.192-.984-.33-1.548-.415A11.453 11.453 0 0 0 13.5 4.92h-4.84a.805.805 0 0 0-.794.68L6.038 17.227a.579.579 0 0 0 .572.67h3.3l.828-5.247-.026.165a.805.805 0 0 1 .794-.68h1.654c3.238 0 5.774-1.314 6.514-5.12.219-1.126.106-2.066-.3-2.814a3.78 3.78 0 0 0-1.207-.701z"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">PayPal</p>
                    <p className="text-xs text-muted">Tarjeta, saldo PayPal</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success">Activo</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-surface-2 border border-border rounded-xl opacity-50">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <span className="text-blue-400 text-xs font-bold">MP</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">MercadoPago</p>
                    <p className="text-xs text-muted">OXXO, SPEI, tarjeta</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-3 text-muted">Pronto</span>
                </div>
              </div>
            </div>

            {/* Trust message */}
            <div className="flex items-start gap-3 p-4 bg-surface-2 border border-border-light rounded-xl">
              <div className="mt-0.5 text-success"><IconShield /></div>
              <p className="text-sm text-muted leading-relaxed">
                Todos los pagos son procesados de forma segura. Tus datos financieros nunca son almacenados en nuestros servidores.
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium ${
                message.type === "success" ? "bg-success/10 text-success border border-success/30" : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}>
                {message.text}
              </div>
            )}

            <button
              onClick={handleDeposit}
              disabled={depositLoading || (!selectedAmount && !customAmount)}
              className="w-full py-3.5 bg-gradient-main text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {depositLoading ? "Procesando..." : "Depositar con PayPal"}
            </button>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-semibold">Retirar Fondos</h2>

            <div>
              <p className="text-sm text-muted mb-2">Monto a retirar</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-semibold">$</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-muted/50 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <p className="text-xs text-muted mt-2">Disponible: ${balance.toFixed(2)}</p>
            </div>

            {/* Info notices */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-surface-2 border border-border-light rounded-xl">
                <div className="mt-0.5 text-warning"><IconClock /></div>
                <div>
                  <p className="text-sm font-medium">Procesamiento manual</p>
                  <p className="text-xs text-muted mt-0.5">Los retiros son revisados y procesados en un plazo de 24-48 horas habiles.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-surface-2 border border-border-light rounded-xl">
                <div className="mt-0.5 text-muted"><IconShield /></div>
                <div>
                  <p className="text-sm font-medium">Monto minimo</p>
                  <p className="text-xs text-muted mt-0.5">El retiro minimo es de $10.00 USD.</p>
                </div>
              </div>
            </div>

            {message && activeTab === "retirar" && (
              <div className={`p-4 rounded-xl text-sm font-medium ${
                message.type === "success" ? "bg-success/10 text-success border border-success/30" : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}>
                {message.text}
              </div>
            )}

            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading || !withdrawAmount}
              className="w-full py-3.5 bg-gradient-blue text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {withdrawLoading ? "Procesando..." : "Solicitar Retiro"}
            </button>
          </div>
        )}

        {/* ── Transaction History ─────────────────────────────── */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Historial de Transacciones</h2>
            <p className="text-sm text-muted mt-0.5">Tus ultimas 10 transacciones</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-left">
                  <th className="px-6 py-3 font-medium">Fecha</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Descripcion</th>
                  <th className="px-6 py-3 font-medium text-right">Monto</th>
                  <th className="px-6 py-3 font-medium text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {txList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted">
                      <p className="text-sm">Sin transacciones todavia</p>
                      <p className="text-xs mt-1">Deposita fondos para comenzar a competir</p>
                    </td>
                  </tr>
                ) : txList.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                  >
                    <td className="px-6 py-3.5 text-muted whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-6 py-3.5">
                      <span className={`font-medium ${tx.type === "deposit" ? "text-blue-500" : tx.type === "withdrawal" ? "text-red-500" : tx.type === "challenge_win" || tx.type === "tournament_prize" ? "text-success" : "text-muted"}`}>{tx.type === "deposit" ? "Deposito" : tx.type === "withdrawal" ? "Retiro" : tx.type === "challenge_entry" ? "Entrada Reto" : tx.type === "challenge_win" ? "Premio Reto" : tx.type === "tournament_entry" ? "Entrada Torneo" : tx.type === "tournament_prize" ? "Premio Torneo" : tx.type}</span>
                    </td>
                    <td className="px-6 py-3.5 text-foreground">{tx.description}</td>
                    <td className={`px-6 py-3.5 text-right font-mono font-semibold ${
                      tx.amount > 0 ? "text-success" : "text-red-400"
                    }`}>
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`inline-flex items-center gap-1.5 ${tx.status === "completed" ? "text-success" : tx.status === "processing" ? "text-warning" : "text-red-500"}`}>
                        {tx.status === "completed" ? <IconCheck /> : tx.status === "processing" ? <IconClock /> : <IconX />}
                        <span className="text-xs font-medium capitalize">{tx.status === "completed" ? "Completado" : tx.status === "processing" ? "Procesando" : "Fallido"}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Trust Cards ─────────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
            <div className="text-blue-400 mb-3"><IconEye /></div>
            <h3 className="font-semibold text-sm">Trazabilidad Completa</h3>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Cada movimiento queda registrado. Puedes consultar tu historial completo en cualquier momento.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
            <div className="text-red-400 mb-3"><IconPercent /></div>
            <h3 className="font-semibold text-sm">Comisiones Transparentes</h3>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Sin cargos ocultos. La comision de plataforma es visible antes de cada transaccion.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
            <div className="text-success mb-3"><IconLock /></div>
            <h3 className="font-semibold text-sm">Fondos Protegidos</h3>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Tus fondos estan resguardados y separados de las operaciones de la plataforma.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
