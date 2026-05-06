import { prisma } from "@/lib/db";
import {
  DEFAULT_PSR_CONFIG,
  PSR_MODEL_VERSION,
  computePsrLeaderboard,
  hashRankingPayload,
  type PsrEvent,
  type PsrLeaderboardRow,
  type PsrPlayerInput,
} from "@/lib/scoring";

export interface RankingStats {
  totalPlayers: number;
  eligible: number;
  pro: number;
  am: number;
  detri: number;
  events: number;
  deltas: number;
  modelVersion: string;
  configHash: string;
}

export interface PsrRankingSnapshot {
  rankings: PsrLeaderboardRow[];
  stats: RankingStats;
  loadError: string | null;
}

type UserWithRecords = Awaited<ReturnType<typeof fetchUsersForPsr>>[number];
type MatchRecord = UserWithRecords["matchRecords"][number];

async function fetchUsersForPsr() {
  return prisma.user.findMany({
    where: { status: "active" },
    include: {
      matchRecords: { orderBy: { date: "asc" } },
    },
  });
}

function toPlayers(users: UserWithRecords[]): PsrPlayerInput[] {
  return users.map((user) => ({
    playerId: user.id,
    nombre: user.username,
  }));
}

function recordSourceId(record: MatchRecord): string {
  return record.eventId || record.sourceId || record.id;
}

function recordToEventEntry(record: MatchRecord, user: UserWithRecords) {
  return {
    playerId: user.id,
    nombre: user.username,
    placement: Math.max(1, record.position),
    totalTeams: Math.max(1, record.totalTeams),
    kills: Math.max(0, record.kills),
    deaths: Math.max(0, record.deaths),
    teamKills: Math.max(0, record.teamKills),
    teamPoints: Math.max(0, record.teamPoints),
    bestKillsInTournament: Math.max(0, record.bestKillsInTournament),
    bestTeamPointsInTournament: Math.max(0, record.bestTeamPointsInTournament),
  };
}

function buildPsrEvents(users: UserWithRecords[]): PsrEvent[] {
  const grouped = new Map<string, PsrEvent>();

  for (const user of users) {
    for (const record of user.matchRecords) {
      if (record.tournamentType === "novice") continue;

      const sourceType = record.sourceType || "manual";
      const sourceId = recordSourceId(record);
      const key = `${sourceType}:${sourceId}`;
      const current = grouped.get(key);
      const entry = recordToEventEntry(record, user);

      if (!current) {
        grouped.set(key, {
          sourceType,
          sourceId,
          seasonId: record.seasonId || "global",
          tournamentId: null,
          matchId: record.eventId ?? null,
          tournamentType: record.tournamentType,
          occurredAt: record.date,
          evidenceUrl: record.evidenceUrl,
          verified: record.verified,
          entries: [entry],
          recordIds: [record.id],
        });
        continue;
      }

      current.occurredAt =
        record.date.getTime() < current.occurredAt.getTime()
          ? record.date
          : current.occurredAt;
      current.evidenceUrl = current.evidenceUrl || record.evidenceUrl;
      current.verified = current.verified || record.verified;
      current.entries.push(entry);
      current.recordIds.push(record.id);
    }
  }

  return [...grouped.values()].sort(
    (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()
  );
}

function statsForRows(
  rankings: PsrLeaderboardRow[],
  totalPlayers: number,
  events: number,
  deltas: number,
  configHash: string
): RankingStats {
  const eligible = rankings.filter((ranking) => !ranking.isCalibrating);

  return {
    totalPlayers,
    eligible: eligible.length,
    pro: eligible.filter((ranking) => ranking.tier === "PRO").length,
    am: eligible.filter((ranking) => ranking.tier === "AM").length,
    detri: eligible.filter((ranking) => ranking.tier === "Detri").length,
    events,
    deltas,
    modelVersion: PSR_MODEL_VERSION,
    configHash,
  };
}

function eventPayload(event: PsrEvent) {
  return {
    sourceType: event.sourceType,
    sourceId: event.sourceId,
    seasonId: event.seasonId,
    tournamentId: event.tournamentId,
    matchId: event.matchId,
    tournamentType: event.tournamentType,
    occurredAt: event.occurredAt.toISOString(),
    evidenceUrl: event.evidenceUrl,
    verified: event.verified,
    entries: event.entries.map((entry) => ({
      playerId: entry.playerId,
      placement: entry.placement,
      totalTeams: entry.totalTeams,
      kills: entry.kills,
      deaths: entry.deaths,
      teamKills: entry.teamKills,
      teamPoints: entry.teamPoints,
    })),
  };
}

async function ensureModelVersion() {
  return prisma.rankingModelVersion.upsert({
    where: { version: PSR_MODEL_VERSION },
    update: {
      status: "shadow",
      parameters: JSON.stringify(DEFAULT_PSR_CONFIG),
      description:
        "Phoenix Skill Rating: modelo bayesiano conservador inspirado en TrueSkill/OpenSkill.",
    },
    create: {
      version: PSR_MODEL_VERSION,
      status: "shadow",
      parameters: JSON.stringify(DEFAULT_PSR_CONFIG),
      description:
        "Phoenix Skill Rating: modelo bayesiano conservador inspirado en TrueSkill/OpenSkill.",
    },
  });
}

export async function getPsrRankingSnapshot(
  currentDate: Date = new Date()
): Promise<PsrRankingSnapshot> {
  try {
    const users = await fetchUsersForPsr();
    const players = toPlayers(users);
    const events = buildPsrEvents(users);
    const computation = computePsrLeaderboard(players, events, currentDate);
    const deltas = computation.eventResults.reduce(
      (sum, eventResult) => sum + eventResult.deltas.length,
      0
    );

    return {
      rankings: computation.leaderboard,
      stats: statsForRows(
        computation.leaderboard,
        users.length,
        events.length,
        deltas,
        computation.configHash
      ),
      loadError: null,
    };
  } catch (error) {
    console.error("Unable to compute PSR ranking", error);
    return {
      rankings: [],
      stats: statsForRows([], 0, 0, 0, hashRankingPayload(DEFAULT_PSR_CONFIG)),
      loadError: "No se pudo calcular el ranking PSR en este momento.",
    };
  }
}

export async function rebuildAndPersistPsrRankings(
  currentDate: Date = new Date()
): Promise<PsrRankingSnapshot> {
  const users = await fetchUsersForPsr();
  const players = toPlayers(users);
  const events = buildPsrEvents(users);
  const computation = computePsrLeaderboard(players, events, currentDate);
  const snapshotAt = new Date();
  const sourceHash = hashRankingPayload({
    modelVersion: PSR_MODEL_VERSION,
    configHash: computation.configHash,
    rows: computation.leaderboard.map((row) => ({
      playerId: row.playerId,
      rank: row.rank,
      mu: row.mu,
      sigma: row.sigma,
      psr: row.psr,
      matchesPlayed: row.participaciones,
    })),
  });

  await ensureModelVersion();

  for (const eventResult of computation.eventResults) {
    const payload = eventPayload(eventResult.event);
    const eventLog = await prisma.rankingEventLog.upsert({
      where: {
        sourceType_sourceId_modelVersion: {
          sourceType: eventResult.event.sourceType,
          sourceId: eventResult.event.sourceId,
          modelVersion: PSR_MODEL_VERSION,
        },
      },
      update: {
        status: "processed",
        seasonId: eventResult.event.seasonId,
        tournamentId: eventResult.event.tournamentId,
        matchId: eventResult.event.matchId,
        occurredAt: eventResult.event.occurredAt,
        payload: JSON.stringify(payload),
        evidenceUrl: eventResult.event.evidenceUrl,
        resultHash: eventResult.resultHash,
      },
      create: {
        sourceType: eventResult.event.sourceType,
        sourceId: eventResult.event.sourceId,
        seasonId: eventResult.event.seasonId,
        tournamentId: eventResult.event.tournamentId,
        matchId: eventResult.event.matchId,
        modelVersion: PSR_MODEL_VERSION,
        status: "processed",
        occurredAt: eventResult.event.occurredAt,
        payload: JSON.stringify(payload),
        evidenceUrl: eventResult.event.evidenceUrl,
        resultHash: eventResult.resultHash,
      },
    });

    for (const delta of eventResult.deltas) {
      await prisma.rankingDelta.upsert({
        where: {
          eventLogId_playerId: {
            eventLogId: eventLog.id,
            playerId: delta.playerId,
          },
        },
        update: {
          modelVersion: PSR_MODEL_VERSION,
          muBefore: delta.muBefore,
          sigmaBefore: delta.sigmaBefore,
          psrBefore: delta.psrBefore,
          muAfter: delta.muAfter,
          sigmaAfter: delta.sigmaAfter,
          psrAfter: delta.psrAfter,
          deltaPsr: delta.deltaPsr,
          placement: delta.placement,
          kills: delta.kills,
          lobbyStrength: delta.lobbyStrength,
          performanceSignal: delta.performanceSignal,
          explanation: JSON.stringify(delta.explanation),
        },
        create: {
          eventLogId: eventLog.id,
          playerId: delta.playerId,
          modelVersion: PSR_MODEL_VERSION,
          muBefore: delta.muBefore,
          sigmaBefore: delta.sigmaBefore,
          psrBefore: delta.psrBefore,
          muAfter: delta.muAfter,
          sigmaAfter: delta.sigmaAfter,
          psrAfter: delta.psrAfter,
          deltaPsr: delta.deltaPsr,
          placement: delta.placement,
          kills: delta.kills,
          lobbyStrength: delta.lobbyStrength,
          performanceSignal: delta.performanceSignal,
          explanation: JSON.stringify(delta.explanation),
        },
      });
    }

    await prisma.rankingMatchRecord.updateMany({
      where: { id: { in: eventResult.event.recordIds } },
      data: {
        psrProcessedAt: snapshotAt,
        modelVersion: PSR_MODEL_VERSION,
      },
    });
  }

  for (const row of computation.leaderboard) {
    const user = users.find((candidate) => candidate.id === row.playerId);
    await prisma.user.update({
      where: { id: row.playerId },
      data: {
        tier: row.tier,
        psrMu: row.mu,
        psrSigma: row.sigma,
        psrScore: row.scoreFinal,
        psrMatches: row.participaciones,
        peakPsr: Math.max(user?.peakPsr ?? 0, row.peakScore),
        peakScore: Math.max(user?.peakScore ?? 0, row.scoreFinal),
        psrModelVersion: PSR_MODEL_VERSION,
        psrLastEventAt:
          user?.matchRecords[user.matchRecords.length - 1]?.date ?? null,
      },
    });
  }

  if (computation.leaderboard.length > 0) {
    await prisma.rankingSnapshot.createMany({
      data: computation.leaderboard.map((row) => ({
        playerId: row.playerId,
        modelVersion: PSR_MODEL_VERSION,
        seasonId: "global",
        rank: row.rank,
        tier: row.tier,
        mu: row.mu,
        sigma: row.sigma,
        psr: row.scoreFinal,
        percentile: row.percentil,
        matchesPlayed: row.participaciones,
        isCalibrating: row.isCalibrating,
        isDecaying: row.isDecaying,
        decayMultiplier: row.decayMultiplier,
        sourceHash,
        snapshotAt,
      })),
    });
  }

  const deltas = computation.eventResults.reduce(
    (sum, eventResult) => sum + eventResult.deltas.length,
    0
  );

  return {
    rankings: computation.leaderboard,
    stats: statsForRows(
      computation.leaderboard,
      users.length,
      events.length,
      deltas,
      computation.configHash
    ),
    loadError: null,
  };
}
