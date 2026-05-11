import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { rebuildAndPersistPsrRankings } from "@/lib/ranking/psr-service";
import { PSR_MODEL_VERSION } from "@/lib/scoring";
import { PLATFORM_COMMISSION, resolvePrizeSplits } from "@/lib/prize-splits";

const CAPTURE_SCHEMA_VERSION = "psr-legacy-v1";
const MATCHPOINT_TARGET = 999;

type RoundCaptureInput = {
  map?: number | string;
  placement?: number | string;
  kills?: number | string;
  teamKills?: number | string;
  matchpointWin?: boolean;
  evidenceUrl?: string;
  notes?: string;
};

type ResultCaptureInput = {
  userId: string;
  teamName?: string | null;
  teamNumber?: number | string | null;
  teamGroup?: string | null;
  rosterSlot?: number | string | null;
  captainHandle?: string | null;
  rawHandle?: string | null;
  normalizedHandle?: string | null;
  kills?: number | string | null;
  deaths?: number | string | null;
  placement?: number | string | null;
  roundsPlayed?: number | string | null;
  averagePlacement?: number | string | null;
  averageKills?: number | string | null;
  teamKills?: number | string | null;
  teamPoints?: number | string | null;
  skillPoints?: number | string | null;
  rawPoints?: number | string | null;
  matchpointWin?: boolean | null;
  matchpointBonus?: number | string | null;
  paymentVerified?: boolean | null;
  discordVerified?: boolean | null;
  photoVerified?: boolean | null;
  flyerVerified?: boolean | null;
  rulesAccepted?: boolean | null;
  adminVerified?: boolean | null;
  roundResults?: RoundCaptureInput[] | string | null;
  evidenceUrl?: string | null;
  notes?: string | null;
};

type EventMetaInput = {
  seasonId?: string;
  sourceType?: string;
  verified?: boolean;
  mapCount?: number | string;
};

type DerivedCapture = {
  kills: number;
  deaths: number;
  storedPlacement: number;
  rankingPlacement: number;
  roundsPlayed: number;
  averagePlacement: number;
  averageKills: number;
  teamKills: number;
  teamPoints: number;
  skillPoints: number;
  rawPoints: number;
  matchpointWin: boolean;
  matchpointBonus: number;
  roundResultsJson: string | null;
  complianceFlagsJson: string;
  sourceHash: string;
};

function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toInt(value: unknown, fallback = 0): number {
  return Math.trunc(toNumber(value, fallback));
}

function legacyPlacementMultiplier(placement: number): number {
  if (placement <= 0) return 0;
  if (placement === 1) return 1.6;
  if (placement <= 5) return 1.4;
  if (placement <= 10) return 1.2;
  return 1;
}

function parseRoundResults(value: ResultCaptureInput["roundResults"]): RoundCaptureInput[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function average(values: number[], fallback: number): number {
  const clean = values.filter((value) => Number.isFinite(value) && value > 0);
  if (clean.length === 0) return fallback;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function inferTotalTeams(
  results: ResultCaptureInput[],
  tournament: { filledSlots: number; maxSlots: number }
): number {
  const teamKeys = new Set(
    results
      .map((result) => result.teamNumber ?? result.teamName)
      .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
      .map((value) => String(value).trim().toLowerCase())
  );

  if (teamKeys.size > 0) return teamKeys.size;
  return Math.max(1, tournament.filledSlots || tournament.maxSlots || results.length);
}

function complianceFlags(result: ResultCaptureInput) {
  return {
    paymentVerified: result.paymentVerified === true,
    discordVerified: result.discordVerified === true,
    photoVerified: result.photoVerified === true,
    flyerVerified: result.flyerVerified === true,
    rulesAccepted: result.rulesAccepted === true,
    adminVerified: result.adminVerified !== false,
  };
}

function stableHash(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function deriveCapture(
  tournamentId: string,
  result: ResultCaptureInput,
  effectiveTotalTeams: number,
  fallbackMapCount: number
): DerivedCapture {
  const rawRounds = parseRoundResults(result.roundResults);
  const roundResults = rawRounds.map((round, index) => {
    const placement = Math.max(0, toInt(round.placement, 0));
    const teamKills = Math.max(0, toInt(round.teamKills, 0));
    const kills = Math.max(0, toInt(round.kills, 0));
    const placementMultiplier = legacyPlacementMultiplier(placement);
    const skillPoints = teamKills * placementMultiplier;

    return {
      map: round.map ?? index + 1,
      placement,
      kills,
      teamKills,
      placementMultiplier,
      skillPoints,
      matchpointWin: round.matchpointWin === true,
      evidenceUrl: round.evidenceUrl ?? null,
      notes: round.notes ?? null,
    };
  });

  const mapCount = Math.max(fallbackMapCount, roundResults.length, 0);
  const roundsPlayed = Math.max(
    0,
    toInt(result.roundsPlayed, 0) || roundResults.length || mapCount
  );
  const killsFromRounds = roundResults.reduce((sum, round) => sum + round.kills, 0);
  const teamKillsFromRounds = roundResults.reduce((sum, round) => sum + round.teamKills, 0);
  const kills = Math.max(0, toInt(result.kills, killsFromRounds));
  const deaths = Math.max(0, toInt(result.deaths, 0));
  const storedPlacement = Math.max(0, toInt(result.placement, 0));
  const rankingPlacement = storedPlacement > 0 ? storedPlacement : effectiveTotalTeams;
  const averagePlacement = Math.max(
    0,
    toNumber(
      result.averagePlacement,
      average(
        roundResults.map((round) => round.placement),
        rankingPlacement
      )
    )
  );
  const averageKills = Math.max(
    0,
    toNumber(
      result.averageKills,
      roundsPlayed > 0 ? kills / roundsPlayed : kills
    )
  );
  const teamKills = Math.max(
    0,
    toInt(result.teamKills, teamKillsFromRounds || kills)
  );
  const roundSkillPoints = roundResults.reduce((sum, round) => sum + round.skillPoints, 0);
  const fallbackSkillPoints =
    roundSkillPoints > 0
      ? roundSkillPoints
      : teamKills * legacyPlacementMultiplier(Math.round(averagePlacement || rankingPlacement));
  const submittedSkillPoints = toNumber(result.skillPoints, -1);
  const submittedTeamPoints = toNumber(result.teamPoints, -1);
  const skillPoints = Math.max(
    0,
    submittedSkillPoints > 0
      ? submittedSkillPoints
      : submittedTeamPoints > 0
        ? submittedTeamPoints
        : fallbackSkillPoints
  );
  const matchpointWin =
    result.matchpointWin === true || roundResults.some((round) => round.matchpointWin);
  const rawPoints = Math.max(
    0,
    toNumber(result.rawPoints, matchpointWin ? MATCHPOINT_TARGET : skillPoints)
  );
  const matchpointBonus = Math.max(
    0,
    toNumber(
      result.matchpointBonus,
      matchpointWin ? Math.max(0, rawPoints - skillPoints) : 0
    )
  );
  const flags = complianceFlags(result);

  return {
    kills,
    deaths,
    storedPlacement,
    rankingPlacement,
    roundsPlayed,
    averagePlacement,
    averageKills,
    teamKills,
    teamPoints: skillPoints,
    skillPoints,
    rawPoints,
    matchpointWin,
    matchpointBonus,
    roundResultsJson: roundResults.length > 0 ? JSON.stringify(roundResults) : null,
    complianceFlagsJson: JSON.stringify(flags),
    sourceHash: stableHash({
      tournamentId,
      userId: result.userId,
      placement: rankingPlacement,
      kills,
      deaths,
      teamKills,
      skillPoints,
      rawPoints,
      matchpointWin,
      roundResults,
      flags,
    }),
  };
}

async function recreatePsrRecordsForTournament(options: {
  tournamentId: string;
  tournamentType: string;
  totalTeams: number;
  seasonId: string;
  sourceType: string;
  sourceId: string;
  evidenceUrl?: string | null;
  verified: boolean;
}) {
  const allResults = await prisma.tournamentResult.findMany({
    where: { tournamentId: options.tournamentId },
  });
  const bestKills = Math.max(...allResults.map((result) => result.kills), 0);
  const bestSkillPoints = Math.max(
    ...allResults.map((result) => result.skillPoints || result.teamPoints),
    0
  );

  await prisma.rankingMatchRecord.deleteMany({
    where: { tournamentId: options.tournamentId },
  });

  if (allResults.length === 0) return;

  await prisma.rankingMatchRecord.createMany({
    data: allResults.map((result) => ({
      playerId: result.userId,
      tournamentId: options.tournamentId,
      eventId: options.tournamentId,
      seasonId: options.seasonId,
      sourceType: options.sourceType,
      sourceId: options.sourceId,
      evidenceUrl: result.evidenceUrl || options.evidenceUrl || null,
      verified: options.verified && result.adminVerified,
      modelVersion: PSR_MODEL_VERSION,
      tournamentType: options.tournamentType,
      date: new Date(),
      kills: result.kills,
      deaths: result.deaths,
      position: Math.max(1, result.placement || options.totalTeams),
      totalTeams: Math.max(1, options.totalTeams),
      teamName: result.teamName,
      teamNumber: result.teamNumber,
      teamGroup: result.teamGroup,
      roundsPlayed: result.roundsPlayed,
      averagePlacement: result.averagePlacement,
      averageKills: result.averageKills,
      teamKills: result.teamKills,
      teamPoints: result.skillPoints || result.teamPoints,
      skillPoints: result.skillPoints || result.teamPoints,
      rawPoints: result.rawPoints,
      matchpointWin: result.matchpointWin,
      matchpointBonus: result.matchpointBonus,
      captureSchemaVersion: result.captureSchemaVersion,
      roundResults: result.roundResults,
      complianceFlags: result.complianceFlags,
      bestKillsInTournament: bestKills,
      bestTeamPointsInTournament: bestSkillPoints,
    })),
  });
}

/** GET /api/admin/tournaments/[id]/results - Get tournament results */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      entries: {
        include: { user: { select: { id: true, username: true, avatar: true, tier: true, region: true } } },
      },
      results: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
    },
  });

  if (!tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  return NextResponse.json({ tournament });
}

/** POST /api/admin/tournaments/[id]/results - Capture tournament results and rebuild PSR */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { results, totalTeams, evidenceUrl, eventMeta } = body as {
    results: ResultCaptureInput[];
    totalTeams?: number | string;
    evidenceUrl?: string;
    eventMeta?: EventMetaInput;
  };

  if (!results || results.length === 0) {
    return NextResponse.json({ error: "Se requieren resultados" }, { status: 400 });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { entries: true },
  });

  if (!tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  const mapCount = Math.max(0, toInt(eventMeta?.mapCount, tournament.mapCount));
  const effectiveTotalTeams = Math.max(
    1,
    toInt(totalTeams, 0) || inferTotalTeams(results, tournament)
  );
  const sourceType = eventMeta?.sourceType || "tournament_capture";
  const sourceId = id;
  const seasonId = eventMeta?.seasonId || "global";
  const verified = eventMeta?.verified !== false;
  const wasFinished = tournament.status === "finished";

  const derivedResults = results.map((result) => ({
    input: result,
    derived: deriveCapture(id, result, effectiveTotalTeams, mapCount),
  }));

  await prisma.rankingMatchRecord.deleteMany({ where: { tournamentId: id } });

  for (const { input, derived } of derivedResults) {
    await prisma.tournamentResult.upsert({
      where: { tournamentId_userId: { tournamentId: id, userId: input.userId } },
      update: {
        teamName: input.teamName || null,
        teamNumber: input.teamNumber === null ? null : toInt(input.teamNumber, 0) || null,
        teamGroup: input.teamGroup || null,
        rosterSlot: Math.max(1, toInt(input.rosterSlot, 1)),
        captainHandle: input.captainHandle || null,
        rawHandle: input.rawHandle || null,
        normalizedHandle: input.normalizedHandle || null,
        kills: derived.kills,
        deaths: derived.deaths,
        placement: derived.storedPlacement,
        roundsPlayed: derived.roundsPlayed,
        averagePlacement: derived.averagePlacement,
        averageKills: derived.averageKills,
        teamKills: derived.teamKills,
        teamPoints: derived.teamPoints,
        skillPoints: derived.skillPoints,
        rawPoints: derived.rawPoints,
        matchpointWin: derived.matchpointWin,
        matchpointBonus: derived.matchpointBonus,
        ...complianceFlags(input),
        sourceType,
        sourceHash: derived.sourceHash,
        captureSchemaVersion: CAPTURE_SCHEMA_VERSION,
        roundResults: derived.roundResultsJson,
        complianceFlags: derived.complianceFlagsJson,
        evidenceUrl: input.evidenceUrl || evidenceUrl || null,
        notes: input.notes || null,
      },
      create: {
        tournamentId: id,
        userId: input.userId,
        teamName: input.teamName || null,
        teamNumber: input.teamNumber === null ? null : toInt(input.teamNumber, 0) || null,
        teamGroup: input.teamGroup || null,
        rosterSlot: Math.max(1, toInt(input.rosterSlot, 1)),
        captainHandle: input.captainHandle || null,
        rawHandle: input.rawHandle || null,
        normalizedHandle: input.normalizedHandle || null,
        kills: derived.kills,
        deaths: derived.deaths,
        placement: derived.storedPlacement,
        roundsPlayed: derived.roundsPlayed,
        averagePlacement: derived.averagePlacement,
        averageKills: derived.averageKills,
        teamKills: derived.teamKills,
        teamPoints: derived.teamPoints,
        skillPoints: derived.skillPoints,
        rawPoints: derived.rawPoints,
        matchpointWin: derived.matchpointWin,
        matchpointBonus: derived.matchpointBonus,
        ...complianceFlags(input),
        sourceType,
        sourceHash: derived.sourceHash,
        captureSchemaVersion: CAPTURE_SCHEMA_VERSION,
        roundResults: derived.roundResultsJson,
        complianceFlags: derived.complianceFlagsJson,
        evidenceUrl: input.evidenceUrl || evidenceUrl || null,
        notes: input.notes || null,
      },
    });

    await prisma.tournamentEntry.updateMany({
      where: { tournamentId: id, userId: input.userId },
      data: { placement: derived.rankingPlacement },
    });

    if (!wasFinished) {
      const xpReward = derived.rankingPlacement === 1 ? 100 : derived.rankingPlacement <= 3 ? 50 : 25;
      await prisma.user.update({
        where: { id: input.userId },
        data: {
          xp: { increment: xpReward },
          seasonXp: { increment: xpReward },
          lastSeen: new Date(),
        },
      });

      await prisma.feedEvent.create({
        data: {
          userId: input.userId,
          type: derived.rankingPlacement === 1 ? "tournament_win" : "tournament_join",
          title: derived.rankingPlacement === 1 ? "Victoria en Torneo" : `Posicion #${derived.rankingPlacement}`,
          description: `Termino #${derived.rankingPlacement} en ${tournament.name} con ${derived.kills} kills`,
          metadata: JSON.stringify({
            tournamentId: id,
            kills: derived.kills,
            placement: derived.rankingPlacement,
            skillPoints: derived.skillPoints,
            matchpointWin: derived.matchpointWin,
          }),
        },
      });
    }
  }

  await prisma.tournament.update({
    where: { id },
    data: {
      status: "finished",
      scoringModel: "psr",
      captureSchemaVersion: CAPTURE_SCHEMA_VERSION,
      mapCount,
      completedAt: new Date(),
      evidenceUrl: evidenceUrl || null,
      captureMeta: JSON.stringify({
        captureSchemaVersion: CAPTURE_SCHEMA_VERSION,
        scoringModel: "psr",
        sourceType,
        sourceId,
        seasonId,
        totalTeams: effectiveTotalTeams,
        mapCount,
        verified,
        submittedBy: user.id,
        submittedAt: new Date().toISOString(),
        legacyPlacementFormula: "teamKills * multiplier(placement), multipliers: 1=1.6, 2-5=1.4, 6-10=1.2, 11+=1, 0=0",
        matchpointTarget: MATCHPOINT_TARGET,
        matchpointBonusExcludedFromPsr: true,
      }),
    },
  });

  // Persist PSR records for this tournament (PSR audit + scoring).
  await recreatePsrRecordsForTournament({
    tournamentId: id,
    tournamentType: tournament.tournamentType,
    totalTeams: effectiveTotalTeams,
    seasonId,
    sourceType,
    sourceId,
    evidenceUrl,
    verified,
  });

  // Prize distribution: pay each placement per the configured splits.
  // Platform retains PLATFORM_COMMISSION of the pool; the rest is split.
  // Wrapped in a single $transaction so either every winner is paid or none
  // are. Idempotent: tournaments already in "finished" state are skipped so
  // re-submitting results does not double-pay.
  if (!wasFinished && tournament.prizePool > 0) {
    const splits = resolvePrizeSplits(
      tournament.prizeDistribution,
      tournament.customPrizeSplits,
    );
    const distributablePool = tournament.prizePool * (1 - PLATFORM_COMMISSION);

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < splits.length; i++) {
        const place = i + 1;
        const placePct = splits[i];
        if (placePct <= 0) continue;
        const winner = results.find((r) => r.placement === place);
        if (!winner) continue;

        const prize = distributablePool * (placePct / 100);
        const wallet = await tx.wallet.findUnique({ where: { userId: winner.userId } });
        if (!wallet) continue;

        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: prize } },
        });
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: "tournament_win",
            amount: prize,
            description: `Premio: ${place}° lugar en ${tournament.name}`,
            status: "completed",
            reference: tournament.id,
          },
        });
      }
    }, {
      // Multi-winner payouts can take a bit; bump the default 5s timeout.
      timeout: 15_000,
    });
  }

  const rankingResult = await rebuildAndPersistPsrRankings();

  return NextResponse.json({
    message: `Resultados guardados para ${results.length} jugadores. PSR reconstruido con captura ${CAPTURE_SCHEMA_VERSION}.`,
    playersProcessed: results.length,
    rankingStats: rankingResult.stats,
  });
}

/** PUT /api/admin/tournaments/[id]/results - Update individual result correction */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = (await request.json()) as ResultCaptureInput & {
    totalTeams?: number | string;
    eventMeta?: EventMetaInput;
  };
  const { userId } = body;

  if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  const existing = await prisma.tournamentResult.findUnique({
    where: { tournamentId_userId: { tournamentId: id, userId } },
  });
  if (!existing) return NextResponse.json({ error: "Resultado no encontrado" }, { status: 404 });

  const merged: ResultCaptureInput = {
    userId,
    teamName: body.teamName ?? existing.teamName,
    teamNumber: body.teamNumber ?? existing.teamNumber,
    teamGroup: body.teamGroup ?? existing.teamGroup,
    rosterSlot: body.rosterSlot ?? existing.rosterSlot,
    captainHandle: body.captainHandle ?? existing.captainHandle,
    rawHandle: body.rawHandle ?? existing.rawHandle,
    normalizedHandle: body.normalizedHandle ?? existing.normalizedHandle,
    kills: body.kills ?? existing.kills,
    deaths: body.deaths ?? existing.deaths,
    placement: body.placement ?? existing.placement,
    roundsPlayed: body.roundsPlayed ?? existing.roundsPlayed,
    averagePlacement: body.averagePlacement ?? existing.averagePlacement,
    averageKills: body.averageKills ?? existing.averageKills,
    teamKills: body.teamKills ?? existing.teamKills,
    teamPoints: body.teamPoints ?? existing.teamPoints,
    skillPoints: body.skillPoints ?? existing.skillPoints,
    rawPoints: body.rawPoints ?? existing.rawPoints,
    matchpointWin: body.matchpointWin ?? existing.matchpointWin,
    matchpointBonus: body.matchpointBonus ?? existing.matchpointBonus,
    paymentVerified: body.paymentVerified ?? existing.paymentVerified,
    discordVerified: body.discordVerified ?? existing.discordVerified,
    photoVerified: body.photoVerified ?? existing.photoVerified,
    flyerVerified: body.flyerVerified ?? existing.flyerVerified,
    rulesAccepted: body.rulesAccepted ?? existing.rulesAccepted,
    adminVerified: body.adminVerified ?? existing.adminVerified,
    roundResults: body.roundResults ?? existing.roundResults,
    evidenceUrl: body.evidenceUrl ?? existing.evidenceUrl,
    notes: body.notes ?? existing.notes,
  };

  const totalTeams = Math.max(
    1,
    toInt(body.totalTeams, 0) || tournament.maxSlots || tournament.filledSlots || 1
  );
  const mapCount = Math.max(0, toInt(body.eventMeta?.mapCount, tournament.mapCount));
  const derived = deriveCapture(id, merged, totalTeams, mapCount);

  await prisma.tournamentResult.update({
    where: { tournamentId_userId: { tournamentId: id, userId } },
    data: {
      teamName: merged.teamName || null,
      teamNumber: merged.teamNumber === null ? null : toInt(merged.teamNumber, 0) || null,
      teamGroup: merged.teamGroup || null,
      rosterSlot: Math.max(1, toInt(merged.rosterSlot, 1)),
      captainHandle: merged.captainHandle || null,
      rawHandle: merged.rawHandle || null,
      normalizedHandle: merged.normalizedHandle || null,
      kills: derived.kills,
      deaths: derived.deaths,
      placement: derived.storedPlacement,
      roundsPlayed: derived.roundsPlayed,
      averagePlacement: derived.averagePlacement,
      averageKills: derived.averageKills,
      teamKills: derived.teamKills,
      teamPoints: derived.teamPoints,
      skillPoints: derived.skillPoints,
      rawPoints: derived.rawPoints,
      matchpointWin: derived.matchpointWin,
      matchpointBonus: derived.matchpointBonus,
      ...complianceFlags(merged),
      sourceType: body.eventMeta?.sourceType || existing.sourceType,
      sourceHash: derived.sourceHash,
      captureSchemaVersion: CAPTURE_SCHEMA_VERSION,
      roundResults: derived.roundResultsJson,
      complianceFlags: derived.complianceFlagsJson,
      evidenceUrl: merged.evidenceUrl || null,
      notes: merged.notes || null,
    },
  });

  await recreatePsrRecordsForTournament({
    tournamentId: id,
    tournamentType: tournament.tournamentType,
    totalTeams,
    seasonId: body.eventMeta?.seasonId || "global",
    sourceType: body.eventMeta?.sourceType || "tournament_capture",
    sourceId: id,
    evidenceUrl: merged.evidenceUrl,
    verified: body.eventMeta?.verified !== false,
  });

  await rebuildAndPersistPsrRankings();

  return NextResponse.json({
    message: `Resultado actualizado y PSR reconstruido con captura ${CAPTURE_SCHEMA_VERSION}.`,
  });
}
