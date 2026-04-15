"use client";

import { useState, useEffect } from "react";

/* ── SVG Icons ───────────────────────────────────────────────── */
const IconDiscord = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);
const IconLink = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
);
const IconRefresh = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
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

/* ── Data (empty — real data comes from backend) ─────────────── */
const stats = [
  { label: "Victorias", value: "0", color: "text-success", icon: <IconTrophy /> },
  { label: "Derrotas", value: "0", color: "text-red-500", icon: <IconTarget /> },
  { label: "% Victorias", value: "0%", color: "text-blue-500", icon: <IconTrendUp /> },
  { label: "Ganancias", value: "$0.00", color: "text-gradient", icon: <IconCoin /> },
];

const rankingBreakdown = [
  { label: "Impacto", value: 0, weight: "50%", color: "from-red-500 to-red-400" },
  { label: "Placement", value: 0, weight: "25%", color: "from-blue-500 to-blue-400" },
  { label: "Consistencia", value: 0, weight: "15%", color: "from-green-500 to-green-400" },
  { label: "Team Success", value: 0, weight: "10%", color: "from-purple-500 to-purple-400" },
];

interface Match {
  oponente: string;
  modalidad: string;
  monto: string;
  resultado: "Victoria" | "Derrota";
  premio: string;
}

const recentMatches: Match[] = [];

const tournaments: { nombre: string; fecha: string; posicion: string; premio: string; participantes: number }[] = [];

/* ── Component ────────────────────────────────────────────────── */
export default function PerfilPage() {
  const [activeSection, setActiveSection] = useState<"partidas" | "torneos">("partidas");
  const [user, setUser] = useState<{ username: string; avatar: string; provider: string } | null>(null);
  const [codStats, setCodStats] = useState<{
    kdRatio: number; wins: number; gamesPlayed: number; kills: number; deaths: number;
  } | null>(null);
  const [codLoading, setCodLoading] = useState(false);
  const [activisionId, setActivisionId] = useState("");
  const [codLinked, setCodLinked] = useState(false);

  useEffect(() => {
    // Read user cookie
    try {
      const cookie = document.cookie.split("; ").find(c => c.startsWith("phoenix_user="));
      if (cookie) {
        const data = JSON.parse(decodeURIComponent(cookie.split("=").slice(1).join("=")));
        setUser(data);
      }
    } catch { /* no session */ }
  }, []);

  const lookupCod = async () => {
    if (!activisionId) return;
    setCodLoading(true);
    try {
      const res = await fetch(`/api/cod?username=${encodeURIComponent(activisionId)}&platform=uno`);
      if (res.ok) {
        const data = await res.json();
        const lt = data.data.lifetime;
        setCodStats({ kdRatio: lt.kdRatio, wins: lt.wins, gamesPlayed: lt.gamesPlayed, kills: lt.kills, deaths: lt.deaths });
        setCodLinked(true);
      }
    } catch { /* ignore */ }
    setCodLoading(false);
  };

  const displayName = user?.username || "GeroBeta";
  const avatarUrl = user?.avatar;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ── Profile Header ──────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-20 h-20 rounded-full shadow-lg shrink-0 border-2 border-border" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-main flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold">{displayName}</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Calibrando
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-success/15 text-success border border-success/30 flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                  Activo
                </span>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-muted">
                <span>Game ID: <span className="text-foreground font-mono">#PA-00142</span></span>
                <span>Region: <span className="text-foreground">LATAM Norte</span></span>
                <span>Miembro desde: <span className="text-foreground">Enero 2026</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Linked Accounts ─────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
            <IconLink /> Cuentas vinculadas
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Discord */}
            <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
              user?.provider === "discord" ? "border-[#5865F2]/40 bg-[#5865F2]/5" : "border-border bg-surface-2"
            }`}>
              <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center shrink-0">
                <IconDiscord className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Discord</p>
                {user?.provider === "discord" ? (
                  <p className="text-xs text-success flex items-center gap-1"><IconCheck /> Conectado como {user.username}</p>
                ) : (
                  <p className="text-xs text-muted">No vinculado</p>
                )}
              </div>
              {user?.provider !== "discord" && (
                <a href="/api/auth/discord" className="text-xs px-3 py-1.5 rounded-lg bg-[#5865F2] text-white font-medium hover:bg-[#4752C4] transition-colors">
                  Vincular
                </a>
              )}
            </div>

            {/* Activision / COD */}
            <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
              codLinked ? "border-success/40 bg-success/5" : "border-border bg-surface-2"
            }`}>
              <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><line x1="15" y1="13" x2="15.01" y2="13" /><line x1="18" y1="11" x2="18.01" y2="11" /><rect x="2" y="6" width="20" height="12" rx="5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Activision ID</p>
                {codLinked ? (
                  <p className="text-xs text-success flex items-center gap-1"><IconCheck /> {activisionId}</p>
                ) : (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={activisionId}
                      onChange={(e) => setActivisionId(e.target.value)}
                      placeholder="Usuario#1234567"
                      className="bg-surface-3 border border-border rounded-lg px-2.5 py-1 text-xs text-foreground placeholder:text-muted/50 w-40 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={lookupCod}
                      disabled={codLoading || !activisionId}
                      className="text-xs px-3 py-1 rounded-lg bg-surface-3 border border-border text-foreground font-medium hover:bg-border/50 disabled:opacity-40 transition-colors"
                    >
                      {codLoading ? "..." : "Vincular"}
                    </button>
                  </div>
                )}
              </div>
              {codLinked && (
                <button onClick={() => { setCodLinked(false); setCodStats(null); }} className="text-muted hover:text-foreground transition-colors">
                  <IconRefresh />
                </button>
              )}
            </div>
          </div>

          {/* COD Stats Card (shown when linked) */}
          {codLinked && codStats && (
            <div className="mt-4 bg-surface-2 border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Estadisticas de Warzone</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">{codStats.kdRatio.toFixed(2)}</p>
                  <p className="text-xs text-muted">K/D Ratio</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{codStats.kills.toLocaleString()}</p>
                  <p className="text-xs text-muted">Kills Totales</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{codStats.deaths.toLocaleString()}</p>
                  <p className="text-xs text-muted">Muertes</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-success">{codStats.wins.toLocaleString()}</p>
                  <p className="text-xs text-muted">Victorias</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{codStats.gamesPlayed.toLocaleString()}</p>
                  <p className="text-xs text-muted">Partidas</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Calibration Banner ─────────────────────────────── */}
        <div className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-blue-500/15 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-400 mb-1">Periodo de calibracion</h3>
            <p className="text-xs text-muted leading-relaxed">
              Tu score esta en proceso de calibracion. Necesitas un minimo de 4 partidas competitivas para que tu clasificacion se estabilice. Mientras tanto, tu score se mezcla con el promedio de la plataforma para evitar clasificaciones prematuras.
            </p>
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
              <p className="text-4xl sm:text-5xl font-bold text-gradient">--</p>
              <p className="text-sm text-muted mt-1">Score Final</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">--</p>
              <p className="text-sm text-muted mt-1">Rank General</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-3xl font-bold text-blue-400">--</p>
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
          recentMatches.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-muted/40"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" strokeLinecap="round" /><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" strokeLinecap="round" /><path d="M6 3h12v7a6 6 0 0 1-12 0V3z" strokeLinecap="round" /><path d="M12 16v3" strokeLinecap="round" /><path d="M8 22h8" strokeLinecap="round" /></svg>
              <h3 className="text-lg font-semibold mb-1">Sin partidas todavia</h3>
              <p className="text-sm text-muted">Acepta o crea un reto para comenzar tu historial competitivo</p>
            </div>
          ) : (
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
          )
        ) : (
          /* ── Tournament History ────────────────────────────── */
          tournaments.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-muted/40"><rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" /><line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" /><line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" /><line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" /></svg>
              <h3 className="text-lg font-semibold mb-1">Sin torneos todavia</h3>
              <p className="text-sm text-muted">Inscribete a un torneo para comenzar a competir</p>
            </div>
          ) : (
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
          )
        )}

        {/* ── Activity Section ────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5 card-hover">
            <div className="flex items-center gap-2 text-muted mb-3">
              <IconClock />
              <span className="text-xs font-medium uppercase tracking-wider">Ultimo acceso</span>
            </div>
            <p className="font-semibold">Ahora</p>
            <p className="text-xs text-muted mt-0.5">Sesion activa</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 card-hover">
            <div className="flex items-center gap-2 text-muted mb-3">
              <IconGamepad />
              <span className="text-xs font-medium uppercase tracking-wider">Partidas del mes</span>
            </div>
            <p className="font-semibold text-2xl">0</p>
            <p className="text-xs text-muted mt-0.5">Juega tu primera partida</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 card-hover">
            <div className="flex items-center gap-2 text-muted mb-3">
              <IconFlame />
              <span className="text-xs font-medium uppercase tracking-wider">Racha actual</span>
            </div>
            <p className="font-semibold text-2xl text-muted">Sin racha</p>
            <p className="text-xs text-muted mt-0.5">Compite para iniciar</p>
          </div>
        </div>

      </div>
    </div>
  );
}
