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
  playerId?: string;
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
  isCalibrating?: boolean;
  isDecaying?: boolean;
  decayMultiplier?: number;
  phase?: string;
  mu?: number;
  sigma?: number;
  psr?: number;
  modelVersion?: string;
  peakScore?: number;
}

export interface RankingStats {
  totalPlayers: number;
  eligible: number;
  pro: number;
  am: number;
  detri: number;
  events?: number;
  deltas?: number;
  modelVersion?: string;
  configHash?: string;
}

interface RankingClientProps {
  initialPlayers: Player[];
  initialStats: RankingStats;
  loadError: string | null;
  scoringPhase: string;
}

const methodologyPrinciples = [
  {
    label: "Rating conservador",
    value: "PSR = mu - 3sigma",
    body: "La posicion publica usa una estimacion prudente de habilidad: premia resultados reales y descuenta incertidumbre.",
  },
  {
    label: "Evidencia verificable",
    value: "event log",
    body: "Cada partida debe tener fuente, timestamp, participantes, resultado, captura o comprobante y version del modelo usado.",
  },
  {
    label: "Separacion de riesgos",
    value: "skill != trust",
    body: "La habilidad rankea. La confianza controla acceso, revision y riesgo operativo para evitar smurfing y abuso.",
  },
  {
    label: "Parametros versionados",
    value: "model card",
    body: "Todo cambio de pesos, priors, umbrales o formulas debe publicarse con fecha, justificacion y corrida de comparacion.",
  },
];

const ratingModel = [
  { label: "Estado latente", formula: "R_i ~ N(mu_i, sigma_i^2)", note: "Cada jugador tiene habilidad estimada y una incertidumbre explicita." },
  { label: "Resultado esperado", formula: "P(A > B) = Phi((mu_A - mu_B) / c)", note: "La probabilidad de ganar depende de la diferencia de ratings y del ruido de performance." },
  { label: "Ranking visible", formula: "PSR_i = mu_i - 3sigma_i", note: "Un jugador nuevo puede tener alto potencial, pero no sube sin evidencia suficiente." },
  { label: "Clasificacion", formula: "Tier = percentile(PSR_i)", note: "PRO, AM y Detri salen del percentil dentro del pool elegible, no de decisiones manuales." },
];

const auditTrail = [
  "Snapshot reproducible por temporada, torneo, lobby y version del algoritmo.",
  "Registro inmutable de entradas: jugadores, equipos, placement, kills, evidencia y resolucion de disputas.",
  "Deltas de rating explicables por partida: rating previo, evidencia, ajuste, rating posterior y operador responsable si hubo revision.",
  "Backtests antes de liberar cambios: correlacion con resultados futuros, estabilidad por region, sesgo por modalidad y casos limite.",
];

const researchSources = [
  { label: "TrueSkill - Microsoft Research", href: "https://www.microsoft.com/en-us/research/?p=154591" },
  { label: "Glicko-2 - Mark Glickman", href: "https://www.glicko.net/glicko/glicko2.html" },
  { label: "OpenSkill - modelo abierto", href: "https://arxiv.org/abs/2401.05451" },
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
export default function RankingClient({
  initialPlayers,
  initialStats,
  loadError,
  scoringPhase,
}: RankingClientProps) {
  const [filterTorneo, setFilterTorneo] = useState("todos");
  const [filterElegibilidad, setFilterElegibilidad] = useState("todos");
  const [filterTier, setFilterTier] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const totalRecords = useMemo(
    () => initialPlayers.reduce((sum, player) => sum + player.participaciones, 0),
    [initialPlayers]
  );

  const dashboardStats = [
    { label: "Jugadores Activos", value: initialStats.totalPlayers.toLocaleString("es-MX"), icon: <IconUsers />, color: "text-foreground" },
    { label: "Elegibles", value: initialStats.eligible.toLocaleString("es-MX"), icon: <IconStar />, color: "text-blue-400" },
    { label: "PRO", value: initialStats.pro.toLocaleString("es-MX"), icon: <IconAward />, color: "text-red-400" },
    { label: "AM", value: initialStats.am.toLocaleString("es-MX"), icon: <IconBarChart />, color: "text-blue-500" },
    { label: "Eventos", value: (initialStats.events ?? 0).toLocaleString("es-MX"), icon: <IconDatabase />, color: "text-foreground" },
    { label: "Deltas", value: (initialStats.deltas ?? totalRecords).toLocaleString("es-MX"), icon: <IconTrendUp />, color: "text-muted" },
  ];

  const filteredPlayers = useMemo(() => {
    return initialPlayers.filter((p) => {
      if (filterTier !== "todos" && p.tier !== filterTier) return false;
      if (filterElegibilidad === "elegible" && p.participaciones < 4) return false;
      if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [filterElegibilidad, filterTier, initialPlayers, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient">Ranking Phoenix Arena</h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-500/15 text-blue-400 border border-blue-500/30">
              PSR {scoringPhase}
            </span>
          </div>
          <p className="text-muted max-w-2xl mx-auto">
            Plataforma competitiva con rating conservador, evidencia auditable y una metodologia inspirada en sistemas bayesianos usados en juegos y competencia profesional.
          </p>
        </div>

        {/* ── Methodology Positioning ────────────────────────── */}
        <div className="grid md:grid-cols-4 gap-3">
          {methodologyPrinciples.map((principle) => (
            <div key={principle.label} className="bg-surface border border-border rounded-xl p-4 card-hover">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{principle.label}</p>
              <p className="text-lg font-bold mt-2">{principle.value}</p>
              <p className="text-xs text-muted leading-relaxed mt-2">{principle.body}</p>
            </div>
          ))}
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

        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-xs text-muted flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>Modelo activo: <span className="font-mono text-foreground">{initialStats.modelVersion ?? scoringPhase}</span></span>
          <span>Config hash: <span className="font-mono text-foreground">{initialStats.configHash?.slice(0, 16) ?? "pendiente"}</span></span>
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
            <p className="text-sm text-muted mt-0.5">
              {filteredPlayers.length} jugadores encontrados. Snapshot calculado desde registros rankeables.
            </p>
          </div>
          {loadError && (
            <div className="mx-6 mt-5 rounded-xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
              {loadError}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-left bg-surface-2/50">
                  <th className="px-4 py-3 font-semibold text-center w-16">Rank</th>
                  <th className="px-4 py-3 font-semibold">Jugador</th>
                  <th className="px-4 py-3 font-semibold text-center">Tier</th>
                  <th className="px-4 py-3 font-semibold text-center">Part.</th>
                  <th className="px-4 py-3 font-semibold text-center">Mu</th>
                  <th className="px-4 py-3 font-semibold text-center">Sigma</th>
                  <th className="px-4 py-3 font-semibold text-center">Certeza</th>
                  <th className="px-4 py-3 font-semibold text-center">Peak</th>
                  <th className="px-4 py-3 font-semibold text-center">PSR / Score</th>
                  <th className="px-4 py-3 font-semibold text-center">Percentil</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <p className="font-semibold">Aun no hay registros rankeables</p>
                      <p className="text-sm text-muted mt-1">
                        Cuando existan partidas verificadas, el ranking mostrara el PSR, tier, percentil y estado de calibracion.
                      </p>
                    </td>
                  </tr>
                )}
                {filteredPlayers.map((p) => (
                  <tr
                    key={p.playerId ?? p.rank}
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
                      <div className="flex flex-col gap-1">
                        <span className={`font-semibold ${p.rank <= 3 ? "text-foreground" : ""}`}>{p.nombre}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {p.isCalibrating && (
                            <span className="w-fit rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                              calibrando
                            </span>
                          )}
                          {p.isDecaying && (
                            <span className="w-fit rounded-full border border-yellow-500/25 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-300">
                              decay activo
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`${tierBadge[p.tier]} px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider`}>
                        {p.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-muted">{p.participaciones}</td>
                    <td className="px-4 py-3.5 text-center font-mono">{(p.mu ?? p.impacto).toFixed(1)}</td>
                    <td className="px-4 py-3.5 text-center font-mono">{(p.sigma ?? p.placement).toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-center font-mono">{p.consistencia.toFixed(1)}</td>
                    <td className="px-4 py-3.5 text-center font-mono">{p.peakScore?.toFixed(1) ?? p.teamSuccess.toFixed(1)}</td>
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
                <p className="text-sm text-muted mt-1">
                  PSR / score conservador  |  Percentil {selectedPlayer.percentil.toFixed(1)}%
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 mb-6">
                {[
                  { label: "Mu (habilidad estimada)", value: selectedPlayer.mu ?? selectedPlayer.impacto, color: "from-red-500 to-red-400" },
                  { label: "Sigma (incertidumbre)", value: selectedPlayer.sigma ?? selectedPlayer.placement, color: "from-blue-500 to-blue-400" },
                  { label: "Certeza operacional", value: selectedPlayer.consistencia, color: "from-green-500 to-green-400" },
                  { label: "Peak PSR", value: selectedPlayer.peakScore ?? selectedPlayer.teamSuccess, color: "from-purple-500 to-purple-400" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted">{item.label}</span>
                      <span className="font-semibold">{item.value.toFixed(1)}</span>
                    </div>
                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${Math.min(Math.max(item.value, 4), 100)}%` }} />
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
                <div className="bg-surface-2 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold">{selectedPlayer.decayMultiplier?.toFixed(2) ?? "1.00"}</p>
                  <p className="text-xs text-muted">Decay</p>
                </div>
                <div className="bg-surface-2 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold">{selectedPlayer.modelVersion ?? selectedPlayer.phase ?? scoringPhase}</p>
                  <p className="text-xs text-muted">Modelo</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gradient">Metodologia PSR</h2>
            <p className="text-muted max-w-xl mx-auto text-sm">
              Phoenix Skill Rating propone un ranking bayesiano, conservador y auditable para competencia con premios.
            </p>
          </div>

          {/* ── Research Sources ──────────────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
              <div>
                <h3 className="font-semibold mb-3">Base metodologica</h3>
                <p className="text-sm text-muted leading-relaxed">
                  La recomendacion es evolucionar el score actual hacia un modelo tipo TrueSkill/OpenSkill: cada jugador tiene una distribucion de habilidad, cada partida actualiza esa distribucion, y la tabla publica usa un valor conservador que baja cuando hay poca evidencia. Esto es especialmente importante si habra dinero, porque reduce incentivos para explotar una sola partida aislada.
                </p>
              </div>
              <div className="space-y-2">
                {researchSources.map((source) => (
                  <a
                    key={source.href}
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-semibold hover:border-red-500/50 transition-colors"
                  >
                    {source.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Formula ───────────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="font-semibold">Modelo publicable v1.0 propuesto</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {ratingModel.map((item) => (
                <div key={item.label} className="bg-surface-2 border border-border-light rounded-xl p-5">
                  <p className="text-xs text-muted uppercase tracking-wider font-bold">{item.label}</p>
                  <p className="font-mono text-sm text-gradient font-bold mt-2">{item.formula}</p>
                  <p className="text-xs text-muted leading-relaxed mt-2">{item.note}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface-2 border border-border-light rounded-xl p-5 font-mono text-sm">
              <span className="text-muted">Delta rating</span>
              <span className="text-foreground"> = posterior(</span>
              <span className="text-red-400">resultado</span>
              <span className="text-muted">, </span>
              <span className="text-blue-400">fuerza_lobby</span>
              <span className="text-muted">, </span>
              <span className="text-green-400">performance_individual_acotada</span>
              <span className="text-foreground">)</span>
            </div>
          </div>

          {/* ── 4 Component Cards ─────────────────────────────── */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400"><IconTarget /></div>
                <h4 className="font-semibold">Performance individual</h4>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Kills y contribucion individual se usan como evidencia secundaria, con retornos decrecientes y limites por lobby para que un stat padding extremo no domine el rating.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><IconPodium /></div>
                <h4 className="font-semibold">Resultado competitivo</h4>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                El placement y el orden final son la senal principal. Ganar contra rivales fuertes mueve mas que ganar contra rivales con baja estimacion de habilidad.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><IconRepeat /></div>
                <h4 className="font-semibold">Incertidumbre explicita</h4>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Sigma mide que tanto sabemos del jugador. En calibracion, sigma es alta y el PSR publico baja; con evidencia repetida, la incertidumbre se reduce.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><IconHandshake /></div>
                <h4 className="font-semibold">Equipos y formatos</h4>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                En modalidades de equipo, el modelo estima performance del equipo y reparte la actualizacion individual sin confundir una victoria grupal con habilidad absoluta individual.
              </p>
            </div>
          </div>

          {/* ── LSF Table ─────────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold">Factor LSF (Lobby Skill Factor)</h3>
              <p className="text-sm text-muted mt-1">Parametro temporal para separar pools mientras el modelo bayesiano acumula evidencia suficiente.</p>
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
                          ? "Senala mayor exigencia competitiva del pool"
                          : parseFloat(row.factor) < 1
                          ? "Senala pool formativo o de calibracion"
                          : "Pool base sin ajuste contextual"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Auditability ──────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
            <div className="grid lg:grid-cols-[0.75fr_1.25fr] gap-6">
              <div>
                <h3 className="font-semibold">Auditoria y gobernanza</h3>
                <p className="text-sm text-muted leading-relaxed mt-2">
                  Para operar con dinero, el algoritmo no debe ser una caja negra. Cada ranking tiene que poder reconstruirse desde registros originales, parametros versionados y reglas de disputa publicas.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {auditTrail.map((item) => (
                  <div key={item} className="rounded-xl bg-surface-2 border border-border-light p-4">
                    <p className="text-sm text-muted leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
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

          {/* ── v2 Advanced Factors ──────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Controles avanzados del motor</h3>
            <p className="text-sm text-muted text-center max-w-xl mx-auto">
              Estos controles hacen que el rating sea mas resistente a ruido, abuso y poblaciones pequenas.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Decay */}
              <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <h4 className="font-semibold">Decaimiento Temporal</h4>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-3">
                  La inactividad aumenta incertidumbre o reduce score visible sin borrar el historial. Asi el ranking premia actividad reciente y evita que una marca antigua bloquee la tabla.
                </p>
                <div className="bg-surface-2 rounded-lg p-3 font-mono text-xs space-y-1">
                  <p><span className="text-muted">Tasa:</span> <span className="text-yellow-400">5% mensual</span></p>
                  <p><span className="text-muted">Umbral:</span> <span className="text-foreground">30 dias sin actividad</span></p>
                  <p><span className="text-muted">Piso:</span> <span className="text-foreground">60% del peak score</span></p>
                </div>
              </div>

              {/* Lobby Strength */}
              <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h4 className="font-semibold">Fortaleza del Lobby</h4>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-3">
                  Ganar contra jugadores con rating alto aporta mas evidencia que ganar contra un lobby debil. La dificultad se estima desde los ratings previos de los participantes.
                </p>
                <div className="bg-surface-2 rounded-lg p-3 font-mono text-xs space-y-1">
                  <p><span className="text-muted">Formula:</span> <span className="text-blue-400">mean(scores lobby) / mean global</span></p>
                  <p><span className="text-muted">Rango:</span> <span className="text-foreground">x0.5 a x2.0</span></p>
                  <p><span className="text-muted">Aplica a:</span> <span className="text-foreground">Componente Placement</span></p>
                </div>
              </div>

              {/* Cold Start */}
              <div className="bg-surface border border-border rounded-2xl p-6 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                  </div>
                  <h4 className="font-semibold">Arranque en Frio</h4>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-3">
                  Los jugadores nuevos arrancan con un prior bayesiano y alta incertidumbre. El sistema puede detectar talento rapido, pero solo publica una posicion fuerte cuando hay suficiente evidencia.
                </p>
                <div className="bg-surface-2 rounded-lg p-3 font-mono text-xs space-y-1">
                  <p><span className="text-muted">Metodo:</span> <span className="text-green-400">Prior Bayesiano (k=4)</span></p>
                  <p><span className="text-muted">Calibracion:</span> <span className="text-foreground">Primeras 4 partidas</span></p>
                  <p><span className="text-muted">Efecto:</span> <span className="text-foreground">Score se estabiliza gradualmente</span></p>
                </div>
              </div>
            </div>

            {/* Weighted Recency note */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Recencia Ponderada en Consistencia</h4>
                  <p className="text-sm text-muted leading-relaxed">
                    La recencia no reemplaza al rating, lo contextualiza. Las partidas recientes pueden pesar mas en reportes de forma y desempates, mientras el rating central conserva memoria estadistica.
                  </p>
                </div>
              </div>
            </div>

            {/* Novice exclusion note */}
            <div className="bg-surface border border-yellow-500/20 rounded-2xl p-5 flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="text-sm text-muted">
                <span className="text-foreground font-medium">Los torneos Novice deben quedar fuera del ranking monetizado principal.</span> Pueden servir para calibracion inicial, deteccion de smurfs y aprendizaje sin impacto directo en premios.
              </p>
            </div>
          </div>

          {/* ── Trust Score Section ────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Trust Score (Anti-Smurf)</h3>
            <p className="text-sm text-muted text-center max-w-xl mx-auto">
              Sistema de confianza que previene suplantacion de identidad, cuentas prestadas y smurfing (pros jugando en categorias bajas).
            </p>

            <div className="bg-surface border border-border rounded-2xl p-6">
              <h4 className="font-semibold mb-3">Variables del Trust Score</h4>
              <div className="grid sm:grid-cols-5 gap-3 mb-5">
                {[
                  { label: "Antiguedad", weight: "20%", color: "text-blue-400" },
                  { label: "Torneos", weight: "25%", color: "text-purple-400" },
                  { label: "Consistencia", weight: "25%", color: "text-green-400" },
                  { label: "Cuentas vinculadas", weight: "15%", color: "text-yellow-400" },
                  { label: "Historial limpio", weight: "15%", color: "text-red-400" },
                ].map((v) => (
                  <div key={v.label} className="bg-surface-2 rounded-xl p-3 text-center">
                    <p className={`text-lg font-bold ${v.color}`}>{v.weight}</p>
                    <p className="text-[10px] text-muted mt-1">{v.label}</p>
                  </div>
                ))}
              </div>
              <h4 className="font-semibold mb-2">Reglas de acceso</h4>
              <div className="space-y-2">
                {[
                  { range: "< 30", label: "Solo puede jugar Amateur", color: "text-red-400", bg: "bg-red-500/10" },
                  { range: "30 — 60", label: "Amateur + Detri con monitoreo", color: "text-yellow-400", bg: "bg-yellow-500/10" },
                  { range: "> 60", label: "Acceso completo a todos los torneos", color: "text-blue-400", bg: "bg-blue-500/10" },
                  { range: "> 80", label: "Badge 'Verificado' — jugador confiable", color: "text-success", bg: "bg-success/10" },
                ].map((r) => (
                  <div key={r.range} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${r.bg}`}>
                    <span className={`font-mono font-bold text-sm w-16 ${r.color}`}>{r.range}</span>
                    <span className="text-sm text-muted">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Placement Points Table ─────────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h4 className="font-semibold mb-3">Tabla operativa actual por posicion</h4>
            <p className="text-xs text-muted mb-4">La fase actual usa esta tabla como scoring base. En PSR v1.0 se conserva como evidencia historica y se convierte en entrada del update bayesiano.</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[
                { pos: "1ro", pts: 100 }, { pos: "2do", pts: 80 }, { pos: "3ro", pts: 70 }, { pos: "4to", pts: 60 },
                { pos: "5to", pts: 50 }, { pos: "6to", pts: 40 }, { pos: "7mo", pts: 30 }, { pos: "8vo", pts: 20 },
              ].map((p) => (
                <div key={p.pos} className="bg-surface-2 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-muted">{p.pos}</p>
                  <p className="text-sm font-bold text-foreground">{p.pts}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">Posiciones 9-16: 10 puntos cada una</p>
          </div>

          {/* ── Fragger vs Anchor Balance ──────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h4 className="font-semibold mb-3">Balance de Roles: Fragger vs Anchor</h4>
            <p className="text-xs text-muted mb-4">El modelo debe reconocer estilos distintos sin permitir que una sola metrica explique toda la habilidad.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                <h5 className="font-semibold text-red-400 text-sm mb-2">Fragger</h5>
                <p className="text-xs text-muted leading-relaxed">Alto numero de kills, placement inconsistente. Si solo se ponderaran kills, este perfil dominaria injustamente.</p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <h5 className="font-semibold text-blue-400 text-sm mb-2">Anchor</h5>
                <p className="text-xs text-muted leading-relaxed">Pocas kills, placement muy consistente (top 3). Seria subvalorado si solo se ponderara el placement.</p>
              </div>
            </div>
            <p className="text-xs text-muted mt-3">En la fase actual, un Fragger con 10 kills + 5to lugar (150 pts) y un Anchor con 5 kills + 1er lugar (150 pts) quedan igualados. En PSR, ese empate se valida contra fuerza del lobby, recurrencia y resultado futuro.</p>
          </div>

          {/* ── Scoring Phases ─────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h4 className="font-semibold mb-3">Fases de Implementacion</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success border border-success/30 shrink-0 mt-0.5">Fase 1</span>
                <div>
                  <p className="text-sm font-medium">Transparencia y datos base</p>
                  <p className="text-xs text-muted">Publicar metodologia, versionar parametros, cerrar esquema de eventos y mantener el score actual como linea base auditable.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">Fase 2</span>
                <div>
                  <p className="text-sm font-medium">PSR bayesiano en modo sombra</p>
                  <p className="text-xs text-muted">Calcular mu, sigma, delta por partida y compararlo contra el score actual sin afectar premios durante el periodo de validacion.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 shrink-0 mt-0.5">Fase 3</span>
                <div>
                  <p className="text-sm font-medium">Liberacion v1.0 con control de cambios</p>
                  <p className="text-xs text-muted">Congelar version, publicar changelog, ejecutar backtests y activar disputas/revision antes de que el ranking determine premios.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
