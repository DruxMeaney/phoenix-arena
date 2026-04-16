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

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);
  const [selectedWinner, setSelectedWinner] = useState("");
  const [resolutionText, setResolutionText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchDisputes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminFetch("/api/disputes");
      if (!res.ok) throw new Error("Error al cargar disputas");
      const data = await res.json();
      setDisputes(data.disputes || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleResolve = async (dispute: any) => {
    if (!selectedWinner) {
      setMessage({ type: "error", text: "Selecciona un ganador" });
      return;
    }
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const disputeId = dispute._id || dispute.id;
      const res = await adminFetch("/api/disputes", {
        method: "PUT",
        body: JSON.stringify({
          id: disputeId,
          winnerId: selectedWinner,
          resolution: resolutionText,
          status: "resolved",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al resolver disputa");
      }
      setMessage({ type: "success", text: "Disputa resuelta exitosamente" });
      setResolving(null);
      setSelectedWinner("");
      setResolutionText("");
      fetchDisputes();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/15 text-yellow-400";
      case "in_review": case "en_revision": return "bg-orange-500/15 text-orange-400";
      case "resolved": return "bg-green-500/15 text-green-400";
      default: return "bg-surface-3 text-muted";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "in_review": case "en_revision": return "En Revision";
      case "resolved": return "Resuelto";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface-2 rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
            <div className="h-4 w-56 bg-surface-2 rounded mb-2" />
            <div className="h-3 w-32 bg-surface-2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button onClick={fetchDisputes} className="px-4 py-2 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground">Disputas</h2>

      {message.text && (
        <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message.text}
        </div>
      )}

      {disputes.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-muted text-sm">No hay disputas activas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d: any) => {
            const disputeId = d._id || d.id || "";
            const isExpanded = expandedId === disputeId;
            const isResolving = resolving === disputeId;
            const match = d.match || {};
            const participants = match.participants || match.players || d.participants || [];

            return (
              <div key={disputeId} className="bg-surface border border-border rounded-xl overflow-hidden">
                {/* Header */}
                <button
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-surface-2/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : disputeId)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">
                        Disputa #{disputeId.slice(-6)}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(d.status)}`}>
                        {statusLabel(d.status)}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {d.reporterUsername || d.reporter || "Reportador"} - {match.game || d.game || "Partida"} - ${match.amount || d.amount || 0}
                    </p>
                  </div>
                  <span className="text-xs text-muted shrink-0">
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ""}
                  </span>
                  <svg
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`h-4 w-4 text-muted transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border">
                    <div className="pt-4 space-y-4">
                      {/* Match context */}
                      <div className="bg-surface-2 rounded-xl p-4 space-y-2">
                        <h4 className="text-xs text-muted uppercase font-semibold">Contexto de la Partida</h4>
                        <div className="grid gap-2 sm:grid-cols-3 text-sm">
                          <div><span className="text-xs text-muted">ID Partida:</span><p className="text-foreground font-mono text-xs">{(match._id || match.id || d.matchId || "").slice(-8)}</p></div>
                          <div><span className="text-xs text-muted">Juego:</span><p className="text-foreground">{match.game || d.game || "-"}</p></div>
                          <div><span className="text-xs text-muted">Monto:</span><p className="text-foreground">${match.amount || d.amount || 0}</p></div>
                        </div>
                        {participants.length > 0 && (
                          <div>
                            <span className="text-xs text-muted">Jugadores:</span>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {participants.map((p: any, i: number) => (
                                <span key={i} className="text-xs bg-surface-3 text-foreground px-2 py-1 rounded-lg">
                                  {p.username || p.name || p.userId || p}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reason */}
                      <div>
                        <span className="text-xs text-muted uppercase font-semibold">Razon</span>
                        <p className="text-sm text-foreground mt-1">{d.reason || "Sin razon especificada"}</p>
                      </div>

                      {/* Evidence */}
                      {d.evidenceUrl && (
                        <div>
                          <span className="text-xs text-muted uppercase font-semibold">Evidencia</span>
                          <a href={d.evidenceUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-400 hover:text-blue-300 mt-1 truncate">
                            {d.evidenceUrl}
                          </a>
                        </div>
                      )}

                      {/* Resolution form */}
                      {d.status !== "resolved" && (
                        <>
                          {!isResolving ? (
                            <button
                              onClick={() => { setResolving(disputeId); setSelectedWinner(""); setResolutionText(""); }}
                              className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all"
                            >
                              Resolver Disputa
                            </button>
                          ) : (
                            <div className="bg-surface-2 rounded-xl p-4 space-y-3">
                              <h4 className="text-xs text-muted uppercase font-semibold">Resolver</h4>
                              <div>
                                <label className="block text-xs text-muted mb-1.5">Ganador</label>
                                <div className="flex gap-2 flex-wrap">
                                  {participants.map((p: any, i: number) => {
                                    const pId = p.userId || p._id || p.id || String(p);
                                    const pName = p.username || p.name || pId;
                                    return (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => setSelectedWinner(pId)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedWinner === pId ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-surface border-border text-muted hover:text-foreground"}`}
                                      >
                                        {pName}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-muted mb-1.5">Resolucion</label>
                                <textarea
                                  value={resolutionText}
                                  onChange={(e) => setResolutionText(e.target.value)}
                                  rows={2}
                                  placeholder="Detalles de la resolucion..."
                                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 resize-none"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleResolve(d)}
                                  disabled={!selectedWinner || saving}
                                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50"
                                >
                                  {saving ? "Resolviendo..." : "Confirmar Resolucion"}
                                </button>
                                <button
                                  onClick={() => { setResolving(null); setSelectedWinner(""); setResolutionText(""); }}
                                  className="px-3 py-2 bg-surface border border-border text-muted rounded-lg text-xs hover:text-foreground transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Already resolved */}
                      {d.status === "resolved" && d.resolution && (
                        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                          <span className="text-xs text-green-400 uppercase font-semibold">Resolucion</span>
                          <p className="text-sm text-foreground mt-1">{d.resolution}</p>
                          {d.winnerId && <p className="text-xs text-muted mt-1">Ganador: {d.winnerUsername || d.winnerId}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
