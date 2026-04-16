"use client";

import { useState, useEffect, useCallback } from "react";
import AdminTournamentResults from "./AdminTournamentResults";

type ViewMode = "list" | "create" | "detail";

const gameOptions = ["Warzone", "Resurgence"];
const formatOptions = ["Trios", "Duos", "Solos"];
const typeOptions = [
  { value: "detri", label: "Detri" },
  { value: "skills", label: "Skills" },
  { value: "evento", label: "Evento" },
  { value: "mixto", label: "Mixto" },
  { value: "novice", label: "Novice" },
];

function statusBadge(status: string) {
  switch (status) {
    case "registration":
      return "bg-blue-500/15 text-blue-400";
    case "in_progress":
      return "bg-yellow-500/15 text-yellow-400";
    case "finished":
      return "bg-green-500/15 text-green-400";
    case "cancelled":
      return "bg-red-500/15 text-red-400";
    default:
      return "bg-surface-3 text-muted";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "registration": return "Registro";
    case "in_progress": return "En Curso";
    case "finished": return "Finalizado";
    case "cancelled": return "Cancelado";
    default: return status;
  }
}

const emptyForm = {
  name: "",
  game: "Warzone",
  format: "Trios",
  tournamentType: "detri",
  entryFee: "",
  maxSlots: "",
  startDate: "",
  description: "",
  rules: "",
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

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/tournaments");
      if (!res.ok) throw new Error("Error al cargar torneos");
      const data = await res.json();
      setTournaments(data.tournaments || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const res = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          entryFee: Number(form.entryFee),
          maxSlots: Number(form.maxSlots),
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
      const res = await fetch(`/api/admin/tournaments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTournament._id || selectedTournament.id,
          ...form,
          entryFee: Number(form.entryFee),
          maxSlots: Number(form.maxSlots),
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
  };

  const startEdit = () => {
    if (!selectedTournament) return;
    setForm({
      name: selectedTournament.name || "",
      game: selectedTournament.game || "Warzone",
      format: selectedTournament.format || "Trios",
      tournamentType: selectedTournament.tournamentType || "detri",
      entryFee: String(selectedTournament.entryFee || ""),
      maxSlots: String(selectedTournament.maxSlots || ""),
      startDate: selectedTournament.startDate ? new Date(selectedTournament.startDate).toISOString().slice(0, 16) : "",
      description: selectedTournament.description || "",
      rules: selectedTournament.rules || "",
    });
    setEditing(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface-2 rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
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
        <button onClick={fetchTournaments} className="px-4 py-2 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors">
          Reintentar
        </button>
      </div>
    );
  }

  // Results capture view
  if (view === "detail" && showResults && selectedTournament) {
    return (
      <AdminTournamentResults
        tournament={selectedTournament}
        onBack={() => setShowResults(false)}
        onSaved={() => {
          setShowResults(false);
          fetchTournaments();
        }}
      />
    );
  }

  // Detail view
  if (view === "detail" && selectedTournament) {
    const t = selectedTournament;
    const entries = t.entries || [];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setView("list"); setSelectedTournament(null); }}
            className="px-3 py-1.5 bg-surface-2 border border-border text-muted rounded-lg text-xs hover:text-foreground transition-colors"
          >
            &larr; Volver
          </button>
          <h2 className="text-lg font-bold text-foreground">{t.name}</h2>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(t.status)}`}>
            {statusLabel(t.status)}
          </span>
        </div>

        {message.text && (
          <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {message.text}
          </div>
        )}

        {/* Info grid */}
        {!editing && (
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div><span className="text-xs text-muted uppercase">Juego</span><p className="text-sm font-medium text-foreground">{t.game}</p></div>
              <div><span className="text-xs text-muted uppercase">Formato</span><p className="text-sm font-medium text-foreground">{t.format}</p></div>
              <div><span className="text-xs text-muted uppercase">Tipo</span><p className="text-sm font-medium text-foreground">{t.tournamentType}</p></div>
              <div><span className="text-xs text-muted uppercase">Entry Fee</span><p className="text-sm font-medium text-foreground">${t.entryFee}</p></div>
              <div><span className="text-xs text-muted uppercase">Slots</span><p className="text-sm font-medium text-foreground">{entries.length}/{t.maxSlots}</p></div>
              <div><span className="text-xs text-muted uppercase">Prize Pool</span><p className="text-sm font-bold text-green-400">${t.prizePool || 0}</p></div>
              <div className="sm:col-span-2 lg:col-span-3"><span className="text-xs text-muted uppercase">Descripcion</span><p className="text-sm text-muted mt-1">{t.description || "Sin descripcion"}</p></div>
            </div>
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <form onSubmit={handleUpdate} className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-foreground">Editar Torneo</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-muted mb-1.5">Nombre</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Juego</label>
                <select value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
                  {gameOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Formato</label>
                <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
                  {formatOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Tipo</label>
                <select value={form.tournamentType} onChange={(e) => setForm({ ...form, tournamentType: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
                  {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Entry Fee ($)</label>
                <input type="number" value={form.entryFee} onChange={(e) => setForm({ ...form, entryFee: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Max Slots</label>
                <input type="number" value={form.maxSlots} onChange={(e) => setForm({ ...form, maxSlots: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Fecha Inicio</label>
                <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Descripcion</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Reglas</label>
              <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={3} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50">
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Entries table */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-bold text-foreground mb-4">Jugadores inscritos ({entries.length})</h3>
          {entries.length === 0 ? (
            <p className="text-sm text-muted">No hay jugadores inscritos aun.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-wide">
                    <th className="pb-3 pr-4 font-semibold">Jugador</th>
                    <th className="pb-3 pr-4 font-semibold">Monto Pagado</th>
                    <th className="pb-3 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry: any, i: number) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-surface-2/60 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-muted">
                            {(entry.username || entry.userId || "?")[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{entry.username || entry.userId}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-green-400 font-medium">${entry.paidAmount || entry.entryFee || t.entryFee}</td>
                      <td className="py-3 text-xs text-muted">{entry.joinedAt ? new Date(entry.joinedAt).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowResults(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all"
          >
            Capturar Resultados
          </button>
          <button
            onClick={startEdit}
            className="px-5 py-2.5 bg-surface-2 border border-border text-muted rounded-lg text-sm font-semibold hover:text-foreground transition-colors"
          >
            Editar Torneo
          </button>
        </div>
      </div>
    );
  }

  // Create form
  if (view === "create") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="px-3 py-1.5 bg-surface-2 border border-border text-muted rounded-lg text-xs hover:text-foreground transition-colors">
            &larr; Volver
          </button>
          <h2 className="text-lg font-bold text-foreground">Crear Torneo</h2>
        </div>

        {message.text && (
          <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleCreate} className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-muted mb-1.5">Nombre</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Copa Phoenix #13" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Juego</label>
              <select value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
                {gameOptions.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Formato</label>
              <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
                {formatOptions.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Tipo de Torneo</label>
              <select value={form.tournamentType} onChange={(e) => setForm({ ...form, tournamentType: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
                {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Entry Fee ($)</label>
              <input type="number" required min={0} value={form.entryFee} onChange={(e) => setForm({ ...form, entryFee: e.target.value })} placeholder="15" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Max Slots</label>
              <input type="number" required min={2} value={form.maxSlots} onChange={(e) => setForm({ ...form, maxSlots: e.target.value })} placeholder="32" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Fecha Inicio</label>
              <input type="datetime-local" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Descripcion</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Descripcion del torneo..." className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Reglas</label>
            <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={3} placeholder="Reglas del torneo..." className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 resize-none" />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50">
            {saving ? "Creando..." : "Crear Torneo"}
          </button>
        </form>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-foreground">Gestion de Torneos</h2>
        <button
          onClick={() => { setView("create"); setForm({ ...emptyForm }); setMessage({ type: "", text: "" }); }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Crear Torneo
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-muted text-sm">No hay torneos creados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2/50 text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Nombre</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Entry Fee</th>
                <th className="px-4 py-3 font-semibold">Slots</th>
                <th className="px-4 py-3 font-semibold">Prize Pool</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t: any, i: number) => (
                <tr key={t._id || t.id || i} className="border-b border-border/50 hover:bg-surface-2/60 transition-colors cursor-pointer" onClick={() => openDetail(t)}>
                  <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                  <td className="px-4 py-3 text-muted">{t.tournamentType}</td>
                  <td className="px-4 py-3 text-foreground">${t.entryFee}</td>
                  <td className="px-4 py-3 text-muted">{(t.entries || []).length}/{t.maxSlots}</td>
                  <td className="px-4 py-3 text-green-400 font-medium">${t.prizePool || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(t.status)}`}>
                      {statusLabel(t.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{t.startDate ? new Date(t.startDate).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); openDetail(t); }}
                      className="p-1.5 rounded-md bg-surface-2 border border-border text-muted hover:text-foreground transition-colors"
                      title="Ver detalle"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
