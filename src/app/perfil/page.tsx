"use client";

import { useState } from "react";

/* ── SVG Icons ───────────────────────────────────────────────── */
const IconTrophy = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M6 3h12v7a6 6 0 0 1-12 0V3z"/><path d="M12 16v3"/><path d="M8 22h8"/><path d="M8 22a2 2 0 0 1-2-2v-1h12v1a2 2 0 0 1-2 2H8z"/></svg>
);
const IconTarget = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
const IconTrendUp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);
const IconCoin = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M15 9.5a3 3 0 0 0-3-2.5H9"/><path d="M9 14.5a3 3 0 0 0 3 2.5h3"/></svg>
);
const IconCrown = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20"/><path d="M3.5 16 2 8l5.5 4L12 4l4.5 8L22 8l-1.5 8H3.5z"/></svg>
);
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const IconFlame = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c.5 4-3 6-3 10a5 5 0 0 0 10 0c0-4-2-6-2-10"/><path d="M12 18a2 2 0 0 1-2-2c0-1.5 2-3 2-3s2 1.5 2 3a2 2 0 0 1-2 2z"/></svg>
);
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
);
const IconGamepad = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="5"/></svg>
);

/* ── Data ─────────────────────────────────────────────────────── */
const stats = [
  { label: "Victorias", value: "47", color: "text-success", icon: <IconTrophy /> },
  { label: "Derrotas", value: "18", color: "text-red-500", icon: <IconTarget /> },
  { label: "% Victorias", value: "72.3%", color: "text-blue-500", icon: <IconTrendUp /> },
  { label: "Ganancias", value: "$842.50", color: "text-gradient", icon: <IconCoin /> },
];

const rankingBreakdown = [
  { label: "Impacto", value: 88.2, weight: "50%", color: "from-red-500 to-red-400" },
  { label: "Placement", value: 82.5, weight: "25%", color: "from-blue-500 to-blue-400" },
  { label: "Consistencia", value: 91.0, weight: "15%", color: "from-green-500 to-green-400" },
  { label: "Team Success", value: 78.4, weight: "10%", color: "from-purple-500 to-purple-400" },
];

interface Match {
  oponente: string;
  modalidad: string;
  monto: string;
  resultado: "Victoria" | "Derrota";
  premio: string;
}

const recentMatches: Match[] = [
  { oponente: "ArrobaJota", modalidad: "1v1 Only Detri", monto: "$10.00", resultado: "Victoria", premio: "$18.00" },
  { oponente: "NexusFire", modalidad: "1v1 All Skills", monto: "$20.00", resultado: "Victoria", premio: "$36.00" },
  { oponente: "ShadowMX", modalidad: "1v1 Only Detri", monto: "$5.00", resultado: "Derrota", premio: "$0.00" },
  { oponente: "TurboDrake", modalidad: "2v2 Mixto", monto: "$15.00", resultado: "Victoria", premio: "$27.00" },
  { oponente: "PhantomKill", modalidad: "1v1 All Skills", monto: "$25.00", resultado: "Victoria", premio: "$45.00" },
  { oponente: "VelocityX", modalidad: "1v1 Only Detri", monto: "$10.00", resultado: "Derrota", premio: "$0.00" },
];

const tournaments = [
  { nombre: "Torneo Semanal #14", fecha: "20 Mar 2026", posicion: "1er Lugar", premio: "$150.00", participantes: 32 },
  { nombre: "Copa LATAM Norte", fecha: "15 Mar 2026", posicion: "3er Lugar", premio: "$50.00", participantes: 64 },
  { nombre: "Torneo Semanal #12", fecha: "6 Mar 2026", posicion: "2do Lugar", premio: "$75.00", participantes: 32 },
];

/* ── Component ────────────────────────────────────────────────── */
export default function PerfilPage() {
  const [activeSection, setActiveSection] = useState<"partidas" | "torneos">("partidas");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ── Profile Header ──────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-main flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg">
              GB
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold">GeroBeta</h1>
                <span className="badge-pro px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">PRO</span>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-muted">
                <span>Game ID: <span className="text-foreground font-mono">#PA-00142</span></span>
                <span>Region: <span className="text-foreground">LATAM Norte</span></span>
                <span>Miembro desde: <span className="text-foreground">Enero 2026</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface border border-border rounded-2xl p-5 card-hover">
              <div className="text-muted mb-2">{s.icon}</div>
              <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Ranking Card ────────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 glow">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-red-400"><IconCrown /></div>
            <h2 className="text-lg font-semibold">Phoenix Score</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="text-center sm:text-left">
              <p className="text-4xl sm:text-5xl font-bold text-gradient">87.4</p>
              <p className="text-sm text-muted mt-1">Score Final</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">#1</p>
              <p className="text-sm text-muted mt-1">Rank General</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-3xl font-bold text-blue-400">95.2%</p>
              <p className="text-sm text-muted mt-1">Percentil</p>
            </div>
          </div>
          {/* Breakdown bars */}
          <div className="space-y-4">
            {rankingBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted">{item.label} <span className="text-muted/60">({item.weight})</span></span>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs: Partidas / Torneos ────────────────────────── */}
        <div className="flex gap-1 bg-surface-2 p-1 rounded-xl border border-border w-fit">
          <button
            onClick={() => setActiveSection("partidas")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === "partidas"
                ? "bg-gradient-main text-white shadow"
                : "text-muted hover:text-foreground"
            }`}
          >
            Partidas Recientes
          </button>
          <button
            onClick={() => setActiveSection("torneos")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === "torneos"
                ? "bg-gradient-main text-white shadow"
                : "text-muted hover:text-foreground"
            }`}
          >
            Historial Torneos
          </button>
        </div>

        {/* ── Recent Matches Table ────────────────────────────── */}
        {activeSection === "partidas" ? (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted text-left">
                    <th className="px-6 py-3 font-medium">Oponente</th>
                    <th className="px-6 py-3 font-medium">Modalidad</th>
                    <th className="px-6 py-3 font-medium">Monto</th>
                    <th className="px-6 py-3 font-medium">Resultado</th>
                    <th className="px-6 py-3 font-medium text-right">Premio</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMatches.map((m, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-foreground">{m.oponente}</td>
                      <td className="px-6 py-3.5 text-muted">{m.modalidad}</td>
                      <td className="px-6 py-3.5 font-mono text-muted">{m.monto}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          m.resultado === "Victoria"
                            ? "bg-success/10 text-success"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {m.resultado === "Victoria" ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          )}
                          {m.resultado}
                        </span>
                      </td>
                      <td className={`px-6 py-3.5 text-right font-mono font-semibold ${
                        m.premio !== "$0.00" ? "text-success" : "text-muted"
                      }`}>
                        {m.premio}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ── Tournament History ────────────────────────────── */
          <div className="grid gap-4">
            {tournaments.map((t, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-5 sm:p-6 card-hover">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{t.nombre}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-muted">
                      <span>{t.fecha}</span>
                      <span>{t.participantes} participantes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      i === 0 ? "bg-yellow-500/15 text-yellow-400" :
                      i === 2 ? "bg-blue-500/15 text-blue-400" :
                      "bg-orange-500/15 text-orange-400"
                    }`}>
                      {t.posicion}
                    </span>
                    <span className="font-mono font-bold text-success">{t.premio}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Activity Section ────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5 card-hover">
            <div className="flex items-center gap-2 text-muted mb-3">
              <IconClock />
              <span className="text-xs font-medium uppercase tracking-wider">Ultimo acceso</span>
            </div>
            <p className="font-semibold">Hace 2 horas</p>
            <p className="text-xs text-muted mt-0.5">27 Mar 2026, 14:30</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 card-hover">
            <div className="flex items-center gap-2 text-muted mb-3">
              <IconGamepad />
              <span className="text-xs font-medium uppercase tracking-wider">Partidas del mes</span>
            </div>
            <p className="font-semibold text-2xl">23</p>
            <p className="text-xs text-muted mt-0.5">Promedio: 5.8 por semana</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 card-hover">
            <div className="flex items-center gap-2 text-muted mb-3">
              <IconFlame />
              <span className="text-xs font-medium uppercase tracking-wider">Racha actual</span>
            </div>
            <p className="font-semibold text-2xl text-success">5 Victorias</p>
            <p className="text-xs text-muted mt-0.5">Mejor racha: 9 victorias</p>
          </div>
        </div>

      </div>
    </div>
  );
}
