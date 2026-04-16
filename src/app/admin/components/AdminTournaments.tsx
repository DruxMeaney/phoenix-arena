"use client";

import { useState, useEffect, useCallback } from "react";
import AdminTournamentResults from "./AdminTournamentResults";

type ViewMode = "list" | "create" | "detail";

// ── Call of Duty Game Modes ──────────────────────────────────────
const GAME_OPTIONS = [
  { value: "Warzone - Battle Royale", label: "Warzone - Battle Royale", desc: "Ultimo equipo en pie, hasta 150 jugadores" },
  { value: "Warzone - Resurgence", label: "Warzone - Resurgence", desc: "BR con respawn mientras tu equipo este vivo" },
  { value: "Warzone - Ranked Play", label: "Warzone - Ranked Play", desc: "Ranked competitivo oficial de Warzone" },
  { value: "Warzone - Plunder", label: "Warzone - Plunder", desc: "Recolecta dinero, respawn ilimitado" },
  { value: "Warzone - Mini Royale", label: "Warzone - Mini Royale", desc: "BR rapido con circulo reducido" },
  { value: "Warzone - Iron Trials", label: "Warzone - Iron Trials", desc: "BR hardcore, mas HP, sin loadout gratis" },
  { value: "MW3 - Search & Destroy", label: "MW3 - Search & Destroy", desc: "Eliminacion, plantar/desactivar bomba" },
  { value: "MW3 - Hardpoint", label: "MW3 - Hardpoint", desc: "Controla la zona rotativa" },
  { value: "MW3 - Domination", label: "MW3 - Domination", desc: "Captura y defiende las banderas" },
  { value: "MW3 - Kill Confirmed", label: "MW3 - Kill Confirmed", desc: "Recoge las chapas para confirmar kills" },
  { value: "MW3 - Control", label: "MW3 - Control", desc: "Ataca/defiende zonas con vidas limitadas" },
  { value: "MW3 - Team Deathmatch", label: "MW3 - Team Deathmatch", desc: "Clasico TDM, primer equipo al limite gana" },
  { value: "BO6 - Search & Destroy", label: "BO6 - Search & Destroy", desc: "S&D en Black Ops 6" },
  { value: "BO6 - Hardpoint", label: "BO6 - Hardpoint", desc: "Hardpoint en Black Ops 6" },
  { value: "BO6 - Control", label: "BO6 - Control", desc: "Control en Black Ops 6" },
  { value: "Custom - Sniper Only", label: "Custom - Solo Snipers", desc: "Partida personalizada solo francotiradores" },
  { value: "Custom - Pistol Only", label: "Custom - Solo Pistolas", desc: "Partida personalizada solo pistolas" },
  { value: "Custom - Gulag 1v1", label: "Custom - Gulag 1v1", desc: "1v1 estilo Gulag" },
];

const FORMAT_OPTIONS = [
  { value: "Solos", label: "Solos", desc: "1 jugador", players: "1" },
  { value: "Duos", label: "Duos", desc: "Equipos de 2", players: "2" },
  { value: "Trios", label: "Trios", desc: "Equipos de 3", players: "3" },
  { value: "Quads", label: "Quads", desc: "Equipos de 4", players: "4" },
  { value: "1v1", label: "1v1", desc: "Uno contra uno", players: "2" },
  { value: "2v2", label: "2v2", desc: "Dos contra dos", players: "4" },
  { value: "3v3", label: "3v3", desc: "Tres contra tres", players: "6" },
  { value: "6v6", label: "6v6", desc: "Seis contra seis (MP)", players: "12" },
  { value: "Bracket 1v1", label: "Bracket 1v1", desc: "Eliminacion directa 1v1", players: "Variable" },
  { value: "Bracket 2v2", label: "Bracket 2v2", desc: "Eliminacion directa 2v2", players: "Variable" },
  { value: "Bracket 3v3", label: "Bracket 3v3", desc: "Eliminacion directa 3v3", players: "Variable" },
  { value: "Custom", label: "Personalizado", desc: "Formato libre", players: "Variable" },
];

const TYPE_OPTIONS = [
  { value: "detri", label: "Detri", desc: "Torneo para nivel Detri (principiante)" },
  { value: "amateur", label: "Amateur", desc: "Torneo nivel Amateur" },
  { value: "pro", label: "Pro", desc: "Torneo nivel Pro (competitivo)" },
  { value: "skills", label: "Skills", desc: "Torneo de habilidades especificas" },
  { value: "evento", label: "Evento Especial", desc: "Evento unico o patrocinado" },
  { value: "mixto", label: "Mixto", desc: "Todos los niveles pueden participar" },
  { value: "novice", label: "Novice", desc: "Solo jugadores nuevos (calibracion)" },
  { value: "invitacional", label: "Invitacional", desc: "Solo con invitacion" },
  { value: "clasificatorio", label: "Clasificatorio", desc: "Para clasificar a torneos mayores" },
  { value: "weekly", label: "Semanal", desc: "Torneo recurrente semanal" },
  { value: "monthly", label: "Mensual", desc: "Torneo recurrente mensual" },
  { value: "showmatch", label: "Showmatch", desc: "Exhibicion, no afecta ranking" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "registration", label: "Registro Abierto" },
  { value: "check_in", label: "Check-In" },
  { value: "in_progress", label: "En Curso" },
  { value: "paused", label: "Pausado" },
  { value: "finished", label: "Finalizado" },
  { value: "cancelled", label: "Cancelado" },
];

const REGION_OPTIONS = [
  { value: "latam-norte", label: "LATAM Norte" },
  { value: "latam-sur", label: "LATAM Sur" },
  { value: "na-east", label: "NA East" },
  { value: "na-west", label: "NA West" },
  { value: "eu", label: "Europa" },
  { value: "global", label: "Global (Sin restriccion)" },
];

const PRIZE_DISTRIBUTION = [
  { value: "winner_takes_all", label: "Winner Takes All" },
  { value: "top_3", label: "Top 3 (60/25/15)" },
  { value: "top_5", label: "Top 5 (40/25/15/12/8)" },
  { value: "top_8", label: "Top 8" },
  { value: "custom", label: "Personalizado" },
];

function adminFetch(url: string, options: RequestInit = {}) {
  const pass = typeof window !== "undefined" ? sessionStorage.getItem("phoenix_admin_pass") || "" : "";
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": pass,
      ...(options.headers || {}),
    },
  });
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: "bg-gray-500/15 text-gray-400",
    registration: "bg-blue-500/15 text-blue-400",
    check_in: "bg-purple-500/15 text-purple-400",
    in_progress: "bg-yellow-500/15 text-yellow-400",
    paused: "bg-orange-500/15 text-orange-400",
    finished: "bg-green-500/15 text-green-400",
    cancelled: "bg-red-500/15 text-red-400",
  };
  return map[status] || "bg-surface-3 text-muted";
}

function statusLabel(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status)?.label || status;
}

const emptyForm = {
  name: "",
  game: "Warzone - Battle Royale",
  format: "Trios",
  tournamentType: "detri",
  entryFee: "",
  maxSlots: "",
  startDate: "",
  description: "",
  rules: "",
  region: "latam-norte",
  prizeDistribution: "winner_takes_all",
  minTrustScore: "0",
  status: "registration",
  streamUrl: "",
  discordChannel: "",
  mapRotation: "",
};

export default function AdminTournaments() {
  const [view, setView] = useState<ViewMode>("list");
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editing, setEditing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminFetch("/api/admin/tournaments");
      if (!res.ok) throw new Error("Error al cargar torneos");
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const res = await adminFetch("/api/admin/tournaments", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          game: form.game,
          format: form.format,
          tournamentType: form.tournamentType,
          entryFee: Number(form.entryFee) || 0,
          maxSlots: Number(form.maxSlots) || 16,
          startDate: form.startDate || null,
          description: form.description,
          rules: form.rules,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al crear torneo");
      }
      setMessage({ type: "success", text: "Torneo creado exitosamente" });
      setForm({ ...emptyForm });
      setView("list");
      fetchTournaments();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const res = await adminFetch("/api/admin/tournaments", {
        method: "PUT",
        body: JSON.stringify({
          id: selectedTournament.id,
          name: form.name,
          game: form.game,
          format: form.format,
          tournamentType: form.tournamentType,
          entryFee: Number(form.entryFee),
          maxSlots: Number(form.maxSlots),
          startDate: form.startDate || null,
          description: form.description,
          rules: form.rules,
          status: form.status,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al actualizar torneo");
      }
      setMessage({ type: "success", text: "Torneo actualizado" });
      setEditing(false);
      fetchTournaments();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (t: any) => {
    setSelectedTournament(t);
    setView("detail");
    setEditing(false);
    setShowResults(false);
    setMessage({ type: "", text: "" });
  };

  const startEdit = () => {
    if (!selectedTournament) return;
    setForm({
      name: selectedTournament.name || "",
      game: selectedTournament.game || "Warzone - Battle Royale",
      format: selectedTournament.format || "Trios",
      tournamentType: selectedTournament.tournamentType || "detri",
      entryFee: String(selectedTournament.entryFee ?? ""),
      maxSlots: String(selectedTournament.maxSlots ?? ""),
      startDate: selectedTournament.startDate ? new Date(selectedTournament.startDate).toISOString().slice(0, 16) : "",
      description: selectedTournament.description || "",
      rules: selectedTournament.rules || "",
      region: "latam-norte",
      prizeDistribution: "winner_takes_all",
      minTrustScore: "0",
      status: selectedTournament.status || "registration",
      streamUrl: "",
      discordChannel: "",
      mapRotation: "",
    });
    setEditing(true);
  };

  const filteredTournaments = filterStatus === "all"
    ? tournaments
    : tournaments.filter((t: any) => t.status === filterStatus);

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface-2 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
            <div className="h-4 w-40 bg-surface-2 rounded mb-2" />
            <div className="h-3 w-24 bg-surface-2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button onClick={fetchTournaments} className="px-4 py-2 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors">Reintentar</button>
      </div>
    );
  }

  // ── Results Capture ────────────────────────────────────────────
  if (view === "detail" && showResults && selectedTournament) {
    return (
      <AdminTournamentResults
        tournament={selectedTournament}
        onBack={() => setShowResults(false)}
        onSaved={() => { setShowResults(false); fetchTournaments(); }}
      />
    );
  }

  // ── Tournament Detail ──────────────────────────────────────────
  if (view === "detail" && selectedTournament) {
    const t = selectedTournament;
    const entries = t.entries || [];
    const results = t.results || [];
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => { setView("list"); setSelectedTournament(null); }} className="px-3 py-1.5 bg-surface-2 border border-border text-muted rounded-lg text-xs hover:text-foreground transition-colors">&larr; Volver</button>
          <h2 className="text-lg font-bold text-foreground">{t.name}</h2>
          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${statusBadge(t.status)}`}>{statusLabel(t.status)}</span>
        </div>

        {message.text && (
          <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>{message.text}</div>
        )}

        {/* Info Cards */}
        {!editing && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Juego", value: t.game, icon: "🎮" },
              { label: "Formato", value: t.format, icon: "👥" },
              { label: "Tipo", value: TYPE_OPTIONS.find(o => o.value === t.tournamentType)?.label || t.tournamentType, icon: "🏆" },
              { label: "Entry Fee", value: t.entryFee > 0 ? `$${t.entryFee}` : "Gratis", icon: "💰" },
              { label: "Jugadores", value: `${entries.length} / ${t.maxSlots}`, icon: "👤" },
              { label: "Prize Pool", value: `$${t.prizePool || 0}`, icon: "💎" },
              { label: "Fecha Inicio", value: t.startDate ? new Date(t.startDate).toLocaleString() : "Por definir", icon: "📅" },
              { label: "Creado", value: new Date(t.createdAt).toLocaleDateString(), icon: "🕐" },
            ].map((item, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-[10px] text-muted uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Description & Rules */}
        {!editing && (t.description || t.rules) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {t.description && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Descripcion</h4>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{t.description}</p>
              </div>
            )}
            {t.rules && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Reglas</h4>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{t.rules}</p>
              </div>
            )}
          </div>
        )}

        {/* Edit Form */}
        {editing && renderForm(form, setForm, handleUpdate, saving, "Guardar Cambios", () => setEditing(false))}

        {/* Entries Table */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Jugadores Inscritos ({entries.length})</h3>
            {entries.length > 0 && <span className="text-xs text-muted">Capacidad: {Math.round((entries.length / t.maxSlots) * 100)}%</span>}
          </div>
          {entries.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">No hay jugadores inscritos aun.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
                    <th className="pb-3 pr-4 font-semibold">#</th>
                    <th className="pb-3 pr-4 font-semibold">Jugador</th>
                    <th className="pb-3 pr-4 font-semibold">Tier</th>
                    <th className="pb-3 pr-4 font-semibold">Monto Pagado</th>
                    <th className="pb-3 font-semibold">Fecha Inscripcion</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry: any, i: number) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-surface-2/60 transition-colors">
                      <td className="py-3 pr-4 text-muted text-xs">{i + 1}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          {entry.user?.avatar ? (
                            <img src={entry.user.avatar} className="w-7 h-7 rounded-full" alt="" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-muted">
                              {(entry.user?.username || "?")[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-foreground">{entry.user?.username || entry.userId}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${entry.user?.tier === "PRO" ? "badge-pro" : entry.user?.tier === "AM" ? "badge-am" : "badge-detri"}`}>
                          {entry.user?.tier || "Detri"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-green-400 font-medium">${entry.paidAmount || t.entryFee}</td>
                      <td className="py-3 text-xs text-muted">{entry.joinedAt ? new Date(entry.joinedAt).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results Summary (if exists) */}
        {results.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-bold text-foreground mb-4">Resultados Capturados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
                    <th className="pb-3 pr-4 font-semibold">Pos</th>
                    <th className="pb-3 pr-4 font-semibold">Jugador</th>
                    <th className="pb-3 pr-4 font-semibold">Kills</th>
                    <th className="pb-3 pr-4 font-semibold">Deaths</th>
                    <th className="pb-3 pr-4 font-semibold">K/D</th>
                    <th className="pb-3 font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {[...results].sort((a: any, b: any) => a.placement - b.placement).map((r: any, i: number) => (
                    <tr key={i} className={`border-b border-border/50 ${i === 0 ? "bg-yellow-500/5" : ""}`}>
                      <td className="py-3 pr-4 font-bold text-foreground">#{r.placement}</td>
                      <td className="py-3 pr-4 font-medium text-foreground">{r.user?.username || r.userId}</td>
                      <td className="py-3 pr-4 text-red-400 font-semibold">{r.kills}</td>
                      <td className="py-3 pr-4 text-muted">{r.deaths}</td>
                      <td className="py-3 pr-4 text-foreground">{r.deaths > 0 ? (r.kills / r.deaths).toFixed(2) : r.kills.toFixed(2)}</td>
                      <td className="py-3 font-semibold text-foreground">{r.teamPoints || (r.kills * 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setShowResults(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {results.length > 0 ? "Editar Resultados" : "Capturar Resultados"}
          </button>
          <button onClick={startEdit} className="flex items-center gap-2 px-5 py-2.5 bg-surface-2 border border-border text-muted rounded-xl text-sm font-semibold hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Editar Torneo
          </button>
        </div>
      </div>
    );
  }

  // ── Create Form ────────────────────────────────────────────────
  if (view === "create") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => { setView("list"); setMessage({ type: "", text: "" }); }} className="px-3 py-1.5 bg-surface-2 border border-border text-muted rounded-lg text-xs hover:text-foreground transition-colors">&larr; Volver</button>
          <h2 className="text-lg font-bold text-foreground">Crear Nuevo Torneo</h2>
        </div>

        {message.text && (
          <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>{message.text}</div>
        )}

        {renderForm(form, setForm, handleCreate, saving, "Crear Torneo", null)}
      </div>
    );
  }

  // ── List View ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Gestion de Torneos</h2>
          <p className="text-xs text-muted mt-0.5">{tournaments.length} torneos registrados</p>
        </div>
        <button
          onClick={() => { setView("create"); setForm({ ...emptyForm }); setMessage({ type: "", text: "" }); }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Crear Torneo
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-1 bg-surface-2 rounded-xl p-1">
        {[{ value: "all", label: "Todos" }, ...STATUS_OPTIONS].map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === s.value ? "bg-surface-3 text-foreground" : "text-muted hover:text-foreground"}`}
          >
            {s.label}
            {s.value !== "all" && (
              <span className="ml-1 text-[10px] opacity-60">
                ({tournaments.filter((t: any) => t.status === s.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: tournaments.length, color: "text-foreground" },
          { label: "Activos", value: tournaments.filter((t: any) => t.status === "in_progress").length, color: "text-yellow-400" },
          { label: "Registro", value: tournaments.filter((t: any) => t.status === "registration").length, color: "text-blue-400" },
          { label: "Finalizados", value: tournaments.filter((t: any) => t.status === "finished").length, color: "text-green-400" },
        ].map((s, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold ${s.color}">{s.value}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {filteredTournaments.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-muted text-sm">No hay torneos {filterStatus !== "all" ? `con estado "${statusLabel(filterStatus)}"` : "creados"}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-surface border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2/50 text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Juego</th>
                <th className="px-4 py-3 font-semibold">Formato</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Entry</th>
                <th className="px-4 py-3 font-semibold">Slots</th>
                <th className="px-4 py-3 font-semibold">Prize</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredTournaments.map((t: any) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-surface-2/60 transition-colors cursor-pointer" onClick={() => openDetail(t)}>
                  <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                  <td className="px-4 py-3 text-muted text-xs">{t.game}</td>
                  <td className="px-4 py-3 text-muted">{t.format}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-3 text-muted">
                      {TYPE_OPTIONS.find(o => o.value === t.tournamentType)?.label || t.tournamentType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{t.entryFee > 0 ? `$${t.entryFee}` : "Gratis"}</td>
                  <td className="px-4 py-3 text-muted">{(t.entries || []).length}/{t.maxSlots}</td>
                  <td className="px-4 py-3 text-green-400 font-medium">${t.prizePool || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(t.status)}`}>{statusLabel(t.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{t.startDate ? new Date(t.startDate).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Shared Form Component ────────────────────────────────────────
function renderForm(
  form: any,
  setForm: (f: any) => void,
  onSubmit: (e: React.FormEvent) => void,
  saving: boolean,
  submitLabel: string,
  onCancel: (() => void) | null
) {
  return (
    <form onSubmit={onSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">1</span>
          Informacion Basica
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Nombre del Torneo *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Copa Phoenix #13 — Battle Royale Trios" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Modo de Juego *</label>
            <select value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
              <optgroup label="Warzone">
                {GAME_OPTIONS.filter(g => g.value.startsWith("Warzone")).map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </optgroup>
              <optgroup label="Modern Warfare 3">
                {GAME_OPTIONS.filter(g => g.value.startsWith("MW3")).map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </optgroup>
              <optgroup label="Black Ops 6">
                {GAME_OPTIONS.filter(g => g.value.startsWith("BO6")).map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </optgroup>
              <optgroup label="Custom">
                {GAME_OPTIONS.filter(g => g.value.startsWith("Custom")).map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </optgroup>
            </select>
            <p className="text-[10px] text-muted/60 mt-1">{GAME_OPTIONS.find(g => g.value === form.game)?.desc}</p>
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Formato *</label>
            <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
              <optgroup label="Battle Royale">
                {FORMAT_OPTIONS.filter(f => ["Solos", "Duos", "Trios", "Quads"].includes(f.value)).map((f) => <option key={f.value} value={f.value}>{f.label} — {f.desc}</option>)}
              </optgroup>
              <optgroup label="Versus">
                {FORMAT_OPTIONS.filter(f => ["1v1", "2v2", "3v3", "6v6"].includes(f.value)).map((f) => <option key={f.value} value={f.value}>{f.label} — {f.desc}</option>)}
              </optgroup>
              <optgroup label="Bracket / Eliminacion">
                {FORMAT_OPTIONS.filter(f => f.value.startsWith("Bracket")).map((f) => <option key={f.value} value={f.value}>{f.label} — {f.desc}</option>)}
              </optgroup>
              <optgroup label="Otro">
                {FORMAT_OPTIONS.filter(f => f.value === "Custom").map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Tournament Config */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">2</span>
          Configuracion del Torneo
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Tipo / Categoria *</label>
            <select value={form.tournamentType} onChange={(e) => setForm({ ...form, tournamentType: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
              {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Entry Fee ($)</label>
            <input type="number" min={0} step="0.01" value={form.entryFee} onChange={(e) => setForm({ ...form, entryFee: e.target.value })} placeholder="0 = Gratis" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Max Jugadores / Equipos *</label>
            <input type="number" required min={2} value={form.maxSlots} onChange={(e) => setForm({ ...form, maxSlots: e.target.value })} placeholder="16" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Fecha y Hora de Inicio</label>
            <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Region</label>
            <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
              {REGION_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Distribucion de Premios</label>
            <select value={form.prizeDistribution} onChange={(e) => setForm({ ...form, prizeDistribution: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
              {PRIZE_DISTRIBUTION.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Details */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">3</span>
          Detalles y Reglas
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Descripcion</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Descripcion publica del torneo que veran los jugadores..." className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 resize-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Reglas</label>
            <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={4} placeholder="1. No se permiten hacks ni exploits&#10;2. Todos los jugadores deben estar en el Discord&#10;3. Screenshots obligatorios al final de cada partida&#10;4. ..." className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 resize-none transition-colors" />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50">
          {saving && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
          {saving ? "Guardando..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-3 bg-surface-2 border border-border text-muted rounded-xl text-sm hover:text-foreground transition-colors">Cancelar</button>
        )}
      </div>
    </form>
  );
}
