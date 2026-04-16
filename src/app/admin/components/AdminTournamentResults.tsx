"use client";

import { useState, useEffect } from "react";

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

interface PlayerResult {
  userId: string;
  username: string;
  kills: number;
  deaths: number;
  placement: number;
}

interface Props {
  tournament: any;
  onBack: () => void;
  onSaved: () => void;
}

export default function AdminTournamentResults({ tournament, onBack, onSaved }: Props) {
  const entries = tournament.entries || [];
  const existingResults = tournament.results || [];
  const hasExisting = existingResults.length > 0;

  const [results, setResults] = useState<PlayerResult[]>([]);
  const [totalTeams, setTotalTeams] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (hasExisting) {
      // Pre-fill with existing results
      const mapped = entries.map((entry: any) => {
        const existing = existingResults.find(
          (r: any) => r.userId === (entry.userId || entry._id)
        );
        return {
          userId: entry.userId || entry._id || "",
          username: entry.username || entry.userId || "Jugador",
          kills: existing?.kills ?? 0,
          deaths: existing?.deaths ?? 0,
          placement: existing?.placement ?? 1,
        };
      });
      setResults(mapped);
      setTotalTeams(String(tournament.totalTeams || entries.length));
      setEvidenceUrl(tournament.evidenceUrl || "");
    } else {
      const mapped = entries.map((entry: any) => ({
        userId: entry.userId || entry._id || "",
        username: entry.username || entry.userId || "Jugador",
        kills: 0,
        deaths: 0,
        placement: 1,
      }));
      setResults(mapped);
      setTotalTeams(String(entries.length));
    }
  }, [entries, existingResults, hasExisting, tournament.totalTeams, tournament.evidenceUrl]);

  const updateResult = (index: number, field: keyof PlayerResult, value: number) => {
    setResults((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const validate = (): string | null => {
    for (const r of results) {
      if (r.placement < 1) return `Placement invalido para ${r.username}`;
      if (r.kills < 0) return `Kills no puede ser negativo para ${r.username}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const tournamentId = tournament._id || tournament.id;
      const res = await adminFetch(`/api/admin/tournaments/${tournamentId}/results`, {
        method: "POST",
        body: JSON.stringify({
          results: results.map((r) => ({
            userId: r.userId,
            kills: r.kills,
            deaths: r.deaths,
            placement: r.placement,
          })),
          totalTeams: Number(totalTeams),
          evidenceUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar resultados");
      }

      setMessage({ type: "success", text: hasExisting ? "Resultados actualizados exitosamente" : "Resultados guardados exitosamente" });
      setTimeout(() => onSaved(), 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-surface-2 border border-border text-muted rounded-lg text-xs hover:text-foreground transition-colors"
        >
          &larr; Volver
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">Capturar Resultados</h2>
          <p className="text-sm text-muted">{tournament.name} - {tournament.game} {tournament.format}</p>
        </div>
      </div>

      {message.text && (
        <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message.text}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-muted text-sm">No hay jugadores inscritos en este torneo.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Results table */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-2/50 text-left text-xs text-muted uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">Jugador</th>
                    <th className="px-4 py-3 font-semibold">Kills</th>
                    <th className="px-4 py-3 font-semibold">Deaths</th>
                    <th className="px-4 py-3 font-semibold">Placement</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.userId || i} className="border-b border-border/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-muted">
                            {r.username[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{r.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={r.kills}
                          onChange={(e) => updateResult(i, "kills", Math.max(0, Number(e.target.value)))}
                          className="w-20 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={r.deaths}
                          onChange={(e) => updateResult(i, "deaths", Math.max(0, Number(e.target.value)))}
                          className="w-20 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={1}
                          value={r.placement}
                          onChange={(e) => updateResult(i, "placement", Math.max(1, Number(e.target.value)))}
                          className="w-20 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* General fields */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-foreground text-sm">Informacion General</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-muted mb-1.5">Total de Equipos / Jugadores</label>
                <input
                  type="number"
                  min={1}
                  value={totalTeams}
                  onChange={(e) => setTotalTeams(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">URL de Evidencia (screenshot)</label>
                <input
                  type="text"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50"
          >
            {saving ? "Guardando..." : hasExisting ? "Actualizar Resultados" : "Guardar Resultados"}
          </button>
        </form>
      )}
    </div>
  );
}
