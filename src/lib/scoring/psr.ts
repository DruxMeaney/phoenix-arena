import { createHash } from "node:crypto";
import type { Tier } from "./types";
import { assignTier } from "./percentile";

export const PSR_MODEL_VERSION = "psr-0.1-draft";
export const PSR_PHASE = "psr";

export interface PsrConfig {
  modelVersion: string;
  initialMu: number;
  initialSigma: number;
  beta: number;
  tau: number;
  conservativeSigmaMultiplier: number;
  minSigma: number;
  maxSigma: number;
  minMu: number;
  maxMu: number;
  minRankedMatches: number;
  comparisonWeight: number;
  sigmaShrinkFloor: number;
  performance: {
    placementWeight: number;
    killsWeight: number;
    teamWeight: number;
    maxMuAdjustment: number;
  };
  soloEvidence: {
    maxMuAdjustment: number;
    sigmaShrink: number;
  };
  decay: {
    inactivityThresholdDays: number;
    sigmaIncreasePerMonth: number;
  };
}

export const DEFAULT_PSR_CONFIG: PsrConfig = {
  modelVersion: PSR_MODEL_VERSION,
  initialMu: 25,
  initialSigma: 25 / 3,
  beta: 25 / 6,
  tau: 25 / 300,
  conservativeSigmaMultiplier: 3,
  minSigma: 1.2,
  maxSigma: 25 / 3,
  minMu: 0,
  maxMu: 60,
  minRankedMatches: 4,
  comparisonWeight: 0.85,
  sigmaShrinkFloor: 0.55,
  performance: {
    placementWeight: 0.7,
    killsWeight: 0.2,
    teamWeight: 0.1,
    maxMuAdjustment: 0.45,
  },
  soloEvidence: {
    maxMuAdjustment: 0.28,
    sigmaShrink: 0.985,
  },
  decay: {
    inactivityThresholdDays: 30,
    sigmaIncreasePerMonth: 0.45,
  },
};

export interface PsrPlayerInput {
  playerId: string;
  nombre: string;
}

export interface PsrEventEntry {
  playerId: string;
  nombre: string;
  placement: number;
  totalTeams: number;
  kills: number;
  deaths: number;
  teamKills: number;
  teamPoints: number;
  bestKillsInTournament: number;
  bestTeamPointsInTournament: number;
}

export interface PsrEvent {
  sourceType: string;
  sourceId: string;
  seasonId: string;
  tournamentId?: string | null;
  matchId?: string | null;
  tournamentType: string;
  occurredAt: Date;
  evidenceUrl?: string | null;
  verified: boolean;
  entries: PsrEventEntry[];
  recordIds: string[];
}

export interface PsrRatingState {
  playerId: string;
  nombre: string;
  mu: number;
  sigma: number;
  matchesPlayed: number;
  peakPsr: number;
  lastEventAt: Date | null;
}

export interface PsrDelta {
  playerId: string;
  nombre: string;
  muBefore: number;
  sigmaBefore: number;
  psrBefore: number;
  muAfter: number;
  sigmaAfter: number;
  psrAfter: number;
  deltaPsr: number;
  placement: number;
  kills: number;
  lobbyStrength: number;
  performanceSignal: number;
  explanation: {
    sourceType: string;
    sourceId: string;
    tournamentType: string;
    resultWeight: number;
    performanceAdjustment: number;
    calibrationMatch: number;
    verified: boolean;
  };
}

export interface PsrEventResult {
  event: PsrEvent;
  resultHash: string;
  deltas: PsrDelta[];
}

export interface PsrLeaderboardRow {
  rank: number;
  playerId: string;
  nombre: string;
  tier: Tier;
  participaciones: number;
  impacto: number;
  placement: number;
  consistencia: number;
  teamSuccess: number;
  scoreFinal: number;
  percentil: number;
  isCalibrating: boolean;
  isDecaying: boolean;
  decayMultiplier: number;
  peakScore: number;
  phase: typeof PSR_PHASE;
  mu: number;
  sigma: number;
  psr: number;
  modelVersion: string;
}

export interface PsrComputation {
  leaderboard: PsrLeaderboardRow[];
  eventResults: PsrEventResult[];
  configHash: string;
}

const SQRT_2 = Math.sqrt(2);
const SQRT_2PI = Math.sqrt(2 * Math.PI);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, digits = 4): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * absX);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-absX * absX));

  return sign * y;
}

function normalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT_2PI;
}

function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / SQRT_2));
}

function vExceedsMargin(t: number): number {
  const denominator = Math.max(normalCdf(t), 1e-9);
  return normalPdf(t) / denominator;
}

function wExceedsMargin(t: number): number {
  const v = vExceedsMargin(t);
  return v * (v + t);
}

export function computePsr(mu: number, sigma: number, config: PsrConfig = DEFAULT_PSR_CONFIG): number {
  return round(mu - config.conservativeSigmaMultiplier * sigma, 2);
}

export function hashRankingPayload(payload: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

function initialState(player: PsrPlayerInput, config: PsrConfig): PsrRatingState {
  return {
    playerId: player.playerId,
    nombre: player.nombre,
    mu: config.initialMu,
    sigma: config.initialSigma,
    matchesPlayed: 0,
    peakPsr: computePsr(config.initialMu, config.initialSigma, config),
    lastEventAt: null,
  };
}

function entryPlacementScore(entry: PsrEventEntry, eventSize: number): number {
  const totalTeams = Math.max(entry.totalTeams, eventSize, 1);
  if (totalTeams <= 1) return 0.5;
  return clamp((totalTeams - entry.placement) / (totalTeams - 1), 0, 1);
}

function performanceSignal(entry: PsrEventEntry, event: PsrEvent, config: PsrConfig): number {
  const maxKills = Math.max(1, ...event.entries.map((candidate) => candidate.kills));
  const maxTeamPoints = Math.max(1, ...event.entries.map((candidate) => candidate.teamPoints));
  const placement = entryPlacementScore(entry, event.entries.length);
  const kills = Math.log1p(Math.max(0, entry.kills)) / Math.log1p(maxKills);
  const team = Math.max(0, entry.teamPoints) / maxTeamPoints;

  return clamp(
    config.performance.placementWeight * placement +
      config.performance.killsWeight * kills +
      config.performance.teamWeight * team,
    0,
    1
  );
}

function applyDecay(
  state: PsrRatingState,
  currentDate: Date,
  config: PsrConfig
): { state: PsrRatingState; isDecaying: boolean; decayMultiplier: number } {
  if (!state.lastEventAt) {
    return { state, isDecaying: false, decayMultiplier: 1 };
  }

  const daysInactive = Math.floor(
    (currentDate.getTime() - state.lastEventAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysInactive < config.decay.inactivityThresholdDays) {
    return { state, isDecaying: false, decayMultiplier: 1 };
  }

  const monthsInactive =
    (daysInactive - config.decay.inactivityThresholdDays) / 30;
  const sigma = clamp(
    state.sigma + monthsInactive * config.decay.sigmaIncreasePerMonth,
    config.minSigma,
    config.maxSigma
  );
  const before = computePsr(state.mu, state.sigma, config);
  const after = computePsr(state.mu, sigma, config);

  return {
    state: { ...state, sigma },
    isDecaying: true,
    decayMultiplier: before === 0 ? 1 : round(after / before, 4),
  };
}

function lobbyStrength(event: PsrEvent, states: Map<string, PsrRatingState>, config: PsrConfig): number {
  if (event.entries.length === 0) return 1;
  const meanMu =
    event.entries.reduce((sum, entry) => {
      const state = states.get(entry.playerId);
      return sum + (state?.mu ?? config.initialMu);
    }, 0) / event.entries.length;

  return round(clamp(meanMu / config.initialMu, 0.5, 2), 4);
}

function applySoloEvidence(
  event: PsrEvent,
  state: PsrRatingState,
  entry: PsrEventEntry,
  config: PsrConfig
): { state: PsrRatingState; delta: PsrDelta } {
  const psrBefore = computePsr(state.mu, state.sigma, config);
  const signal = performanceSignal(entry, event, config);
  const performanceAdjustment = clamp(
    (signal - 0.5) * config.soloEvidence.maxMuAdjustment,
    -config.soloEvidence.maxMuAdjustment,
    config.soloEvidence.maxMuAdjustment
  );
  const sigma = clamp(
    state.sigma * config.soloEvidence.sigmaShrink,
    config.minSigma,
    config.maxSigma
  );
  const mu = clamp(state.mu + performanceAdjustment, config.minMu, config.maxMu);
  const nextState: PsrRatingState = {
    ...state,
    mu: round(mu),
    sigma: round(sigma),
    matchesPlayed: state.matchesPlayed + 1,
    peakPsr: Math.max(state.peakPsr, computePsr(mu, sigma, config)),
    lastEventAt: event.occurredAt,
  };
  const psrAfter = computePsr(nextState.mu, nextState.sigma, config);

  return {
    state: nextState,
    delta: {
      playerId: entry.playerId,
      nombre: entry.nombre,
      muBefore: round(state.mu),
      sigmaBefore: round(state.sigma),
      psrBefore,
      muAfter: nextState.mu,
      sigmaAfter: nextState.sigma,
      psrAfter,
      deltaPsr: round(psrAfter - psrBefore),
      placement: entry.placement,
      kills: entry.kills,
      lobbyStrength: 1,
      performanceSignal: round(signal),
      explanation: {
        sourceType: event.sourceType,
        sourceId: event.sourceId,
        tournamentType: event.tournamentType,
        resultWeight: 0,
        performanceAdjustment: round(performanceAdjustment),
        calibrationMatch: nextState.matchesPlayed,
        verified: event.verified,
      },
    },
  };
}

export function applyPsrEvent(
  event: PsrEvent,
  states: Map<string, PsrRatingState>,
  config: PsrConfig = DEFAULT_PSR_CONFIG
): PsrEventResult {
  const entries = [...event.entries].sort((a, b) => a.placement - b.placement);
  const currentStates = new Map(states);
  const deltas: PsrDelta[] = [];

  if (entries.length === 1) {
    const entry = entries[0];
    const state = currentStates.get(entry.playerId);
    if (state) {
      const solo = applySoloEvidence(event, state, entry, config);
      states.set(entry.playerId, solo.state);
      deltas.push(solo.delta);
    }
  } else {
    const muDeltas = new Map<string, number>();
    const shrink = new Map<string, number>();
    const signals = new Map<string, number>();
    const resultWeight = config.comparisonWeight / Math.max(1, entries.length - 1);
    const strength = lobbyStrength(event, currentStates, config);

    for (const entry of entries) {
      muDeltas.set(entry.playerId, 0);
      shrink.set(entry.playerId, 0);
      signals.set(entry.playerId, performanceSignal(entry, event, config));
    }

    for (let i = 0; i < entries.length; i += 1) {
      for (let j = i + 1; j < entries.length; j += 1) {
        const winner = entries[i];
        const loser = entries[j];
        if (winner.placement === loser.placement) continue;

        const winnerState = currentStates.get(winner.playerId);
        const loserState = currentStates.get(loser.playerId);
        if (!winnerState || !loserState) continue;

        const winnerSigma = Math.sqrt(winnerState.sigma ** 2 + config.tau ** 2);
        const loserSigma = Math.sqrt(loserState.sigma ** 2 + config.tau ** 2);
        const c = Math.sqrt(2 * config.beta ** 2 + winnerSigma ** 2 + loserSigma ** 2);
        const t = (winnerState.mu - loserState.mu) / c;
        const v = vExceedsMargin(t);
        const w = wExceedsMargin(t);
        const placementGap = Math.abs(winner.placement - loser.placement);
        const gapWeight = clamp(0.75 + placementGap / Math.max(1, entries.length - 1), 0.75, 1.25);
        const weight = resultWeight * gapWeight;

        muDeltas.set(
          winner.playerId,
          (muDeltas.get(winner.playerId) ?? 0) + ((winnerSigma ** 2) / c) * v * weight
        );
        muDeltas.set(
          loser.playerId,
          (muDeltas.get(loser.playerId) ?? 0) - ((loserSigma ** 2) / c) * v * weight
        );
        shrink.set(
          winner.playerId,
          (shrink.get(winner.playerId) ?? 0) + ((winnerSigma ** 2) / (c ** 2)) * w * weight
        );
        shrink.set(
          loser.playerId,
          (shrink.get(loser.playerId) ?? 0) + ((loserSigma ** 2) / (c ** 2)) * w * weight
        );
      }
    }

    const meanSignal =
      entries.reduce((sum, entry) => sum + (signals.get(entry.playerId) ?? 0), 0) /
      entries.length;

    for (const entry of entries) {
      const state = currentStates.get(entry.playerId);
      if (!state) continue;

      const psrBefore = computePsr(state.mu, state.sigma, config);
      const signal = signals.get(entry.playerId) ?? 0.5;
      const performanceAdjustment = clamp(
        (signal - meanSignal) * config.performance.maxMuAdjustment,
        -config.performance.maxMuAdjustment,
        config.performance.maxMuAdjustment
      );
      const sigmaWithDynamics = Math.sqrt(state.sigma ** 2 + config.tau ** 2);
      const sigma = clamp(
        sigmaWithDynamics *
          Math.sqrt(Math.max(config.sigmaShrinkFloor, 1 - (shrink.get(entry.playerId) ?? 0))),
        config.minSigma,
        config.maxSigma
      );
      const mu = clamp(
        state.mu + (muDeltas.get(entry.playerId) ?? 0) + performanceAdjustment,
        config.minMu,
        config.maxMu
      );
      const nextState: PsrRatingState = {
        ...state,
        mu: round(mu),
        sigma: round(sigma),
        matchesPlayed: state.matchesPlayed + 1,
        peakPsr: Math.max(state.peakPsr, computePsr(mu, sigma, config)),
        lastEventAt: event.occurredAt,
      };
      const psrAfter = computePsr(nextState.mu, nextState.sigma, config);

      states.set(entry.playerId, nextState);
      deltas.push({
        playerId: entry.playerId,
        nombre: entry.nombre,
        muBefore: round(state.mu),
        sigmaBefore: round(state.sigma),
        psrBefore,
        muAfter: nextState.mu,
        sigmaAfter: nextState.sigma,
        psrAfter,
        deltaPsr: round(psrAfter - psrBefore),
        placement: entry.placement,
        kills: entry.kills,
        lobbyStrength: strength,
        performanceSignal: round(signal),
        explanation: {
          sourceType: event.sourceType,
          sourceId: event.sourceId,
          tournamentType: event.tournamentType,
          resultWeight: round(resultWeight),
          performanceAdjustment: round(performanceAdjustment),
          calibrationMatch: nextState.matchesPlayed,
          verified: event.verified,
        },
      });
    }
  }

  const resultHash = hashRankingPayload({
    modelVersion: config.modelVersion,
    event: {
      sourceType: event.sourceType,
      sourceId: event.sourceId,
      seasonId: event.seasonId,
      tournamentType: event.tournamentType,
      occurredAt: event.occurredAt.toISOString(),
      entries: event.entries.map((entry) => ({
        playerId: entry.playerId,
        placement: entry.placement,
        kills: entry.kills,
      })),
    },
    deltas: deltas.map((delta) => ({
      playerId: delta.playerId,
      muBefore: delta.muBefore,
      sigmaBefore: delta.sigmaBefore,
      muAfter: delta.muAfter,
      sigmaAfter: delta.sigmaAfter,
      psrAfter: delta.psrAfter,
    })),
  });

  return { event, resultHash, deltas };
}

function percentileRows(rows: PsrLeaderboardRow[], config: PsrConfig): PsrLeaderboardRow[] {
  const eligible = rows
    .filter((row) => row.participaciones >= config.minRankedMatches)
    .sort((a, b) => a.scoreFinal - b.scoreFinal);

  const percentileByPlayer = new Map<string, number>();
  eligible.forEach((row, index) => {
    const percentile = eligible.length <= 1 ? 50 : (index / (eligible.length - 1)) * 100;
    percentileByPlayer.set(row.playerId, round(percentile, 1));
  });

  return rows.map((row) => {
    const percentil = percentileByPlayer.get(row.playerId) ?? 0;
    const tier = row.participaciones >= config.minRankedMatches ? assignTier(percentil) : "Detri";
    return { ...row, percentil, tier };
  });
}

export function computePsrLeaderboard(
  players: PsrPlayerInput[],
  events: PsrEvent[],
  currentDate: Date = new Date(),
  config: PsrConfig = DEFAULT_PSR_CONFIG
): PsrComputation {
  const states = new Map<string, PsrRatingState>();
  const eventResults: PsrEventResult[] = [];

  for (const player of players) {
    states.set(player.playerId, initialState(player, config));
  }

  const sortedEvents = [...events].sort(
    (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()
  );

  for (const event of sortedEvents) {
    const knownEntries = event.entries.filter((entry) => states.has(entry.playerId));
    if (knownEntries.length === 0) continue;
    const eventResult = applyPsrEvent({ ...event, entries: knownEntries }, states, config);
    eventResults.push(eventResult);
  }

  const rows: PsrLeaderboardRow[] = players.map((player) => {
    const state = states.get(player.playerId) ?? initialState(player, config);
    const decayed = applyDecay(state, currentDate, config);
    const psr = computePsr(decayed.state.mu, decayed.state.sigma, config);

    return {
      rank: 0,
      playerId: player.playerId,
      nombre: player.nombre,
      tier: "Detri",
      participaciones: state.matchesPlayed,
      impacto: round(state.mu, 1),
      placement: round(psr, 1),
      consistencia: round(Math.max(0, 100 - state.sigma * 10), 1),
      teamSuccess: round(state.peakPsr, 1),
      scoreFinal: round(psr, 1),
      percentil: 0,
      isCalibrating: state.matchesPlayed < config.minRankedMatches,
      isDecaying: decayed.isDecaying,
      decayMultiplier: decayed.decayMultiplier,
      peakScore: round(state.peakPsr, 1),
      phase: PSR_PHASE,
      mu: round(decayed.state.mu, 4),
      sigma: round(decayed.state.sigma, 4),
      psr: round(psr, 2),
      modelVersion: config.modelVersion,
    };
  });

  const rankedRows = percentileRows(
    rows.sort((a, b) => b.scoreFinal - a.scoreFinal),
    config
  ).map((row, index) => ({ ...row, rank: index + 1 }));

  return {
    leaderboard: rankedRows,
    eventResults,
    configHash: hashRankingPayload(config),
  };
}
