"use client";

import { useState } from "react";

/* ───── SVG Icons ───── */
function LayoutDashboardIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function ShieldIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function DollarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function UsersIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

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

function ActivityIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function AlertCircleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ChevronDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function GamepadIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="6" y1="11" x2="10" y2="11" /><line x1="8" y1="9" x2="8" y2="13" />
      <line x1="15" y1="12" x2="15.01" y2="12" /><line x1="18" y1="10" x2="18.01" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5Z" />
    </svg>
  );
}

function BarChartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EyeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function BanIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

/* ───── Data ───── */
type Section = "dashboard" | "disputas" | "transacciones" | "usuarios" | "torneos" | "actividad";

const sidebarItems: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon className="h-4 w-4" /> },
  { key: "disputas", label: "Disputas", icon: <ShieldIcon className="h-4 w-4" /> },
  { key: "transacciones", label: "Transacciones", icon: <DollarIcon className="h-4 w-4" /> },
  { key: "usuarios", label: "Usuarios", icon: <UsersIcon className="h-4 w-4" /> },
  { key: "torneos", label: "Torneos", icon: <TrophyIcon className="h-4 w-4" /> },
  { key: "actividad", label: "Actividad", icon: <ActivityIcon className="h-4 w-4" /> },
];

const metrics = [
  { label: "Matches Hoy", value: "0", icon: <GamepadIcon className="h-5 w-5" />, color: "text-blue-400" },
  { label: "Matches Semana", value: "0", icon: <BarChartIcon className="h-5 w-5" />, color: "text-foreground" },
  { label: "Volumen Semanal", value: "$0", icon: <DollarIcon className="h-5 w-5" />, color: "text-success" },
  { label: "Disputas Pendientes", value: "0", icon: <AlertCircleIcon className="h-5 w-5" />, color: "text-red-400", highlight: false },
  { label: "Usuarios Activos", value: "0", icon: <UsersIcon className="h-5 w-5" />, color: "text-blue-400" },
  { label: "Tasa Disputas", value: "0%", icon: <ShieldIcon className="h-5 w-5" />, color: "text-muted" },
];

const dailyMatches = [
  { day: "Lun", count: 0, max: 1 },
  { day: "Mar", count: 0, max: 1 },
  { day: "Mie", count: 0, max: 1 },
  { day: "Jue", count: 0, max: 1 },
  { day: "Vie", count: 0, max: 1 },
  { day: "Sab", count: 0, max: 1 },
  { day: "Dom", count: 0, max: 1 },
];

const disputes: { id: number; playerA: string; playerB: string; game: string; amount: string; time: string; status: string }[] = [];

const transactions: { id: string; user: string; type: string; method: string; amount: string; status: string; date: string }[] = [];

const users: { id: number; username: string; email: string; tier: string; balance: string; matches: number; status: "Activo" | "Suspendido" | "Pendiente"; joined: string }[] = [];

const adminTournaments: { id: number; name: string; status: string; participants: string; prize: string; game: string }[] = [];

const activityLog: { time: string; user: string; action: string; detail: string; ip: string }[] = [];

/* ───── Helpers ───── */
function txStatusColor(status: string) {
  if (status === "Completada") return "text-success bg-success/15";
  if (status === "Procesando") return "text-warning bg-warning/15";
  if (status === "Fallida") return "text-red-400 bg-red-500/15";
  return "text-muted bg-surface-3";
}

function userStatusColor(status: "Activo" | "Suspendido" | "Pendiente") {
  if (status === "Activo") return "text-success bg-success/15";
  if (status === "Suspendido") return "text-red-400 bg-red-500/15";
  return "text-warning bg-warning/15";
}

/* ───── Page ───── */
export default function AdminPage() {
  const [section, setSection] = useState<Section>("dashboard");
  const [expandedDispute, setExpandedDispute] = useState<number | null>(null);
  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const [txFilter, setTxFilter] = useState<string>("Todos");
  const [txStatusFilter, setTxStatusFilter] = useState<string>("Todos");

  const filteredTx = transactions.filter((t) => {
    if (txFilter !== "Todos" && t.type !== txFilter) return false;
    if (txStatusFilter !== "Todos" && t.status !== txStatusFilter) return false;
    return true;
  });

  return (
    <div className="pt-16 min-h-dvh flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <ShieldIcon className="h-6 w-6 text-red-400" />
          <h1 className="text-xl font-bold text-foreground">Panel de Administracion</h1>
          <span className="badge-pro text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">ADMIN</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex w-56 bg-surface-2 border-r border-border flex-col shrink-0">
          <nav className="p-3 space-y-0.5 sticky top-20">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left ${
                  section === item.key
                    ? "bg-surface-3 text-foreground"
                    : "text-muted hover:text-foreground hover:bg-surface-3/50"
                }`}
              >
                {item.icon}
                {item.label}
                {item.key === "disputas" && (
                  <span className="ml-auto text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">3</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="lg:hidden overflow-x-auto border-b border-border bg-surface-2">
          <div className="flex p-1 gap-0.5 min-w-max">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  section === item.key
                    ? "bg-surface-3 text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-6xl">
            {/* Dashboard */}
            {section === "dashboard" && (
              <div className="space-y-8">
                {/* Metrics */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                  {metrics.map((m, i) => (
                    <div key={i} className={`bg-surface border rounded-xl p-4 ${m.highlight ? "border-red-500/30" : "border-border"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted uppercase tracking-wide">{m.label}</span>
                        <span className={m.color}>{m.icon}</span>
                      </div>
                      <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div className="bg-surface border border-border rounded-xl p-5">
                  <h3 className="font-bold text-foreground mb-4">Matches diarios esta semana</h3>
                  <div className="flex items-end gap-3 h-40">
                    {dailyMatches.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-xs text-muted font-medium">{d.count}</span>
                        <div className="w-full rounded-t-md bg-gradient-main transition-all" style={{ height: `${(d.count / d.max) * 100}%` }} />
                        <span className="text-[10px] text-muted">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Disputas */}
            {section === "disputas" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Disputas activas</h2>
                <div className="space-y-3">
                  {disputes.map((d) => (
                    <div key={d.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                      <button
                        className="w-full p-4 flex items-center gap-4 text-left"
                        onClick={() => setExpandedDispute(expandedDispute === d.id ? null : d.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-sm">Disputa #{d.id}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              d.status === "en_revision" ? "bg-warning/15 text-warning" : "bg-red-500/15 text-red-400"
                            }`}>{d.status === "en_revision" ? "En Revision" : "Pendiente"}</span>
                          </div>
                          <p className="text-xs text-muted mt-0.5">{d.playerA} vs {d.playerB} - {d.game} - {d.amount}</p>
                        </div>
                        <span className="text-xs text-muted shrink-0">{d.time}</span>
                        <ChevronDownIcon className={`h-4 w-4 text-muted transition-transform shrink-0 ${expandedDispute === d.id ? "rotate-180" : ""}`} />
                      </button>

                      {expandedDispute === d.id && (
                        <div className="px-4 pb-4 border-t border-border">
                          <div className="pt-4 space-y-4">
                            {/* Evidence placeholders */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-surface-2 border border-border rounded-lg p-3 text-center">
                                <p className="text-xs font-semibold text-foreground mb-1">{d.playerA}</p>
                                <div className="h-20 bg-surface-3 rounded flex items-center justify-center">
                                  <span className="text-xs text-muted">Evidencia</span>
                                </div>
                                <p className="text-[10px] text-muted mt-1">Reporto: Victoria</p>
                              </div>
                              <div className="bg-surface-2 border border-border rounded-lg p-3 text-center">
                                <p className="text-xs font-semibold text-foreground mb-1">{d.playerB}</p>
                                <div className="h-20 bg-surface-3 rounded flex items-center justify-center">
                                  <span className="text-xs text-muted">Evidencia</span>
                                </div>
                                <p className="text-[10px] text-muted mt-1">Reporto: Victoria</p>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-surface-2 rounded-lg p-3 text-xs space-y-1.5 text-muted">
                              <p>3:15 PM - {d.playerA} reporto victoria</p>
                              <p>3:18 PM - {d.playerB} reporto victoria</p>
                              <p>3:18 PM - Disputa abierta automaticamente</p>
                            </div>

                            {/* Resolution buttons */}
                            <div className="flex gap-2 flex-wrap">
                              <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-success/15 text-success border border-success/30 hover:bg-success/25 transition-colors">
                                {d.playerA} Gana
                              </button>
                              <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors">
                                {d.playerB} Gana
                              </button>
                              <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface-3 text-muted border border-border hover:bg-surface-2 transition-colors">
                                Anular
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transacciones */}
            {section === "transacciones" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-lg font-bold text-foreground">Transacciones</h2>
                  <div className="flex gap-2">
                    <select
                      value={txFilter}
                      onChange={(e) => setTxFilter(e.target.value)}
                      className="bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground"
                    >
                      <option>Todos</option>
                      <option>Deposito</option>
                      <option>Retiro</option>
                      <option>Premio</option>
                      <option>Entrada</option>
                    </select>
                    <select
                      value={txStatusFilter}
                      onChange={(e) => setTxStatusFilter(e.target.value)}
                      className="bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground"
                    >
                      <option>Todos</option>
                      <option>Completada</option>
                      <option>Procesando</option>
                      <option>Fallida</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
                        <th className="pb-3 pr-4 font-semibold">ID</th>
                        <th className="pb-3 pr-4 font-semibold">Usuario</th>
                        <th className="pb-3 pr-4 font-semibold">Tipo</th>
                        <th className="pb-3 pr-4 font-semibold">Metodo</th>
                        <th className="pb-3 pr-4 font-semibold">Monto</th>
                        <th className="pb-3 pr-4 font-semibold">Estado</th>
                        <th className="pb-3 font-semibold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTx.map((t) => (
                        <tr key={t.id} className="border-b border-border/50">
                          <td className="py-3 pr-4 font-mono text-xs text-muted">{t.id}</td>
                          <td className="py-3 pr-4 font-medium text-foreground">{t.user}</td>
                          <td className="py-3 pr-4 text-muted">{t.type}</td>
                          <td className="py-3 pr-4 text-muted">{t.method}</td>
                          <td className={`py-3 pr-4 font-semibold ${t.amount.startsWith("+") ? "text-success" : "text-red-400"}`}>{t.amount}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${txStatusColor(t.status)}`}>{t.status}</span>
                          </td>
                          <td className="py-3 text-xs text-muted whitespace-nowrap">{t.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Usuarios */}
            {section === "usuarios" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Usuarios registrados</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
                        <th className="pb-3 pr-4 font-semibold">Usuario</th>
                        <th className="pb-3 pr-4 font-semibold">Tier</th>
                        <th className="pb-3 pr-4 font-semibold">Balance</th>
                        <th className="pb-3 pr-4 font-semibold">Matches</th>
                        <th className="pb-3 pr-4 font-semibold">Estado</th>
                        <th className="pb-3 pr-4 font-semibold">Registro</th>
                        <th className="pb-3 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-border/50">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-foreground">{u.username}</p>
                            <p className="text-[10px] text-muted">{u.email}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              u.tier === "Pro" ? "badge-pro" : u.tier === "Amateur" ? "badge-am" : "badge-detri"
                            }`}>{u.tier}</span>
                          </td>
                          <td className="py-3 pr-4 font-medium text-foreground">{u.balance}</td>
                          <td className="py-3 pr-4 text-muted">{u.matches}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${userStatusColor(u.status)}`}>{u.status}</span>
                          </td>
                          <td className="py-3 pr-4 text-xs text-muted whitespace-nowrap">{u.joined}</td>
                          <td className="py-3">
                            <div className="flex gap-1.5">
                              <button className="p-1.5 rounded-md bg-surface-2 border border-border text-muted hover:text-foreground transition-colors" title="Ver perfil">
                                <EyeIcon className="h-3.5 w-3.5" />
                              </button>
                              <button className="p-1.5 rounded-md bg-surface-2 border border-border text-muted hover:text-red-400 transition-colors" title="Suspender">
                                <BanIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Torneos */}
            {section === "torneos" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Gestion de torneos</h2>
                  <button
                    onClick={() => setShowCreateTournament(!showCreateTournament)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-main text-white hover:opacity-90 transition-opacity"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    {showCreateTournament ? "Cancelar" : "Crear torneo"}
                  </button>
                </div>

                {/* Create form */}
                {showCreateTournament && (
                  <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                    <h3 className="font-bold text-foreground">Nuevo torneo</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs text-muted mb-1.5">Nombre</label>
                        <input type="text" placeholder="Ej: Copa Phoenix #13" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/50" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1.5">Juego</label>
                        <select className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                          <option>FIFA 25</option>
                          <option>Fortnite</option>
                          <option>Call of Duty: Warzone</option>
                          <option>Rocket League</option>
                          <option>Valorant</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1.5">Formato</label>
                        <select className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                          <option>Eliminacion directa</option>
                          <option>Eliminacion doble</option>
                          <option>Liga</option>
                          <option>Suizo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1.5">Participantes max</label>
                        <input type="number" placeholder="16" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/50" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1.5">Entrada ($)</label>
                        <input type="number" placeholder="15" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/50" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1.5">Fecha inicio</label>
                        <input type="datetime-local" className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                      </div>
                    </div>
                    <button className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-main text-white hover:opacity-90 transition-opacity">
                      Crear Torneo
                    </button>
                  </div>
                )}

                {/* Tournament list */}
                <div className="space-y-3">
                  {adminTournaments.map((t) => (
                    <div key={t.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <h3 className="font-semibold text-foreground text-sm">{t.name}</h3>
                        <p className="text-xs text-muted">{t.game} - {t.participants}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        t.status === "En Curso" ? "bg-success/15 text-success" : "bg-blue-500/15 text-blue-400"
                      }`}>{t.status}</span>
                      <span className="text-sm font-bold text-blue-400">{t.prize}</span>
                      <div className="flex gap-1.5">
                        <button className="p-1.5 rounded-md bg-surface-2 border border-border text-muted hover:text-foreground transition-colors" title="Ver detalle">
                          <EyeIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actividad */}
            {section === "actividad" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Registro de actividad</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
                        <th className="pb-3 pr-4 font-semibold">Hora</th>
                        <th className="pb-3 pr-4 font-semibold">Usuario</th>
                        <th className="pb-3 pr-4 font-semibold">Accion</th>
                        <th className="pb-3 pr-4 font-semibold">Detalle</th>
                        <th className="pb-3 font-semibold">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLog.map((a, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-3 pr-4 text-xs text-muted whitespace-nowrap">{a.time}</td>
                          <td className="py-3 pr-4 font-medium text-foreground">{a.user}</td>
                          <td className="py-3 pr-4 text-muted">{a.action}</td>
                          <td className="py-3 pr-4 text-muted text-xs">{a.detail}</td>
                          <td className="py-3 font-mono text-xs text-muted">{a.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
