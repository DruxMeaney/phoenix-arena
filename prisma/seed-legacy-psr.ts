import "dotenv/config";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PSR_MODEL_VERSION } from "../src/lib/scoring/psr";
import { rebuildAndPersistPsrRankings } from "../src/lib/ranking/psr-service";

const url = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

const LEGACY_SOURCE_TYPE = "legacy_excel";
const DEMO_SOURCE_TYPE = "demo_psr";
const LEGACY_PASSWORD_HASH = "legacy-excel-import-no-login";
const DEMO_USERNAMES = [
  "NyxVoltage",
  "SableRush",
  "KairoVex",
  "MikaByte",
  "RogueLima",
  "VantaAim",
  "OrionStack",
  "LunaTrace",
  "FenixK",
  "DeltaMora",
  "EchoRift",
  "NovaQuill",
];

interface LegacyImport {
  version: string;
  stats: Record<string, number>;
  players: LegacyPlayer[];
  events: LegacyEvent[];
}

interface LegacyPlayer {
  normalizedHandle: string;
  displayHandle: string;
  participations: number;
  kills: number;
}

interface LegacyEvent {
  sourceId: string;
  name: string;
  fileName: string;
  occurredAt: string;
  tournamentType: string;
  totalTeams: number;
  mapCount: number;
  teams: LegacyTeam[];
}

interface LegacyTeam {
  teamName: string;
  teamNumber: number | null;
  teamGroup: string;
  placement: number;
  roundsPlayed: number;
  averagePlacement: number;
  teamKills: number;
  skillPoints: number;
  rawPoints: number;
  matchpointWin: boolean;
  paymentVerified: boolean;
  discordVerified: boolean;
  photoVerified: boolean;
  flyerVerified: boolean;
  roundResults: Array<{
    map: number;
    teamKills: number;
    placement: number;
    placementMultiplier: number;
    skillPoints: number;
  }>;
  players: LegacyTeamPlayer[];
}

interface LegacyTeamPlayer {
  rawHandle: string;
  normalizedHandle: string;
  killsByMap: number[];
}

function slugHandle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_. -]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueUsername(base: string, used: Set<string>): string {
  const clean = slugHandle(base) || "LegacyPlayer";
  let candidate = clean.slice(0, 28);
  let suffix = 2;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${clean.slice(0, 24)}${suffix}`;
    suffix += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

function legacyEmailLocalPart(normalizedHandle: string): string {
  const localPart = normalizedHandle.replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
  return (localPart || "player").slice(0, 42);
}

function legacyEmail(normalizedHandle: string): string {
  const digest = createHash("sha256").update(normalizedHandle).digest("hex").slice(0, 10);
  return `legacy+${legacyEmailLocalPart(normalizedHandle)}.${digest}@phoenix.local`;
}

function legacyEmailV1(normalizedHandle: string): string {
  return `legacy+${legacyEmailLocalPart(normalizedHandle)}@phoenix.local`;
}

function chunkList<T>(items: T[], size = 500): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function loadImport(path: string): Promise<LegacyImport> {
  const raw = await fs.readFile(path, "utf8");
  return JSON.parse(raw) as LegacyImport;
}

function selectedHandles(payload: LegacyImport, topPlayers: number): Set<string> {
  return new Set(
    [...payload.players]
      .sort((a, b) => b.participations - a.participations || b.kills - a.kills)
      .slice(0, topPlayers)
      .map((player) => player.normalizedHandle)
  );
}

function selectedEvents(payload: LegacyImport, maxEvents: number): LegacyEvent[] {
  return [...payload.events]
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())
    .slice(0, maxEvents);
}

function positiveLimit(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function removeSyntheticDemoUsers() {
  const demoUsers = await prisma.user.findMany({
    where: { username: { in: DEMO_USERNAMES } },
    select: { id: true },
  });
  const ids = demoUsers.map((user) => user.id);
  if (ids.length === 0) return;

  await prisma.rankingSnapshot.deleteMany({ where: { playerId: { in: ids } } });
  await prisma.rankingDelta.deleteMany({ where: { playerId: { in: ids } } });
  await prisma.rankingMatchRecord.deleteMany({ where: { playerId: { in: ids } } });
  await prisma.profilePost.deleteMany({ where: { userId: { in: ids } } });
  await prisma.feedEvent.deleteMany({ where: { userId: { in: ids } } });
  const wallets = await prisma.wallet.findMany({ where: { userId: { in: ids } }, select: { id: true } });
  await prisma.transaction.deleteMany({ where: { walletId: { in: wallets.map((wallet) => wallet.id) } } });
  await prisma.wallet.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}

async function resetLegacyRecords(playerIds: string[]) {
  await prisma.rankingMatchRecord.deleteMany({
    where: { sourceType: { in: [LEGACY_SOURCE_TYPE, DEMO_SOURCE_TYPE] } },
  });
  await prisma.rankingEventLog.deleteMany({
    where: { sourceType: { in: [LEGACY_SOURCE_TYPE, DEMO_SOURCE_TYPE] } },
  });
  for (const playerIdChunk of chunkList(playerIds)) {
    await prisma.rankingSnapshot.deleteMany({ where: { playerId: { in: playerIdChunk } } });
  }
}

async function upsertLegacyUsers(players: LegacyPlayer[], handles: Set<string>) {
  const selectedPlayers = players.filter((player) => handles.has(player.normalizedHandle));
  const existingUsers = await prisma.user.findMany({
    select: { id: true, username: true, email: true },
  });
  const used = new Set(existingUsers.map((user) => user.username.toLowerCase()));
  const existingByEmail = new Map(
    existingUsers
      .filter((user): user is typeof user & { email: string } => Boolean(user.email))
      .map((user) => [user.email, user])
  );
  const createRows: Prisma.UserCreateManyInput[] = [];
  const byHandle = new Map<string, { id: string; username: string }>();

  for (const player of selectedPlayers) {
    const email = legacyEmail(player.normalizedHandle);
    const previousEmail = legacyEmailV1(player.normalizedHandle);
    const existing = existingByEmail.get(email);
    const previousExisting = !existing && previousEmail !== email
      ? existingByEmail.get(previousEmail)
      : null;

    if (previousExisting) {
      await prisma.user.update({
        where: { id: previousExisting.id },
        data: { email },
      });
      existingByEmail.delete(previousEmail);
      existingByEmail.set(email, { ...previousExisting, email });
      continue;
    }

    if (existing) continue;

    createRows.push({
      username: uniqueUsername(player.displayHandle, used),
      email,
      passwordHash: LEGACY_PASSWORD_HASH,
      status: "active",
      role: "player",
      profileTheme: player.participations >= 8 ? "neon-red" : "neon-blue",
      region: "legacy-import",
      favoriteGame: "Warzone",
      platform: "uno",
      bio: `Jugador importado desde historico Phoenix (${player.participations} participaciones detectadas).`,
      motto: "Importado del historico competitivo",
      xp: Math.min(5000, Math.round(player.kills * 12 + player.participations * 40)),
      seasonXp: Math.min(1500, Math.round(player.kills * 3 + player.participations * 15)),
    });
  }

  for (const rowChunk of chunkList(createRows)) {
    await prisma.user.createMany({ data: rowChunk });
  }

  const finalUsersByEmail = new Map<string, { id: string; username: string }>();
  const importEmails = selectedPlayers.map((player) => legacyEmail(player.normalizedHandle));
  for (const emailChunk of chunkList([...new Set(importEmails)])) {
    const users = await prisma.user.findMany({
      where: { email: { in: emailChunk } },
      select: { id: true, username: true, email: true },
    });
    for (const user of users) {
      if (user.email) finalUsersByEmail.set(user.email, user);
    }
  }

  for (const player of selectedPlayers) {
    const user = finalUsersByEmail.get(legacyEmail(player.normalizedHandle));
    if (user) byHandle.set(player.normalizedHandle, { id: user.id, username: user.username });
  }

  const userIds = [...byHandle.values()].map((user) => user.id);
  const existingWalletUserIds = new Set<string>();
  for (const userIdChunk of chunkList(userIds)) {
    const wallets = await prisma.wallet.findMany({
      where: { userId: { in: userIdChunk } },
      select: { userId: true },
    });
    for (const wallet of wallets) existingWalletUserIds.add(wallet.userId);
  }

  const walletRows: Prisma.WalletCreateManyInput[] = userIds
    .filter((userId) => !existingWalletUserIds.has(userId))
    .map((userId) => ({ userId, balance: 0, heldBalance: 0 }));
  for (const walletChunk of chunkList(walletRows)) {
    await prisma.wallet.createMany({ data: walletChunk });
  }
  return byHandle;
}

function playerKills(player: LegacyTeamPlayer): number {
  return player.killsByMap.reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
}

async function createLegacyRecords(events: LegacyEvent[], usersByHandle: Map<string, { id: string }>) {
  const rows: Prisma.RankingMatchRecordCreateManyInput[] = [];

  for (const event of events) {
    const entries = event.teams.flatMap((team) =>
      team.players
        .filter((player) => usersByHandle.has(player.normalizedHandle))
        .map((player) => ({ team, player, kills: playerKills(player) }))
    );
    const bestKills = Math.max(0, ...entries.map((entry) => entry.kills));
    const bestSkillPoints = Math.max(0, ...event.teams.map((team) => team.skillPoints));

    for (const entry of entries) {
      const user = usersByHandle.get(entry.player.normalizedHandle);
      if (!user) continue;
      const averageKills =
        entry.team.roundsPlayed > 0 ? entry.kills / entry.team.roundsPlayed : entry.kills;
      const roundResults = entry.team.roundResults.map((round) => ({
        ...round,
        playerKills: entry.player.killsByMap[round.map - 1] ?? 0,
      }));

      rows.push({
        playerId: user.id,
        eventId: event.sourceId,
        seasonId: "legacy-2025",
        sourceType: LEGACY_SOURCE_TYPE,
        sourceId: event.sourceId,
        evidenceUrl: null,
        verified: false,
        modelVersion: PSR_MODEL_VERSION,
        tournamentType: event.tournamentType,
        date: new Date(event.occurredAt),
        kills: Math.round(entry.kills),
        deaths: 0,
        position: Math.max(1, Math.round(entry.team.placement || event.totalTeams)),
        totalTeams: Math.max(1, event.totalTeams),
        teamName: entry.team.teamName,
        teamNumber: entry.team.teamNumber,
        teamGroup: entry.team.teamGroup || null,
        roundsPlayed: entry.team.roundsPlayed,
        averagePlacement: entry.team.averagePlacement || entry.team.placement,
        averageKills,
        teamKills: Math.round(entry.team.teamKills),
        teamPoints: entry.team.skillPoints,
        skillPoints: entry.team.skillPoints,
        rawPoints: entry.team.rawPoints || entry.team.skillPoints,
        matchpointWin: entry.team.matchpointWin,
        matchpointBonus: Math.max(0, (entry.team.rawPoints || 0) - entry.team.skillPoints),
        captureSchemaVersion: "psr-legacy-v1",
        roundResults: JSON.stringify(roundResults),
        complianceFlags: JSON.stringify({
          paymentVerified: entry.team.paymentVerified,
          discordVerified: entry.team.discordVerified,
          photoVerified: entry.team.photoVerified,
          flyerVerified: entry.team.flyerVerified,
          rulesAccepted: false,
          adminVerified: false,
          importReviewRequired: true,
          sourceFile: event.fileName,
        }),
        bestKillsInTournament: Math.round(bestKills),
        bestTeamPointsInTournament: bestSkillPoints,
      });
    }
  }

  for (const rowChunk of chunkList(rows)) {
    await prisma.rankingMatchRecord.createMany({ data: rowChunk });
  }

  return rows.length;
}

async function main() {
  const inputPath = process.env.LEGACY_IMPORT_JSON || "data/legacy-psr/legacy-import.json";
  const payload = await loadImport(inputPath);
  const topPlayers = positiveLimit(process.env.LEGACY_IMPORT_TOP_PLAYERS, payload.players.length);
  const maxEvents = positiveLimit(process.env.LEGACY_IMPORT_MAX_EVENTS, payload.events.length);
  const handles = selectedHandles(payload, topPlayers);
  const events = selectedEvents(payload, maxEvents);
  const selectedPlayers = payload.players.filter((player) => handles.has(player.normalizedHandle));

  console.log(
    `Importing legacy PSR data: ${selectedPlayers.length} players, ${events.length} events from ${payload.stats.filesScanned} files.`
  );

  await removeSyntheticDemoUsers();
  const usersByHandle = await upsertLegacyUsers(selectedPlayers, handles);
  await resetLegacyRecords([...usersByHandle.values()].map((user) => user.id));
  const records = await createLegacyRecords(events, usersByHandle);
  const snapshot = await rebuildAndPersistPsrRankings();

  console.log(
    `Legacy PSR ready: ${usersByHandle.size} users, ${records} records, ${snapshot.stats.events} PSR events, ${snapshot.stats.deltas} deltas.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
