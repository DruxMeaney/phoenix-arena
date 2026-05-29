"use client";

import type { PlayerPsrHistory, HistoryBin } from "@/lib/ranking/player-history";

interface PlayerPsrHistoryProps {
  history: PlayerPsrHistory | null | undefined;
  compact?: boolean;
}

type SeriesMetric = "psr" | "mu" | "sigma" | "performanceSignal" | "lobbyStrength";

const metricLabels: Record<SeriesMetric, string> = {
  psr: "PSR",
  mu: "Mu",
  sigma: "Sigma",
  performanceSignal: "Performance",
  lobbyStrength: "Lobby",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  });
}

function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  return value.toFixed(digits);
}

function seriesPath(values: number[], width: number, height: number): string {
  if (values.length === 0) return "";
  if (values.length === 1) return `M 0 ${height / 2} L ${width} ${height / 2}`;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function LineChart({
  history,
  metric,
}: {
  history: PlayerPsrHistory;
  metric: SeriesMetric;
}) {
  const width = 720;
  const height = 180;
  const values = history.series.map((point) => point[metric]);
  const path = seriesPath(values, width, height);
  const latest = values[values.length - 1];
  const first = values[0];
  const delta = latest !== undefined && first !== undefined ? latest - first : 0;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{metricLabels[metric]}</p>
          <p className="text-xl font-bold text-foreground">{formatNumber(latest)}</p>
        </div>
        <span className={`text-xs font-semibold ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
          {delta >= 0 ? "+" : ""}{formatNumber(delta)}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full overflow-visible">
        <defs>
          <linearGradient id={`line-${metric}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke={`url(#line-${metric})`} strokeWidth="4" strokeLinecap="round" />
        <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill="#ef4444" opacity="0.06" />
      </svg>
    </div>
  );
}

function Histogram({ title, bins }: { title: string; bins: HistoryBin[] }) {
  const max = Math.max(1, ...bins.map((bin) => bin.count));

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      <div className="flex h-32 items-end gap-2">
        {bins.map((bin) => (
          <div key={bin.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-red-700 to-sky-400 shadow-[0_0_16px_rgba(239,68,68,0.22)]"
              style={{ height: `${Math.max(8, (bin.count / max) * 100)}%` }}
            />
            <div className="text-center">
              <p className="text-xs font-bold text-foreground">{bin.count}</p>
              <p className="text-[10px] text-muted">{bin.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatTile({ label, value, tone = "text-foreground" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className={`text-xl font-bold ${tone}`}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

export default function PlayerPsrHistoryView({ history, compact = false }: PlayerPsrHistoryProps) {
  if (!history || history.events.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Historial PSR</h3>
            <p className="mt-1 text-sm text-muted">Aun no hay eventos PSR auditados para este jugador.</p>
          </div>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">Sin datos</span>
        </div>
      </section>
    );
  }

  const latest = history.series[history.series.length - 1];

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">Auditoria PSR</p>
          <h3 className="text-xl font-bold text-foreground">Historial competitivo</h3>
          <p className="mt-1 text-sm text-muted">
            Ultimos {history.windowDays} dias, reconstruido desde deltas auditables del modelo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-muted">
            Modelo {history.current.modelVersion}
          </span>
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-muted">
            Rank {history.current.rank ?? "--"}
          </span>
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-muted">
            Percentil {history.current.percentile ?? "--"}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="PSR actual" value={formatNumber(history.current.psr)} tone="text-red-400" />
        <StatTile label="Mu / Sigma" value={`${formatNumber(history.current.mu)} / ${formatNumber(history.current.sigma)}`} />
        <StatTile label="Delta total" value={`${history.summary.deltaTotal >= 0 ? "+" : ""}${formatNumber(history.summary.deltaTotal)}`} tone={history.summary.deltaTotal >= 0 ? "text-green-400" : "text-red-400"} />
        <StatTile label="Eventos" value={String(history.summary.events)} tone="text-sky-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChart history={history} metric="psr" />
        <LineChart history={history} metric="sigma" />
      </div>

      {!compact && (
        <div className="grid gap-4 lg:grid-cols-3">
          <LineChart history={history} metric="performanceSignal" />
          <LineChart history={history} metric="lobbyStrength" />
          <LineChart history={history} metric="mu" />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        <Histogram title="Placement" bins={history.distributions.placements} />
        <Histogram title="Kills" bins={history.distributions.kills} />
        <Histogram title="Performance" bins={history.distributions.performanceSignal} />
        <Histogram title="Delta PSR" bins={history.distributions.deltaPsr} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Avg placement" value={formatNumber(history.summary.averagePlacement)} />
        <StatTile label="Avg kills/mapa" value={formatNumber(history.summary.averageKills)} />
        <StatTile label="Avg skill points" value={formatNumber(history.summary.averageSkillPoints)} />
        <StatTile label="Matchpoint wins" value={String(history.summary.matchpointWins)} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-bold text-foreground">Eventos que explican el rating</p>
          <p className="text-xs text-muted">Ultimo evento: {latest ? formatDate(latest.date) : "--"}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2/60 text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Evento</th>
                <th className="px-4 py-3 font-semibold">Pos</th>
                <th className="px-4 py-3 font-semibold">Kills</th>
                <th className="px-4 py-3 font-semibold">Skill</th>
                <th className="px-4 py-3 font-semibold">Perf.</th>
                <th className="px-4 py-3 font-semibold">Lobby</th>
                <th className="px-4 py-3 font-semibold">PSR</th>
                <th className="px-4 py-3 font-semibold">Delta</th>
              </tr>
            </thead>
            <tbody>
              {history.events.slice(0, compact ? 8 : 30).map((event) => (
                <tr key={event.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 text-xs text-muted">{formatDate(event.occurredAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{event.tournamentType}</p>
                    <p className="text-[10px] text-muted">{event.sourceType}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground">#{event.placement}</td>
                  <td className="px-4 py-3 text-foreground">{event.kills}</td>
                  <td className="px-4 py-3 text-foreground">{formatNumber(event.skillPoints)}</td>
                  <td className="px-4 py-3 text-foreground">{formatNumber(event.performanceSignal)}</td>
                  <td className="px-4 py-3 text-foreground">{formatNumber(event.lobbyStrength)}</td>
                  <td className="px-4 py-3 text-foreground">{formatNumber(event.psrAfter)}</td>
                  <td className={`px-4 py-3 font-semibold ${event.deltaPsr >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {event.deltaPsr >= 0 ? "+" : ""}{formatNumber(event.deltaPsr)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
