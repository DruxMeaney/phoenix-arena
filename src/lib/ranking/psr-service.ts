import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import {
  DEFAULT_PSR_CONFIG,
  PSR_MODEL_VERSION,
  computePsrLeaderboard,
  hashRankingPayload,
  type PsrEvent,
  type PsrEventEntry,
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

const QUERY_CHUNK_SIZE = 500;
const USER_UPDATE_CHUNK_SIZE = 100;

type BaseUser = Awaited<ReturnType<typeof fetchBaseUsers>>[number];
type MatchRecord = Awaited<ReturnType<typeof fetchPsrMatchRecords>>[number];
type UserWithRecords = BaseUser & { matchRecords: MatchRecord[] };

function chunkList<T>(items: T[], size = QUERY_CHUNK_SIZE): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function fetchBaseUsers() {
  return prisma.user.findMany({
    where: { status: "active" },
    orderBy: { username: "asc" },
    select: {
      id: true,
      username: true,
      peakPsr: true,
      peakScore: true,
    },
  });
}

async function fetchPsrMatchRecords(playerIds: string[]) {
  return prisma.rankingMatchRecord.findMany({
    where: { playerId: { in: playerIds } },
    orderBy: { date: "asc" },
    select: {
      id: true,
      playerId: true,
      eventId: true,
      sourceId: true,
      tournamentId: true,
      sourceType: true,
      seasonId: true,
      tournamentType: true,
      date: true,
      evidenceUrl: true,
      verified: true,
      kills: true,
      deaths: true,
      position: true,
      totalTeams: true,
      roundsPlayed: true,
      averagePlacement: true,
      averageKills: true,
      teamKills: true,
      teamPoints: true,
      skillPoints: true,
      rawPoints: true,
      matchpointWin: true,
      matchpointBonus: true,
      bestKillsInTournament: true,
      bestTeamPointsInTournament: true,
    },
  });
}

async function fetchUsersForPsr(): Promise<UserWithRecords[]> {
  const users = await fetchBaseUsers();
  if (users.length === 0) return [];

  const recordsByPlayer = new Map<string, MatchRecord[]>();
  for (const idChunk of chunkList(users.map((user) => user.id))) {
    const records = await fetchPsrMatchRecords(idChunk);
    for (const record of records) {
      const current = recordsByPlayer.get(record.playerId) ?? [];
      current.push(record);
      recordsByPlayer.set(record.playerId, current);
    }
  }

  return users.map((user) => ({
    ...user,
    matchRecords: recordsByPlayer.get(user.id) ?? [],
  }));
}

function toPlayers(users: UserWithRecords[]): PsrPlayerInput[] {
  return users.map((user) => ({
    playerId: user.id,
    nombre: user.username,
  }));
}

function recordSourceId(record: MatchRecord): string {
  return record.eventId || record.sourceId || record.tournamentId || record.id;
}

function recordToEventEntry(record: MatchRecord, user: UserWithRecords) {
  const roundsPlayed = Math.max(0, record.roundsPlayed ?? 0);
  const skillPoints =
    record.skillPoints && record.skillPoints > 0
      ? record.skillPoints
      : record.teamPoints;

  return {
    playerId: user.id,
    nombre: user.username,
    placement: Math.max(1, record.position),
    totalTeams: Math.max(1, record.totalTeams),
    kills: Math.max(0, record.kills),
    deaths: Math.max(0, record.deaths),
    roundsPlayed,
    averagePlacement: Math.max(0, record.averagePlacement ?? 0),
    averageKills: Math.max(
      0,
      record.averageKills && record.averageKills > 0
        ? record.averageKills
        : roundsPlayed > 0
          ? record.kills / roundsPlayed
          : 0
    ),
    teamKills: Math.max(0, record.teamKills),
    teamPoints: Math.max(0, record.teamPoints),
    skillPoints: Math.max(0, skillPoints),
    rawPoints: Math.max(0, record.rawPoints ?? 0),
    matchpointWin: record.matchpointWin ?? false,
    matchpointBonus: Math.max(0, record.matchpointBonus ?? 0),
    bestKillsInTournament: Math.max(0, record.bestKillsInTournament),
    bestTeamPointsInTournament: Math.max(0, record.bestTeamPointsInTournament),
  };
}

function isBetterCompetitiveEntry(candidate: PsrEventEntry, current: PsrEventEntry): boolean {
  const candidateSkill = candidate.skillPoints ?? candidate.teamPoints;
  const currentSkill = current.skillPoints ?? current.teamPoints;
  if (candidateSkill !== currentSkill) return candidateSkill > currentSkill;
  if (candidate.kills !== current.kills) return candidate.kills > current.kills;
  return candidate.placement < current.placement;
}

function dedupeEventEntries(event: PsrEvent): PsrEvent {
  if (event.entries.length <= 1) return event;

  const entriesByPlayer = new Map<string, PsrEventEntry>();
  for (const entry of event.entries) {
    const current = entriesByPlayer.get(entry.playerId);
    if (!current || isBetterCompetitiveEntry(entry, current)) {
      entriesByPlayer.set(entry.playerId, entry);
    }
  }

  if (entriesByPlayer.size === event.entries.length) return event;
  return { ...event, entries: [...entriesByPlayer.values()] };
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
          tournamentId: record.tournamentId,
          matchId: record.tournamentId ? null : record.eventId ?? null,
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

  return [...grouped.values()].map(dedupeEventEntries).sort(
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
      roundsPlayed: entry.roundsPlayed ?? 0,
      averagePlacement: entry.averagePlacement ?? 0,
      averageKills: entry.averageKills ?? 0,
      teamKills: entry.teamKills,
      teamPoints: entry.teamPoints,
      skillPoints: entry.skillPoints ?? entry.teamPoints,
      rawPoints: entry.rawPoints ?? entry.teamPoints,
      matchpointWin: entry.matchpointWin ?? false,
      matchpointBonus: entry.matchpointBonus ?? 0,
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
        "Phoenix Skill Rating: modelo bayesiano conservador inspirado en TrueSkill/OpenSkill, enriquecido con captura historica 00_old.",
    },
    create: {
      version: PSR_MODEL_VERSION,
      status: "shadow",
      parameters: JSON.stringify(DEFAULT_PSR_CONFIG),
      description:
        "Phoenix Skill Rating: modelo bayesiano conservador inspirado en TrueSkill/OpenSkill, enriquecido con captura historica 00_old.",
    },
  });
}

function caseAssignment<T>(
  column: string,
  rows: PsrLeaderboardRow[],
  valueFor: (row: PsrLeaderboardRow) => T,
  params: unknown[]
): string {
  const cases = rows
    .map((row) => {
      params.push(row.playerId, valueFor(row));
      return "WHEN ? THEN ?";
    })
    .join(" ");
  return `"${column}" = CASE "id" ${cases} ELSE "${column}" END`;
}

async function updateLeaderboardUsers(
  rows: PsrLeaderboardRow[],
  usersById: Map<string, UserWithRecords>
) {
  for (const rowChunk of chunkList(rows, USER_UPDATE_CHUNK_SIZE)) {
    const params: unknown[] = [];
    const now = new Date();
    const assignments = [
      caseAssignment("tier", rowChunk, (row) => row.tier, params),
      caseAssignment("psrMu", rowChunk, (row) => row.mu, params),
      caseAssignment("psrSigma", rowChunk, (row) => row.sigma, params),
      caseAssignment("psrScore", rowChunk, (row) => row.scoreFinal, params),
      caseAssignment("psrMatches", rowChunk, (row) => row.participaciones, params),
      caseAssignment(
        "peakPsr",
        rowChunk,
        (row) => Math.max(usersById.get(row.playerId)?.peakPsr ?? 0, row.peakScore),
        params
      ),
      caseAssignment(
        "peakScore",
        rowChunk,
        (row) => Math.max(usersById.get(row.playerId)?.peakScore ?? 0, row.scoreFinal),
        params
      ),
      caseAssignment("psrModelVersion", rowChunk, () => PSR_MODEL_VERSION, params),
      caseAssignment(
        "psrLastEventAt",
        rowChunk,
        (row) => {
          const records = usersById.get(row.playerId)?.matchRecords ?? [];
          return records[records.length - 1]?.date ?? null;
        },
        params
      ),
      caseAssignment("updatedAt", rowChunk, () => now, params),
    ];
    const wherePlaceholders = rowChunk.map(() => "?").join(", ");
    params.push(...rowChunk.map((row) => row.playerId));
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET ${assignments.join(", ")} WHERE "id" IN (${wherePlaceholders})`,
      ...params
    );
  }
}

function rankingEventLogId(event: PsrEvent): string {
  const digest = hashRankingPayload({
    modelVersion: PSR_MODEL_VERSION,
    sourceType: event.sourceType,
    sourceId: event.sourceId,
  }).slice(0, 24);
  return `rel_${digest}`;
}

async function deleteExistingEventLogs(eventResults: { event: PsrEvent }[]) {
  const sourceIdsByType = new Map<string, Set<string>>();
  for (const eventResult of eventResults) {
    const ids = sourceIdsByType.get(eventResult.event.sourceType) ?? new Set<string>();
    ids.add(eventResult.event.sourceId);
    sourceIdsByType.set(eventResult.event.sourceType, ids);
  }

  for (const [sourceType, sourceIds] of sourceIdsByType.entries()) {
    for (const sourceIdChunk of chunkList([...sourceIds])) {
      await prisma.rankingEventLog.deleteMany({
        where: {
          sourceType,
          sourceId: { in: sourceIdChunk },
          modelVersion: PSR_MODEL_VERSION,
        },
      });
    }
  }
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

  await deleteExistingEventLogs(computation.eventResults);

  const eventLogRows: Prisma.RankingEventLogCreateManyInput[] = [];
  const deltaRows: Prisma.RankingDeltaCreateManyInput[] = [];
  const processedRecordIds = new Set<string>();

  for (const eventResult of computation.eventResults) {
    const payload = eventPayload(eventResult.event);
    const eventLogId = rankingEventLogId(eventResult.event);
    eventLogRows.push({
      id: eventLogId,
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
    });

    for (const delta of eventResult.deltas) {
      deltaRows.push({
        eventLogId,
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
      });
    }

    for (const recordId of eventResult.event.recordIds) {
      processedRecordIds.add(recordId);
    }
  }

  for (const eventLogChunk of chunkList(eventLogRows)) {
    await prisma.rankingEventLog.createMany({ data: eventLogChunk });
  }

  for (const recordIdChunk of chunkList([...processedRecordIds])) {
    await prisma.rankingMatchRecord.updateMany({
      where: { id: { in: recordIdChunk } },
      data: {
        psrProcessedAt: snapshotAt,
        modelVersion: PSR_MODEL_VERSION,
      },
    });
  }

  for (const deltaChunk of chunkList(deltaRows)) {
    await prisma.rankingDelta.createMany({ data: deltaChunk });
  }

  const usersById = new Map(users.map((user) => [user.id, user]));
  await updateLeaderboardUsers(computation.leaderboard, usersById);

  if (computation.leaderboard.length > 0) {
    const snapshotRows = computation.leaderboard.map((row) => ({
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
    }));
    for (const snapshotChunk of chunkList(snapshotRows)) {
      await prisma.rankingSnapshot.createMany({ data: snapshotChunk });
    }
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
