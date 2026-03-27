"use client";

import { useState } from "react";

/* ───── SVG Icons ───── */
function ClipboardIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
  );
}

function UploadIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CheckCircleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
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

function ShieldIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

function ChevronDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ImageIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/* ───── Data ───── */
type Tab = "pendientes" | "confirmados" | "disputados" | "resueltos";

const confirmedResults = [
  { id: 1240, opponent: "DarkMatter", game: "FIFA 25", result: "Victoria", score: "3-1", date: "Hoy, 2:30 PM", prize: "+$15" },
  { id: 1238, opponent: "StarPlayer", game: "Fortnite", result: "Derrota", score: "Eliminado #5", date: "Hoy, 12:15 PM", prize: "-$10" },
  { id: 1235, opponent: "ProGamer_X", game: "Call of Duty", result: "Victoria", score: "25-18", date: "Ayer, 9:00 PM", prize: "+$20" },
  { id: 1232, opponent: "ShadowHunter", game: "FIFA 25", result: "Victoria", score: "2-0", date: "Ayer, 5:45 PM", prize: "+$12" },
];

const resolvedDisputes = [
  { id: 1220, opponent: "ToxicGamer", resolution: "A tu favor", reason: "Evidencia confirmada por admin", date: "22 Mar", prize: "+$25" },
  { id: 1215, opponent: "BladeRunner", resolution: "Anulado", reason: "Problemas de conexion comprobados", date: "20 Mar", prize: "$0 (reembolso)" },
  { id: 1210, opponent: "CyberWolf", resolution: "En contra", reason: "Evidencia insuficiente", date: "18 Mar", prize: "-$15" },
];

const sidebarSteps = [
  { title: "Reporta tu resultado", desc: "Selecciona si ganaste o perdiste y sube evidencia." },
  { title: "Tu oponente confirma", desc: "El otro jugador tiene 30 minutos para confirmar." },
  { title: "Resultado confirmado", desc: "Si ambos coinciden, se confirma automaticamente." },
  { title: "Disputa si no coincide", desc: "Si hay desacuerdo, un admin revisara la evidencia." },
  { title: "Resolucion final", desc: "El admin decide en base a la evidencia presentada." },
];

/* ───── Page ───── */
export default function ResultadosPage() {
  const [tab, setTab] = useState<Tab>("pendientes");
  const [pendingResult1, setPendingResult1] = useState<"gane" | "perdi" | null>(null);
  const [expandedResolved, setExpandedResolved] = useState<number | null>(null);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "pendientes", label: "Pendientes", count: 2 },
    { key: "confirmados", label: "Confirmados", count: 8 },
    { key: "disputados", label: "Disputados", count: 1 },
    { key: "resueltos", label: "Resueltos", count: 15 },
  ];

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardIcon className="h-7 w-7 text-red-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient">Centro de Resultados</h1>
          </div>
          <p className="text-muted text-lg max-w-2xl">
            Reporta resultados, sube evidencia y resuelve disputas de tus partidas.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex gap-1 bg-surface-2 rounded-xl p-1 mb-8 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    tab === t.key
                      ? "bg-surface-3 text-foreground shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t.label}
                  {t.count !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      tab === t.key ? "bg-red-500/20 text-red-400" : "bg-surface-3 text-muted"
                    }`}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Pendientes */}
            {tab === "pendientes" && (
              <div className="space-y-6">
                {/* Pending card 1: Upload evidence */}
                <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-warning/15 text-warning font-semibold px-2 py-0.5 rounded-full">Pendiente</span>
                        <span className="text-xs text-muted">Hace 15 min</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Reto #1245 vs Juancho</h3>
                      <p className="text-sm text-muted">FIFA 25 - 1v1 - Apuesta $20</p>
                    </div>
                    <AlertCircleIcon className="h-5 w-5 text-warning shrink-0" />
                  </div>

                  {/* Upload zone */}
                  <div className="border-2 border-dashed border-border-light rounded-xl p-6 text-center hover:border-red-500/30 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <UploadIcon className="h-8 w-8 text-muted" />
                      <p className="text-sm font-medium text-foreground">Sube tu evidencia</p>
                      <p className="text-xs text-muted">Captura de pantalla o foto del marcador final</p>
                      <p className="text-[10px] text-muted">PNG, JPG hasta 5MB</p>
                    </div>
                  </div>

                  {/* Result selection */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Resultado de la partida:</p>
                    <div className="flex gap-3">
                      <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                        pendingResult1 === "gane"
                          ? "border-success bg-success/10 text-success"
                          : "border-border text-muted hover:border-border-light"
                      }`}>
                        <input
                          type="radio"
                          name="result1"
                          className="sr-only"
                          checked={pendingResult1 === "gane"}
                          onChange={() => setPendingResult1("gane")}
                        />
                        <CheckCircleIcon className="h-4 w-4" />
                        <span className="text-sm font-semibold">Gane</span>
                      </label>
                      <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                        pendingResult1 === "perdi"
                          ? "border-red-500 bg-red-500/10 text-red-400"
                          : "border-border text-muted hover:border-border-light"
                      }`}>
                        <input
                          type="radio"
                          name="result1"
                          className="sr-only"
                          checked={pendingResult1 === "perdi"}
                          onChange={() => setPendingResult1("perdi")}
                        />
                        <AlertCircleIcon className="h-4 w-4" />
                        <span className="text-sm font-semibold">Perdi</span>
                      </label>
                    </div>
                  </div>

                  <button className="w-full py-2.5 rounded-lg text-sm font-semibold bg-gradient-main text-white hover:opacity-90 transition-opacity">
                    Enviar Resultado
                  </button>
                </div>

                {/* Pending card 2: Opponent reported */}
                <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-blue-500/15 text-blue-400 font-semibold px-2 py-0.5 rounded-full">Oponente reporto</span>
                        <span className="text-xs text-muted">Hace 5 min</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Reto #1243 vs NexusFire</h3>
                      <p className="text-sm text-muted">Call of Duty: Warzone - 1v1 - Apuesta $15</p>
                    </div>
                    <ClockIcon className="h-5 w-5 text-blue-400 shrink-0" />
                  </div>

                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-sm text-muted">NexusFire reporto: <span className="text-foreground font-semibold">Victoria</span></p>
                    <p className="text-xs text-muted mt-1">Tienes 30 minutos para confirmar o disputar</p>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-success/15 text-success border border-success/30 hover:bg-success/25 transition-colors">
                      Confirmar Derrota
                    </button>
                    <button className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors">
                      Disputar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmados */}
            {tab === "confirmados" && (
              <div className="space-y-3">
                {confirmedResults.map((r) => (
                  <div key={r.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className={`shrink-0 ${r.result === "Victoria" ? "text-success" : "text-red-400"}`}>
                      <CheckCircleIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">Reto #{r.id}</span>
                        <span className="text-xs text-muted">vs {r.opponent}</span>
                        <span className="text-xs bg-surface-3 text-muted px-1.5 py-0.5 rounded">{r.game}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted">
                        <span>{r.date}</span>
                        <span className="text-border-light">|</span>
                        <span>{r.score}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-sm font-bold ${r.result === "Victoria" ? "text-success" : "text-red-400"}`}>
                        {r.result}
                      </span>
                      <p className={`text-xs font-semibold ${r.prize.startsWith("+") ? "text-success" : "text-red-400"}`}>{r.prize}</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted text-center pt-2">Mostrando 4 de 8 resultados confirmados</p>
              </div>
            )}

            {/* Disputados */}
            {tab === "disputados" && (
              <div className="space-y-6">
                <div className="bg-surface border border-border rounded-xl p-5 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-warning/15 text-warning">
                          <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
                          En Revision
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Reto #1230 vs PhantomX</h3>
                      <p className="text-sm text-muted">Fortnite - 1v1 Build - Apuesta $30</p>
                    </div>
                    <ShieldIcon className="h-5 w-5 text-warning shrink-0" />
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Linea de tiempo</h4>
                    {[
                      { time: "3:15 PM", event: "Tu reportaste: Victoria", who: "Tu" },
                      { time: "3:18 PM", event: "PhantomX reporto: Victoria", who: "Oponente" },
                      { time: "3:18 PM", event: "Disputa abierta automaticamente", who: "Sistema" },
                      { time: "3:25 PM", event: "Admin asignado: ModeratorPX", who: "Sistema" },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${i === 3 ? "bg-warning" : "bg-border-light"}`} />
                          {i < 3 && <div className="w-px flex-1 bg-border-light mt-1" />}
                        </div>
                        <div className="pb-3">
                          <p className="text-sm text-foreground">{step.event}</p>
                          <p className="text-xs text-muted">{step.time} - {step.who}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Evidence */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Evidencia presentada</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-2 border border-border rounded-lg p-4 flex flex-col items-center gap-2">
                        <ImageIcon className="h-8 w-8 text-muted" />
                        <p className="text-xs font-medium text-foreground">Tu evidencia</p>
                        <span className="text-[10px] text-muted">screenshot_result.png</span>
                      </div>
                      <div className="bg-surface-2 border border-border rounded-lg p-4 flex flex-col items-center gap-2">
                        <ImageIcon className="h-8 w-8 text-muted" />
                        <p className="text-xs font-medium text-foreground">Evidencia oponente</p>
                        <span className="text-[10px] text-muted">phantom_proof.jpg</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-2 rounded-lg p-3 flex items-center gap-2">
                    <SearchIcon className="h-4 w-4 text-warning shrink-0" />
                    <p className="text-sm text-muted">Un administrador esta revisando la evidencia. Tiempo estimado: 2-4 horas.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Resueltos */}
            {tab === "resueltos" && (
              <div className="space-y-3">
                {resolvedDisputes.map((r) => (
                  <div key={r.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                    <button
                      className="w-full p-4 flex items-center gap-4 text-left"
                      onClick={() => setExpandedResolved(expandedResolved === r.id ? null : r.id)}
                    >
                      <div className={`shrink-0 ${
                        r.resolution === "A tu favor" ? "text-success" : r.resolution === "En contra" ? "text-red-400" : "text-muted"
                      }`}>
                        <ShieldIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-sm">Disputa #{r.id}</span>
                          <span className="text-xs text-muted">vs {r.opponent}</span>
                        </div>
                        <p className="text-xs text-muted mt-0.5">{r.date}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          r.resolution === "A tu favor"
                            ? "bg-success/15 text-success"
                            : r.resolution === "En contra"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-surface-3 text-muted"
                        }`}>{r.resolution}</span>
                        <ChevronDownIcon className={`h-4 w-4 text-muted transition-transform ${expandedResolved === r.id ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {expandedResolved === r.id && (
                      <div className="px-4 pb-4 pt-0 border-t border-border">
                        <div className="pt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted">Razon:</span>
                            <span className="text-foreground">{r.reason}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted">Resultado economico:</span>
                            <span className={`font-semibold ${
                              r.prize.startsWith("+") ? "text-success" : r.prize.startsWith("-") ? "text-red-400" : "text-muted"
                            }`}>{r.prize}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted">Fecha resolucion:</span>
                            <span className="text-foreground">{r.date}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted text-center pt-2">Mostrando 3 de 15 disputas resueltas</p>
              </div>
            )}
          </div>

          {/* Sidebar - How it works */}
          <aside className="lg:w-80 shrink-0">
            <div className="bg-surface border border-border rounded-xl p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <ShieldIcon className="h-5 w-5 text-red-400" />
                <h3 className="font-bold text-foreground">Como funciona</h3>
              </div>
              <div className="space-y-5">
                {sidebarSteps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-main text-white text-[10px] font-bold">
                        {i + 1}
                      </div>
                      {i < sidebarSteps.length - 1 && <div className="w-px flex-1 bg-border mt-1.5" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-semibold text-foreground">{step.title}</p>
                      <p className="text-xs text-muted mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-border">
                <p className="text-xs text-muted leading-relaxed">
                  Todas las disputas son revisadas por administradores verificados. El tiempo promedio de resolucion es de 2-4 horas.
                  Mantener evidencia clara y veridica es fundamental.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
