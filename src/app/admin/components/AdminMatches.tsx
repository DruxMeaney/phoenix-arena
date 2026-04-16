"use client";

import { useState, useEffect, useCallback } from "react";

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

const statusTabs = ["Todos", "open", "in_progress", "pending", "disputed", "resolved"];

function statusLabel(s: string) {
  switch (s) {
    case "open": return "Abierto";
    case "in_progress": return "En Curso";
    case "pending": return "Pendiente";
    case "disputed": return "Disputado";
    case "resolved": return "Resuelto";
    case "cancelled": return "Cancelado";
    default: return s;
  }
}

function statusBadge(s: string) {
  switch (s) {
    case "open": return "bg-blue-500/15 text-blue-400";
    case "in_progress": return "bg-yellow-500/15 text-yellow-400";
    case "pending": return "bg-orange-500/15 text-orange-400";
    case "disputed": return "bg-red-500/15 text-red-400";
    case "resolved": return "bg-green-500/15 text-green-400";
    case "cancelled": return "bg-surface-3 text-muted";
    default: return "bg-surface-3 text-muted";
  }
}

function tabLabel(s: string) {
  if (s === "Todos") return "Todos";
  return statusLabel(s);
}

export default function AdminMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Todos");
  const [showCreate, setShowCreate] = useState(false);
  const [resolveMatch, setResolveMatch] = useState<any>(null);
  const [selectedWinner, setSelectedWinner] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Create form
  const [createForm, setCreateForm] = useState({ game: "Warzone", modalidad: "Kills Race", amount: "", rules: "" });

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminFetch("/api/admin/matches");
      if (!res.ok) throw new Error("Error al cargar partidas");
      const data = await res.json();
      setMatches(data.matches || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const filtered = activeTab === "Todos" ? matches : matches.filter((m) => m.status === activeTab);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const res = await adminFetch("/api/admin/matches", {
        method: "POST",
        body: JSON.stringify({
          ...createForm,
          amount: Number(createForm.amount),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al crear partida");
      }
      setMessage({ type: "success", text: "Partida creada" });
      setShowCreate(false);
      setCreateForm({ game: "Warzone", modalidad: "Kills Race", amount: "", rules: "" });
      fetchMatches();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleForceResolve = async () => {
    if (!resolveMatch || !selectedWinner) return;
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const matchId = resolveMatch._id || resolveMatch.id;
      const res = await fetch(`/api/admin/matches`, {
        method: "PUT",
        body: JSON.stringify({
          id: matchId,
          status: "resolved",
          winnerId: selectedWinner,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al resolver partida");
      }
      setMessage({ type: "success", text: "Partida resuelta" });
      setResolveMatch(null);
      setSelectedWinner("");
      fetchMatches();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-surface-2 rounded-xl animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-surface border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button onClick={fetchMatches} className="px-4 py-2 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-foreground">Partidas</h2>
        <button
          onClick={() => { setShowCreate(!showCreate); setMessage({ type: "", text: "" }); }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          {showCreate ? "Cancelar" : "Crear Partida"}
        </button>
      </div>

      {message.text && (
        <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message.text}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-foreground">Nueva Partida</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-muted mb-1.5">Juego</label>
              <select value={createForm.game} onChange={(e) => setCreateForm({ ...createForm, game: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
                <option>Warzone</option>
                <option>Resurgence</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Modalidad</label>
              <select value={createForm.modalidad} onChange={(e) => setCreateForm({ ...createForm, modalidad: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
                <option>Kills Race</option>
                <option>Placement</option>
                <option>Kills + Placement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Monto ($)</label>
              <input type="number" required min={1} value={createForm.amount} onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })} placeholder="10" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Reglas</label>
              <input type="text" value={createForm.rules} onChange={(e) => setCreateForm({ ...createForm, rules: e.target.value })} placeholder="Reglas adicionales..." className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50">
            {saving ? "Creando..." : "Crear Partida"}
          </button>
        </form>
      )}

      {/* Force resolve modal */}
      {resolveMatch && (
        <div className="bg-surface border border-yellow-500/30 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-foreground text-sm">Resolver Partida</h3>
          <p className="text-sm text-muted">Selecciona el ganador para la partida #{(resolveMatch._id || resolveMatch.id || "").slice(-6)}</p>
          <div className="flex flex-wrap gap-2">
            {(resolveMatch.participants || resolveMatch.players || []).map((p: any, i: number) => {
              const playerId = p.userId || p._id || p.id || p;
              const playerName = p.username || p.name || playerId;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedWinner(playerId)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selectedWinner === playerId ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-surface-2 border-border text-muted hover:text-foreground"}`}
                >
                  {playerName}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleForceResolve}
              disabled={!selectedWinner || saving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50"
            >
              {saving ? "Resolviendo..." : "Confirmar"}
            </button>
            <button onClick={() => { setResolveMatch(null); setSelectedWinner(""); }} className="px-4 py-2.5 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="bg-surface-2 rounded-xl p-1 flex gap-0.5 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? "bg-surface-3 text-foreground" : "text-muted hover:text-foreground"}`}
          >
            {tabLabel(tab)}
            {tab !== "Todos" && (
              <span className="ml-1.5 text-[10px] text-muted">
                ({matches.filter((m) => m.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-muted text-sm">No hay partidas {activeTab !== "Todos" ? `con estado "${tabLabel(activeTab)}"` : ""}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2/50 text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold rounded-tl-lg">ID</th>
                <th className="px-4 py-3 font-semibold">Creador</th>
                <th className="px-4 py-3 font-semibold">Juego</th>
                <th className="px-4 py-3 font-semibold">Modalidad</th>
                <th className="px-4 py-3 font-semibold">Monto</th>
                <th className="px-4 py-3 font-semibold">Jugadores</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any, i: number) => {
                const matchId = m._id || m.id || "";
                const players = m.participants || m.players || [];
                return (
                  <tr key={matchId || i} className="border-b border-border/50 hover:bg-surface-2/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted" title={matchId}>
                      {matchId.slice(-6) || "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{m.creatorUsername || m.creator || "-"}</td>
                    <td className="px-4 py-3 text-muted">{m.game}</td>
                    <td className="px-4 py-3 text-muted">{m.modalidad || m.mode || "-"}</td>
                    <td className="px-4 py-3 text-foreground font-medium">${m.amount || 0}</td>
                    <td className="px-4 py-3 text-muted">{players.length}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(m.status)}`}>
                        {statusLabel(m.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {(m.status === "pending" || m.status === "disputed" || m.status === "in_progress") && (
                        <button
                          onClick={() => { setResolveMatch(m); setSelectedWinner(""); }}
                          className="px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium hover:bg-yellow-500/20 transition-colors"
                        >
                          Resolver
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
