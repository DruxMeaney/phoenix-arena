import { prisma } from "@/lib/db";

export interface HistoryBin {
  label: string;
  count: number;
}

export interface PlayerPsrHistoryEvent {
  id: string;
  occurredAt: string;
  sourceType: string;
  sourceId: string;
  tournamentType: string;
  evidenceUrl: string | null;
  placement: number;
  kills: number;
  muBefore: number;
  muAfter: number;
  sigmaBefore: number;
  sigmaAfter: number;
  psrBefore: number;
  psrAfter: number;
  deltaPsr: number;
  lobbyStrength: number;
  performanceSignal: number;
  resultWeight: number;
  performanceAdjustment: number;
  roundsPlayed: number;
  averagePlacement: number;
  averageKills: number;
  skillPoints: number;
  rawPoints: number;
  matchpointWin: boolean;
}

export interface PlayerPsrHistoryPoint {
  date: string;
  psr: number;
  mu: number;
  sigma: number;
  deltaPsr: number;
  placement: number;
  kills: number;
  performanceSignal: number;
  lobbyStrength: number;
}

export interface PlayerPsrHistory {
  windowDays: number;
  generatedAt: string;
  current: {
    tier: string;
    psr: number;
    mu: number;
    sigma: number;
    matches: number;
    peakPsr: number;
    modelVersion: string;
    rank: number | null;
    percentile: number | null;
  };
  summary: {
    events: number;
    deltaTotal: number;
    averageDelta: number;
    averagePlacement: number;
    averageKills: number;
    averageSkillPoints: number;
    averagePerformanceSignal: number;
    averageLobbyStrength: number;
    bestDelta: number;
    worstDelta: number;
    topThreePlacements: number;
    matchpointWins: number;
  };
  series: PlayerPsrHistoryPoint[];
  distributions: {
    placements: HistoryBin[];
    kills: HistoryBin[];
    performanceSignal: HistoryBin[];
    deltaPsr: HistoryBin[];
  };
  events: PlayerPsrHistoryEvent[];
}

interface ExplanationPayload {
  tournamentType?: string;
  resultWeight?: number;
  performanceAdjustment?: number;
  roundsPlayed?: number;
  averagePlacement?: number;
  averageKills?: number;
  skillPoints?: number;
  rawPoints?: number;
  matchpointWin?: boolean;
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function parseExplanation(value: string): ExplanationPayload {
  try {
    const parsed = JSON.parse(value) as ExplanationPayload;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function binCount<T extends number>(
  values: T[],
  bins: Array<{ label: string; test: (value: T) => boolean }>
): HistoryBin[] {
  return bins.map((bin) => ({
    label: bin.label,
    count: values.filter(bin.test).length,
  }));
}

function distributions(events: PlayerPsrHistoryEvent[]) {
  return {
    placements: binCount(events.map((event) => event.placement), [
      { label: "1", test: (value) => value === 1 },
      { label: "2-3", test: (value) => value >= 2 && value <= 3 },
      { label: "4-5", test: (value) => value >= 4 && value <= 5 },
      { label: "6-10", test: (value) => value >= 6 && value <= 10 },
      { label: "11+", test: (value) => value >= 11 },
    ]),
    kills: binCount(events.map((event) => event.kills), [
      { label: "0-2", test: (value) => value <= 2 },
      { label: "3-5", test: (value) => value >= 3 && value <= 5 },
      { label: "6-9", test: (value) => value >= 6 && value <= 9 },
      { label: "10-14", test: (value) => value >= 10 && value <= 14 },
      { label: "15+", test: (value) => value >= 15 },
    ]),
    performanceSignal: binCount(events.map((event) => event.performanceSignal), [
      { label: "0-.25", test: (value) => value < 0.25 },
      { label: ".25-.50", test: (value) => value >= 0.25 && value < 0.5 },
      { label: ".50-.75", test: (value) => value >= 0.5 && value < 0.75 },
      { label: ".75-1", test: (value) => value >= 0.75 },
    ]),
    deltaPsr: binCount(events.map((event) => event.deltaPsr), [
      { label: "< -1", test: (value) => value < -1 },
      { label: "-1..0", test: (value) => value >= -1 && value < 0 },
      { label: "0..1", test: (value) => value >= 0 && value <= 1 },
      { label: "> 1", test: (value) => value > 1 },
    ]),
  };
}

export async function getPlayerPsrHistory(
  playerId: string,
  options: { days?: number; limit?: number } = {}
): Promise<PlayerPsrHistory | null> {
  const windowDays = options.days ?? 30;
  const limit = options.limit ?? 80;
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const user = await prisma.user.findUnique({
    where: { id: playerId },
    select: {
      tier: true,
      psrScore: true,
      psrMu: true,
      psrSigma: true,
      psrMatches: true,
      peakPsr: true,
      psrModelVersion: true,
    },
  });

  if (!user) return null;

  const [deltas, latestSnapshot] = await Promise.all([
    prisma.rankingDelta.findMany({
      where: {
        playerId,
        eventLog: { occurredAt: { gte: since } },
      },
      include: {
        eventLog: {
          select: {
            sourceType: true,
            sourceId: true,
            occurredAt: true,
            evidenceUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    }),
    prisma.rankingSnapshot.findFirst({
      where: { playerId },
      orderBy: { snapshotAt: "desc" },
      select: { rank: true, percentile: true },
    }),
  ]);

  const events = deltas
    .map((delta) => {
      const explanation = parseExplanation(delta.explanation);
      return {
        id: delta.id,
        occurredAt: delta.eventLog.occurredAt.toISOString(),
        sourceType: delta.eventLog.sourceType,
        sourceId: delta.eventLog.sourceId,
        tournamentType: explanation.tournamentType ?? "detri",
        evidenceUrl: delta.eventLog.evidenceUrl,
        placement: delta.placement,
        kills: delta.kills,
        muBefore: round(delta.muBefore, 4),
        muAfter: round(delta.muAfter, 4),
        sigmaBefore: round(delta.sigmaBefore, 4),
        sigmaAfter: round(delta.sigmaAfter, 4),
        psrBefore: round(delta.psrBefore, 2),
        psrAfter: round(delta.psrAfter, 2),
        deltaPsr: round(delta.deltaPsr, 2),
        lobbyStrength: round(delta.lobbyStrength, 4),
        performanceSignal: round(delta.performanceSignal, 4),
        resultWeight: round(explanation.resultWeight ?? 0, 4),
        performanceAdjustment: round(explanation.performanceAdjustment ?? 0, 4),
        roundsPlayed: Math.max(0, explanation.roundsPlayed ?? 0),
        averagePlacement: round(explanation.averagePlacement ?? delta.placement, 2),
        averageKills: round(explanation.averageKills ?? delta.kills, 2),
        skillPoints: round(explanation.skillPoints ?? 0, 2),
        rawPoints: round(explanation.rawPoints ?? 0, 2),
        matchpointWin: explanation.matchpointWin === true,
      };
    })
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

  const series = events.map((event) => ({
    date: event.occurredAt,
    psr: event.psrAfter,
    mu: event.muAfter,
    sigma: event.sigmaAfter,
    deltaPsr: event.deltaPsr,
    placement: event.placement,
    kills: event.kills,
    performanceSignal: event.performanceSignal,
    lobbyStrength: event.lobbyStrength,
  }));

  return {
    windowDays,
    generatedAt: new Date().toISOString(),
    current: {
      tier: user.tier,
      psr: round(user.psrScore, 2),
      mu: round(user.psrMu, 4),
      sigma: round(user.psrSigma, 4),
      matches: user.psrMatches,
      peakPsr: round(user.peakPsr, 2),
      modelVersion: user.psrModelVersion,
      rank: latestSnapshot?.rank ?? null,
      percentile: latestSnapshot ? round(latestSnapshot.percentile, 2) : null,
    },
    summary: {
      events: events.length,
      deltaTotal: round(events.reduce((sum, event) => sum + event.deltaPsr, 0), 2),
      averageDelta: round(average(events.map((event) => event.deltaPsr)), 2),
      averagePlacement: round(average(events.map((event) => event.placement)), 2),
      averageKills: round(average(events.map((event) => event.averageKills)), 2),
      averageSkillPoints: round(average(events.map((event) => event.skillPoints)), 2),
      averagePerformanceSignal: round(average(events.map((event) => event.performanceSignal)), 4),
      averageLobbyStrength: round(average(events.map((event) => event.lobbyStrength)), 4),
      bestDelta: round(Math.max(0, ...events.map((event) => event.deltaPsr)), 2),
      worstDelta: round(Math.min(0, ...events.map((event) => event.deltaPsr)), 2),
      topThreePlacements: events.filter((event) => event.placement <= 3).length,
      matchpointWins: events.filter((event) => event.matchpointWin).length,
    },
    series,
    distributions: distributions(events),
    events: [...events].reverse(),
  };
}
