"use client";

import { useState } from "react";

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

/* ── Data ─────────────────────────────────────────────────────── */
type TxType = "Deposito" | "Retiro" | "Reto" | "Comision";
type TxStatus = "Completado" | "Procesando" | "Fallido";

interface Transaction {
  fecha: string;
  tipo: TxType;
  descripcion: string;
  monto: string;
  estado: TxStatus;
}

const transactions: Transaction[] = [];

const predefinedAmounts = [5, 10, 20, 50, 100];

const typeColor: Record<TxType, string> = {
  Deposito: "text-blue-500",
  Retiro: "text-red-500",
  Reto: "text-blue-400",
  Comision: "text-muted",
};

const statusConfig: Record<TxStatus, { color: string; icon: React.ReactNode }> = {
  Completado: { color: "text-success", icon: <IconCheck /> },
  Procesando: { color: "text-warning", icon: <IconClock /> },
  Fallido: { color: "text-red-500", icon: <IconX /> },
};

/* ── Component ────────────────────────────────────────────────── */
export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"depositar" | "retirar">("depositar");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

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
          <p className="text-4xl sm:text-5xl font-bold text-gradient tracking-tight">$0.00</p>
          <p className="text-sm text-muted mt-2">Fondos en Garantia: $0.00</p>
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
                  ? "bg-gradient-main text-white shadow-lg"
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
                <div className="flex items-center gap-3 p-4 bg-surface-2 border border-border rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <span className="text-blue-400 text-xs font-bold">S</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Stripe</p>
                    <p className="text-xs text-muted">Tarjeta de credito/debito</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-surface-2 border border-border rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <span className="text-red-400 text-xs font-bold">OP</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">OpenPay</p>
                    <p className="text-xs text-muted">OXXO, SPEI, tarjeta</p>
                  </div>
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

            <button className="w-full py-3.5 bg-gradient-main text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
              Confirmar Deposito
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
              <p className="text-xs text-muted mt-2">Disponible: $185.50</p>
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

            <button className="w-full py-3.5 bg-gradient-main text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
              Solicitar Retiro
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
                {transactions.map((tx, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                  >
                    <td className="px-6 py-3.5 text-muted whitespace-nowrap">{tx.fecha}</td>
                    <td className="px-6 py-3.5">
                      <span className={`font-medium ${typeColor[tx.tipo]}`}>{tx.tipo}</span>
                    </td>
                    <td className="px-6 py-3.5 text-foreground">{tx.descripcion}</td>
                    <td className={`px-6 py-3.5 text-right font-mono font-semibold ${
                      tx.monto.startsWith("+") ? "text-success" : "text-red-400"
                    }`}>
                      {tx.monto}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`inline-flex items-center gap-1.5 ${statusConfig[tx.estado].color}`}>
                        {statusConfig[tx.estado].icon}
                        <span className="text-xs font-medium">{tx.estado}</span>
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
