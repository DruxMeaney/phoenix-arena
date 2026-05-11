"use client";

import { useState, useEffect, useMemo } from "react";

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
  teamName: string;
  teamNumber: number;
  teamGroup: string;
  kills: number;
  deaths: number;
  placement: number;
  roundsPlayed: number;
  averagePlacement: number;
  averageKills: number;
  teamKills: number;
  skillPoints: number;
  rawPoints: number;
  matchpointWin: boolean;
  paymentVerified: boolean;
  discordVerified: boolean;
  photoVerified: boolean;
  flyerVerified: boolean;
  rulesAccepted: boolean;
  adminVerified: boolean;
}

type ComplianceField =
  | "paymentVerified"
  | "discordVerified"
  | "rulesAccepted"
  | "photoVerified"
  | "flyerVerified"
  | "adminVerified";

interface TournamentEntryForResults {
  _id?: string;
  userId?: string;
  username?: string;
  user?: {
    id?: string;
    username?: string;
  };
}

interface TournamentExistingResult {
  userId: string;
  teamName?: string | null;
  teamNumber?: number | null;
  teamGroup?: string | null;
  kills?: number;
  deaths?: number;
  placement?: number;
  roundsPlayed?: number;
  averagePlacement?: number;
  averageKills?: number;
  teamKills?: number;
  teamPoints?: number;
  skillPoints?: number;
  rawPoints?: number;
  matchpointWin?: boolean;
  paymentVerified?: boolean;
  discordVerified?: boolean;
  photoVerified?: boolean;
  flyerVerified?: boolean;
  rulesAccepted?: boolean;
  adminVerified?: boolean;
}

interface TournamentForResults {
  _id?: string;
  id?: string;
  name: string;
  game: string;
  format: string;
  totalTeams?: number;
  maxSlots?: number;
  mapCount?: number;
  evidenceUrl?: string | null;
  entries?: TournamentEntryForResults[];
  results?: TournamentExistingResult[];
}

interface Props {
  tournament: TournamentForResults;
  onBack: () => void;
  onSaved: () => void;
}

const complianceFields: Array<[ComplianceField, string]> = [
  ["paymentVerified", "Pago"],
  ["discordVerified", "Discord"],
  ["rulesAccepted", "Reglas"],
  ["photoVerified", "Foto"],
  ["flyerVerified", "Flyer"],
  ["adminVerified", "Admin"],
];

export default function AdminTournamentResults({ tournament, onBack, onSaved }: Props) {
  const entries = useMemo(() => tournament.entries ?? [], [tournament.entries]);
  const existingResults = useMemo(() => tournament.results ?? [], [tournament.results]);
  const hasExisting = existingResults.length > 0;

  const [results, setResults] = useState<PlayerResult[]>([]);
  const [totalTeams, setTotalTeams] = useState("");
  const [mapCount, setMapCount] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [verified, setVerified] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const entryUserId = (entry: TournamentEntryForResults) => entry.userId || entry.user?.id || entry._id || "";
    const entryUsername = (entry: TournamentEntryForResults) =>
      entry.user?.username || entry.username || entry.userId || "Jugador";
    const mapExisting = (entry: TournamentEntryForResults): PlayerResult => {
      const userId = entryUserId(entry);
      const existing = existingResults.find((r) => r.userId === userId);

      return {
        userId,
        username: entryUsername(entry),
        teamName: existing?.teamName ?? "",
        teamNumber: existing?.teamNumber ?? 0,
        teamGroup: existing?.teamGroup ?? "",
        kills: existing?.kills ?? 0,
        deaths: existing?.deaths ?? 0,
        placement: existing?.placement || 1,
        roundsPlayed: existing?.roundsPlayed ?? tournament.mapCount ?? 0,
        averagePlacement: existing?.averagePlacement ?? existing?.placement ?? 1,
        averageKills: existing?.averageKills ?? 0,
        teamKills: existing?.teamKills ?? 0,
        skillPoints: existing?.skillPoints ?? existing?.teamPoints ?? 0,
        rawPoints: existing?.rawPoints ?? existing?.teamPoints ?? 0,
        matchpointWin: existing?.matchpointWin ?? false,
        paymentVerified: existing?.paymentVerified ?? false,
        discordVerified: existing?.discordVerified ?? false,
        photoVerified: existing?.photoVerified ?? false,
        flyerVerified: existing?.flyerVerified ?? false,
        rulesAccepted: existing?.rulesAccepted ?? false,
        adminVerified: existing?.adminVerified ?? true,
      };
    };

    if (hasExisting) {
      setResults(entries.map(mapExisting));
      setTotalTeams(String(tournament.totalTeams || tournament.maxSlots || entries.length));
      setMapCount(String(tournament.mapCount || ""));
      setEvidenceUrl(tournament.evidenceUrl || "");
    } else {
      setResults(entries.map(mapExisting));
      setTotalTeams(String(tournament.maxSlots || entries.length));
      setMapCount(String(tournament.mapCount || ""));
    }
  }, [entries, existingResults, hasExisting, tournament]);

  const updateResult = <K extends keyof PlayerResult>(
    index: number,
    field: K,
    value: PlayerResult[K]
  ) => {
    setResults((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const legacyMultiplier = (placement: number) => {
    if (placement <= 0) return 0;
    if (placement === 1) return 1.6;
    if (placement <= 5) return 1.4;
    if (placement <= 10) return 1.2;
    return 1;
  };

  const estimatedSkillPoints = (result: PlayerResult) => {
    const placement = Math.round(result.averagePlacement || result.placement);
    const teamKills = result.teamKills || result.kills;
    return Math.round(teamKills * legacyMultiplier(placement) * 100) / 100;
  };

  const validate = (): string | null => {
    for (const r of results) {
      if (r.placement < 1) return `Placement invalido para ${r.username}`;
      if (r.kills < 0) return `Kills no puede ser negativo para ${r.username}`;
      if (r.teamKills < 0) return `Kills de equipo no puede ser negativo para ${r.username}`;
      if (r.skillPoints < 0) return `Puntos skill no puede ser negativo para ${r.username}`;
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
            teamName: r.teamName,
            teamNumber: r.teamNumber || null,
            teamGroup: r.teamGroup,
            kills: r.kills,
            deaths: r.deaths,
            placement: r.placement,
            roundsPlayed: r.roundsPlayed,
            averagePlacement: r.averagePlacement || r.placement,
            averageKills: r.averageKills || (r.roundsPlayed > 0 ? r.kills / r.roundsPlayed : r.kills),
            teamKills: r.teamKills || r.kills,
            skillPoints: r.skillPoints || estimatedSkillPoints(r),
            rawPoints: r.rawPoints || (r.matchpointWin ? 999 : r.skillPoints || estimatedSkillPoints(r)),
            matchpointWin: r.matchpointWin,
            paymentVerified: r.paymentVerified,
            discordVerified: r.discordVerified,
            photoVerified: r.photoVerified,
            flyerVerified: r.flyerVerified,
            rulesAccepted: r.rulesAccepted,
            adminVerified: r.adminVerified,
          })),
          totalTeams: Number(totalTeams),
          evidenceUrl,
          eventMeta: {
            mapCount: Number(mapCount) || 0,
            verified,
            sourceType: "tournament_capture",
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar resultados");
      }

      setMessage({ type: "success", text: hasExisting ? "Resultados actualizados exitosamente" : "Resultados guardados exitosamente" });
      setTimeout(() => onSaved(), 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al guardar resultados",
      });
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
                    <th className="px-4 py-3 font-semibold">Equipo</th>
                    <th className="px-4 py-3 font-semibold">Kills</th>
                    <th className="px-4 py-3 font-semibold">Deaths</th>
                    <th className="px-4 py-3 font-semibold">Placement</th>
                    <th className="px-4 py-3 font-semibold">Rondas</th>
                    <th className="px-4 py-3 font-semibold">Avg Pos</th>
                    <th className="px-4 py-3 font-semibold">Team Kills</th>
                    <th className="px-4 py-3 font-semibold">Skill Pts</th>
                    <th className="px-4 py-3 font-semibold">Matchpoint</th>
                    <th className="px-4 py-3 font-semibold">Verif.</th>
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
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={r.teamNumber || ""}
                            onChange={(e) => updateResult(i, "teamNumber", Math.max(0, Number(e.target.value)))}
                            placeholder="#"
                            className="w-16 bg-surface-2 border border-border rounded-lg px-2 py-2 text-sm text-foreground text-center focus:outline-none focus:border-red-500 transition-colors"
                          />
                          <input
                            type="text"
                            value={r.teamName}
                            onChange={(e) => updateResult(i, "teamName", e.target.value)}
                            placeholder="Nombre"
                            className="w-32 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors"
                          />
                          <input
                            type="text"
                            value={r.teamGroup}
                            onChange={(e) => updateResult(i, "teamGroup", e.target.value)}
                            placeholder="Grupo"
                            className="w-20 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors"
                          />
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
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={r.roundsPlayed}
                          onChange={(e) => updateResult(i, "roundsPlayed", Math.max(0, Number(e.target.value)))}
                          className="w-20 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={r.averagePlacement}
                          onChange={(e) => updateResult(i, "averagePlacement", Math.max(0, Number(e.target.value)))}
                          className="w-20 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={r.teamKills}
                          onChange={(e) => updateResult(i, "teamKills", Math.max(0, Number(e.target.value)))}
                          className="w-20 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={r.skillPoints}
                            onChange={(e) => updateResult(i, "skillPoints", Math.max(0, Number(e.target.value)))}
                            className="w-24 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:border-red-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => updateResult(i, "skillPoints", estimatedSkillPoints(r))}
                            className="px-2 py-2 rounded-lg border border-border text-xs text-muted hover:text-foreground hover:border-red-500/50 transition-colors"
                          >
                            Calc
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <label className="inline-flex items-center gap-2 text-xs text-muted">
                          <input
                            type="checkbox"
                            checked={r.matchpointWin}
                            onChange={(e) => updateResult(i, "matchpointWin", e.target.checked)}
                            className="h-4 w-4 accent-red-500"
                          />
                          MP
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <div className="grid grid-cols-3 gap-1 text-[10px] text-muted">
                          {complianceFields.map(([field, label]) => (
                            <label key={field} className="inline-flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={r[field]}
                                onChange={(e) => updateResult(i, field, e.target.checked)}
                                className="h-3 w-3 accent-red-500"
                              />
                              {label}
                            </label>
                          ))}
                        </div>
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
                <label className="block text-xs text-muted mb-1.5">Mapas / Rondas</label>
                <input
                  type="number"
                  min={0}
                  value={mapCount}
                  onChange={(e) => setMapCount(e.target.value)}
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
              <label className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="h-4 w-4 accent-red-500"
                />
                Resultado verificado para reconstruccion PSR
              </label>
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
