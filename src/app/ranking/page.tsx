"use client";

import { useState, useMemo } from "react";

/* ── SVG Icons ───────────────────────────────────────────────── */
const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const IconUsers = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconStar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const IconAward = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
);
const IconBarChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
);
const IconTrendUp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);
const IconDatabase = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
);
const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
);
const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IconTarget = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
const IconPodium = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="14" width="6" height="8"/><rect x="9" y="8" width="6" height="14"/><rect x="16" y="11" width="6" height="11"/></svg>
);
const IconRepeat = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
);
const IconHandshake = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17l-1.5 1.5a2.12 2.12 0 0 1-3 0L4 16a2.12 2.12 0 0 1 0-3L7 10"/><path d="M13 7l1.5-1.5a2.12 2.12 0 0 1 3 0L20 8a2.12 2.12 0 0 1 0 3L17 14"/><path d="M7 10l7 7"/><path d="M2 2l4 4"/><path d="M18 18l4 4"/></svg>
);

/* ── Medal icons for top 3 ────────────────────────────────────── */
const MedalGold = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" fill="#eab308" fillOpacity="0.15" stroke="#eab308"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#eab308">1</text>
  </svg>
);
const MedalSilver = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" fill="#94a3b8" fillOpacity="0.15" stroke="#94a3b8"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#94a3b8">2</text>
  </svg>
);
const MedalBronze = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" fill="#d97706" fillOpacity="0.15" stroke="#d97706"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#d97706">3</text>
  </svg>
);

/* ── Data ─────────────────────────────────────────────────────── */
type Tier = "PRO" | "AM" | "Detri";

interface Player {
  rank: number;
  nombre: string;
  tier: Tier;
  participaciones: number;
  impacto: number;
  placement: number;
  consistencia: number;
  teamSuccess: number;
  scoreFinal: number;
  percentil: number;
}

const players: Player[] = [
  { rank: 1, nombre: "GeroBeta", tier: "PRO", participaciones: 42, impacto: 88.2, placement: 82.5, consistencia: 91.0, teamSuccess: 78.4, scoreFinal: 87.4, percentil: 95.2 },
  { rank: 2, nombre: "ArrobaJota", tier: "PRO", participaciones: 38, impacto: 85.1, placement: 84.0, consistencia: 87.3, teamSuccess: 80.2, scoreFinal: 85.1, percentil: 93.8 },
  { rank: 3, nombre: "NexusFire", tier: "PRO", participaciones: 35, impacto: 82.6, placement: 80.1, consistencia: 85.7, teamSuccess: 82.0, scoreFinal: 82.5, percentil: 91.0 },
  { rank: 4, nombre: "Juancho", tier: "PRO", participaciones: 40, impacto: 80.4, placement: 78.2, consistencia: 83.1, teamSuccess: 75.8, scoreFinal: 79.8, percentil: 88.5 },
  { rank: 5, nombre: "ShadowMX", tier: "PRO", participaciones: 33, impacto: 78.9, placement: 76.5, consistencia: 80.2, teamSuccess: 77.1, scoreFinal: 78.2, percentil: 86.1 },
  { rank: 6, nombre: "TurboDrake", tier: "AM", participaciones: 28, impacto: 72.3, placement: 68.4, consistencia: 74.1, teamSuccess: 70.5, scoreFinal: 71.2, percentil: 75.3 },
  { rank: 7, nombre: "PhantomKill", tier: "AM", participaciones: 30, impacto: 70.1, placement: 66.8, consistencia: 72.5, teamSuccess: 68.2, scoreFinal: 69.5, percentil: 72.1 },
  { rank: 8, nombre: "VelocityX", tier: "AM", participaciones: 25, impacto: 68.4, placement: 64.2, consistencia: 70.8, teamSuccess: 65.1, scoreFinal: 67.3, percentil: 68.5 },
  { rank: 9, nombre: "StormRider", tier: "AM", participaciones: 22, impacto: 65.2, placement: 62.1, consistencia: 68.3, teamSuccess: 63.7, scoreFinal: 64.5, percentil: 64.0 },
  { rank: 10, nombre: "AceMexico", tier: "AM", participaciones: 20, impacto: 60.8, placement: 58.3, consistencia: 64.2, teamSuccess: 60.1, scoreFinal: 60.5, percentil: 56.2 },
  { rank: 11, nombre: "BlitzGamer", tier: "AM", participaciones: 18, impacto: 55.4, placement: 52.7, consistencia: 58.1, teamSuccess: 54.8, scoreFinal: 55.0, percentil: 48.3 },
  { rank: 12, nombre: "NovaPulse", tier: "Detri", participaciones: 15, impacto: 42.3, placement: 38.5, consistencia: 45.1, teamSuccess: 40.2, scoreFinal: 41.5, percentil: 35.8 },
  { rank: 13, nombre: "ThunderCR", tier: "Detri", participaciones: 12, impacto: 38.7, placement: 35.2, consistencia: 40.8, teamSuccess: 36.4, scoreFinal: 37.8, percentil: 28.4 },
  { rank: 14, nombre: "ViperLATAM", tier: "Detri", participaciones: 10, impacto: 32.1, placement: 30.4, consistencia: 35.2, teamSuccess: 28.8, scoreFinal: 31.8, percentil: 20.1 },
  { rank: 15, nombre: "CometRush", tier: "Detri", participaciones: 8, impacto: 28.5, placement: 25.1, consistencia: 30.4, teamSuccess: 25.2, scoreFinal: 27.5, percentil: 12.6 },
];

const dashboardStats = [
  { label: "Jugadores Unicos", value: "156", icon: <IconUsers />, color: "text-foreground" },
  { label: "Elegibles", value: "89", icon: <IconStar />, color: "text-blue-400" },
  { label: "PRO", value: "18", icon: <IconAward />, color: "text-red-400" },
  { label: "AM", value: "36", icon: <IconBarChart />, color: "text-blue-500" },
  { label: "Detri", value: "35", icon: <IconTrendUp />, color: "text-muted" },
  { label: "Registros", value: "2,450", icon: <IconDatabase />, color: "text-foreground" },
];

const lsfTable = [
  { tipo: "Only Detri", factor: "1.0" },
  { tipo: "All Skills", factor: "1.5" },
  { tipo: "Evento", factor: "1.5" },
  { tipo: "Mixto", factor: "1.3" },
  { tipo: "Novice", factor: "0.9" },
];

const tierBadge: Record<Tier, string> = {
  PRO: "badge-pro",
  AM: "badge-am",
  Detri: "badge-detri",
};

/* ── Component ────────────────────────────────────────────────── */
export default function RankingPage() {
  const [filterTorneo, setFilterTorneo] = useState("todos");
  const [filterElegibilidad, setFilterElegibilidad] = useState("todos");
  const [filterTier, setFilterTier] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (filterTier !== "todos" && p.tier !== filterTier) return false;
      if (filterElegibilidad === "elegible" && p.participaciones < 4) return false;
      if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [filterTorneo, filterElegibilidad, filterTier, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient">Ranking Phoenix Arena</h1>
          <p className="text-muted max-w-2xl mx-auto">
            Sistema competitivo basado en desempeno real. Cada metrica refleja tu nivel de juego.
          </p>
        </div>

        {/* ── Dashboard Stats ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {dashboardStats.map((s) => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4 text-center card-hover">
              <div className={`${s.color} flex justify-center mb-2`}>{s.icon}</div>
              <p className="text-xl sm:text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ─────────────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Tipo Torneo */}
            <div className="relative">
              <label className="text-xs text-muted mb-1 block">Tipo Torneo</label>
              <div className="relative">
                <select
                  value={filterTorneo}
                  onChange={(e) => setFilterTorneo(e.target.value)}
                  className="w-full appearance-none bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-red-500 transition-colors pr-8"
                >
                  <option value="todos">Todos</option>
                  <option value="detri">Only Detri</option>
                  <option value="skills">All Skills</option>
                  <option value="evento">Evento</option>
                  <option value="mixto">Mixto</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted"><IconChevron /></div>
              </div>
            </div>
            {/* Elegibilidad */}
            <div>
              <label className="text-xs text-muted mb-1 block">Elegibilidad</label>
              <div className="relative">
                <select
                  value={filterElegibilidad}
                  onChange={(e) => setFilterElegibilidad(e.target.value)}
                  className="w-full appearance-none bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-red-500 transition-colors pr-8"
                >
                  <option value="todos">Todos</option>
                  <option value="elegible">Elegibles (4+ participaciones)</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted"><IconChevron /></div>
              </div>
            </div>
            {/* Tier */}
            <div>
              <label className="text-xs text-muted mb-1 block">Tier</label>
              <div className="relative">
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="w-full appearance-none bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-red-500 transition-colors pr-8"
                >
                  <option value="todos">Todos</option>
                  <option value="PRO">PRO</option>
                  <option value="AM">AM</option>
                  <option value="Detri">Detri</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted"><IconChevron /></div>
              </div>
            </div>
            {/* Search */}
            <div>
              <label className="text-xs text-muted mb-1 block">Buscar Jugador</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><IconSearch /></div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nombre..."
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-2 border border-border rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Ranking Table ──────────────────────────────── */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden glow">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold">Tabla de Clasificacion</h2>
            <p className="text-sm text-muted mt-0.5">{filteredPlayers.length} jugadores encontrados</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-left bg-surface-2/50">
                  <th className="px-4 py-3 font-semibold text-center w-16">Rank</th>
                  <th className="px-4 py-3 font-semibold">Jugador</th>
                  <th className="px-4 py-3 font-semibold text-center">Tier</th>
                  <th className="px-4 py-3 font-semibold text-center">Part.</th>
                  <th className="px-4 py-3 font-semibold text-center">Impacto</th>
                  <th className="px-4 py-3 font-semibold text-center">Placement</th>
                  <th className="px-4 py-3 font-semibold text-center">Consist.</th>
                  <th className="px-4 py-3 font-semibold text-center">Team S.</th>
                  <th className="px-4 py-3 font-semibold text-center">Score Final</th>
                  <th className="px-4 py-3 font-semibold text-center">Percentil</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((p) => (
                  <tr
                    key={p.rank}
                    onClick={() => setSelectedPlayer(p)}
                    className={`border-b border-border/40 cursor-pointer transition-colors hover:bg-surface-2/60 ${
                      p.rank <= 3 ? "bg-surface-2/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center">
                      {p.rank === 1 ? <span className="inline-flex justify-center"><MedalGold /></span> :
                       p.rank === 2 ? <span className="inline-flex justify-center"><MedalSilver /></span> :
                       p.rank === 3 ? <span className="inline-flex justify-center"><MedalBronze /></span> :
                       <span className="text-muted font-mono">{p.rank}</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`font-semibold ${p.rank <= 3 ? "text-foreground" : ""}`}>{p.nombre}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`${tierBadge[p.tier]} px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider`}>
                        {p.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-muted">{p.participaciones}</td>
                    <td className="px-4 py-3.5 text-center font-mono">{p.impacto.toFixed(1)}</td>
                    <td className="px-4 py-3.5 text-center font-mono">{p.placement.toFixed(1)}</td>
                    <td className="px-4 py-3.5 text-center font-mono">{p.consistencia.toFixed(1)}</td>
                    <td className="px-4 py-3.5 text-center font-mono">{p.teamSuccess.toFixed(1)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-bold text-gradient">{p.scoreFinal.toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`font-semibold ${
                        p.percentil >= 80 ? "text-success" :
                        p.percentil >= 40 ? "text-blue-400" :
                        "text-muted"
                      }`}>
                        {p.percentil.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Player Modal ────────────────────────────────────── */}
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedPlayer(null)}>
            <div
              className="bg-surface border border-border rounded-2xl w-full max-w-lg p-6 sm:p-8 glow-strong animate-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-main flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {selectedPlayer.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedPlayer.nombre}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`${tierBadge[selectedPlayer.tier]} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                        {selectedPlayer.tier}
                      </span>
                      <span className="text-xs text-muted">Rank #{selectedPlayer.rank}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedPlayer(null)} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors text-muted hover:text-foreground">
                  <IconX />
                </button>
              </div>

              {/* Score */}
              <div className="text-center mb-6">
                <p className="text-5xl font-bold text-gradient">{selectedPlayer.scoreFinal.toFixed(1)}</p>
                <p className="text-sm text-muted mt-1">Score Final  |  Percentil {selectedPlayer.percentil.toFixed(1)}%</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 mb-6">
                {[
                  { label: "Impacto (50%)", value: selectedPlayer.impacto, color: "from-red-500 to-red-400" },
                  { label: "Placement (25%)", value: selectedPlayer.placement, color: "from-blue-500 to-blue-400" },
                  { label: "Consistencia (15%)", value: selectedPlayer.consistencia, color: "from-green-500 to-green-400" },
                  { label: "Team Success (10%)", value: selectedPlayer.teamSuccess, color: "from-purple-500 to-purple-400" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted">{item.label}</span>
                      <span className="font-semibold">{item.value.toFixed(1)}</span>
                    </div>
                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-2 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold">{selectedPlayer.participaciones}</p>
                  <p className="text-xs text-muted">Participaciones</p>
                </div>
                <div className="bg-surface-2 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold">{selectedPlayer.percentil.toFixed(1)}%</p>
                  <p className="text-xs text-muted">Percentil</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            METHODOLOGY SECTION
            ═══════════════════════════════════════════════════════ */}
        <div className="space-y-8 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gradient">Metodologia del Ranking</h2>
            <p className="text-muted max-w-xl mx-auto text-sm">
              Transparencia total. Asi calculamos tu posicion competitiva.
            </p>
          </div>

          {/* ── Score Bar Visualization ────────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
            <h3 className="font-semibold mb-4">Composicion del Score</h3>
            <div className="flex h-10 rounded-xl overflow-hidden">
              <div className="bg-red-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: "50%" }}>
                Impacto 50%
              </div>
              <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: "25%" }}>
                Placement 25%
              </div>
              <div className="bg-green-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: "15%" }}>
                Consist. 15%
              </div>
              <div className="bg-purple-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: "10%" }}>
                Team 10%
              </div>
            </div>
          </div>

          {/* ── Formula ───────────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="font-semibold">Formula de Calculo</h3>
            <div className="bg-surface-2 border border-border-light rounded-xl p-5 font-mono text-sm space-y-3">
              <div>
                <span className="text-muted">BaseScore</span>
                <span className="text-foreground"> = </span>
                <span className="text-red-400">50%</span><span className="text-muted"> Impacto + </span>
                <span className="text-blue-400">25%</span><span className="text-muted"> Placement + </span>
                <span className="text-green-400">15%</span><span className="text-muted"> Consistencia + </span>
                <span className="text-purple-400">10%</span><span className="text-muted"> Team Success</span>
              </div>
              <div className="border-t border-border pt-3">
                <span className="text-gradient font-bold">ScoreAjustado</span>
                <span className="text-foreground"> = </span>
                <span className="text-muted">BaseScore</span>
                <span className="text-foreground"> x </span>
                <span className="text-red-400 font-bold">Factor LSF</span>
              </div>
            </div>
          </div>

          {/* ── 4 Component Cards ─────────────────────────────── */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400"><IconTarget /></div>
                <h4 className="font-semibold">Impacto (50%)</h4>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Mide tu contribucion directa al resultado de cada partida. Incluye kills, asistencias, dano realizado y objetivos completados. Es el componente mas importante porque refleja la habilidad individual pura.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><IconPodium /></div>
                <h4 className="font-semibold">Placement (25%)</h4>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Posicion final en el torneo o reto. Ganar importa, pero este componente tambien valora llegar lejos en brackets competitivos. Se normaliza segun el numero de participantes.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><IconRepeat /></div>
                <h4 className="font-semibold">Consistencia (15%)</h4>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Evalua que tan estable es tu rendimiento a lo largo del tiempo. Un jugador que rinde bien de forma consistente tiene mas valor que uno con picos esporadicos.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><IconHandshake /></div>
                <h4 className="font-semibold">Team Success (10%)</h4>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Resultado colectivo en modalidades de equipo. Premia a jugadores que elevan el rendimiento de su equipo, no solo el propio. Aplica principalmente en torneos 2v2 y formatos de equipo.
              </p>
            </div>
          </div>

          {/* ── LSF Table ─────────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold">Factor LSF (Lobby Skill Factor)</h3>
              <p className="text-sm text-muted mt-1">Ajusta el score segun la dificultad del tipo de torneo.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted bg-surface-2/50">
                    <th className="px-6 py-3 text-left font-semibold">Tipo de Torneo</th>
                    <th className="px-6 py-3 text-center font-semibold">Factor LSF</th>
                    <th className="px-6 py-3 text-left font-semibold">Efecto</th>
                  </tr>
                </thead>
                <tbody>
                  {lsfTable.map((row) => (
                    <tr key={row.tipo} className="border-b border-border/40 hover:bg-surface-2/30 transition-colors">
                      <td className="px-6 py-3.5 font-medium">{row.tipo}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`font-mono font-bold ${
                          parseFloat(row.factor) > 1 ? "text-success" :
                          parseFloat(row.factor) < 1 ? "text-red-400" :
                          "text-muted"
                        }`}>
                          x{row.factor}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-muted text-xs">
                        {parseFloat(row.factor) > 1
                          ? "Multiplica el score base por mayor dificultad"
                          : parseFloat(row.factor) < 1
                          ? "Reduce el score por menor nivel competitivo"
                          : "Score base sin ajuste"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Tier Classification ───────────────────────────── */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-red-500/30 rounded-2xl p-6 card-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full" />
              <span className="badge-pro px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-4">PRO</span>
              <p className="text-3xl font-bold mb-1">Percentil &ge; 80</p>
              <p className="text-sm text-muted leading-relaxed">
                Los mejores jugadores de la plataforma. Acceso a torneos exclusivos, prioridad en matchmaking y reconocimiento en la comunidad.
              </p>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted">Minimo 4 participaciones para calificar</p>
              </div>
            </div>
            <div className="bg-surface border border-blue-500/30 rounded-2xl p-6 card-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full" />
              <span className="badge-am px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-4">AM</span>
              <p className="text-3xl font-bold mb-1">Percentil &ge; 40</p>
              <p className="text-sm text-muted leading-relaxed">
                Jugadores con habilidad demostrada y en crecimiento. La mayoria de la base competitiva activa se encuentra en este tier.
              </p>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted">Minimo 4 participaciones para calificar</p>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 card-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-bl-full" />
              <span className="badge-detri px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-4">Detri</span>
              <p className="text-3xl font-bold mb-1">Percentil &lt; 40</p>
              <p className="text-sm text-muted leading-relaxed">
                Jugadores nuevos o en proceso de mejora. El sistema ofrece matchmaking justo para que compitan contra oponentes de nivel similar.
              </p>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted">Minimo 4 participaciones para calificar</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
