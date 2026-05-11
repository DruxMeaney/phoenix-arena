import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PSR_MODEL_VERSION } from "../src/lib/scoring/psr";
import { rebuildAndPersistPsrRankings } from "../src/lib/ranking/psr-service";

const url = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

const DEMO_SOURCE_TYPE = "demo_psr";
const DEMO_PASSWORD_HASH = "demo-user-no-login";

const demoPlayers = [
  { username: "NyxVoltage", skill: 1.02, region: "latam-norte", theme: "neon-red", bio: "Entry fragger agresivo. Gana mapas cuando el lobby sube de presion." },
  { username: "SableRush", skill: 0.96, region: "latam-sur", theme: "neon-blue", bio: "Jugador de rotaciones limpias y cierres consistentes." },
  { username: "KairoVex", skill: 1.14, region: "latam-norte", theme: "ember", bio: "Capitan metodico, alto impacto en finales de torneo." },
  { username: "MikaByte", skill: 0.89, region: "mexico", theme: "neon-purple", bio: "Especialista en soporte, revive a tiempo y mantiene el equipo vivo." },
  { username: "RogueLima", skill: 1.2, region: "colombia", theme: "neon-red", bio: "Top contender del demo PSR. Buen balance entre kills y placement." },
  { username: "VantaAim", skill: 0.82, region: "chile", theme: "neon-blue", bio: "Jugador nuevo en calibracion, mejora rapido pero aun con sigma alta." },
  { username: "OrionStack", skill: 1.08, region: "mexico", theme: "ember", bio: "IGL paciente, prioriza posicion antes que stat padding." },
  { username: "LunaTrace", skill: 0.93, region: "peru", theme: "neon-purple", bio: "Gran control de informacion y consistencia en mapas largos." },
  { username: "FenixK", skill: 1.26, region: "mexico", theme: "neon-red", bio: "Demo elite. Sube por lobby strength y resultados contra rivales fuertes." },
  { username: "DeltaMora", skill: 0.78, region: "argentina", theme: "neon-blue", bio: "Perfil ideal para observar calibracion y recuperacion de sigma." },
  { username: "EchoRift", skill: 1.0, region: "latam-norte", theme: "ember", bio: "Jugador medio muy util para comparar percentiles." },
  { username: "NovaQuill", skill: 0.87, region: "mexico", theme: "neon-purple", bio: "Buen desempeno por equipo, kills moderadas y placement estable." },
];

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function placementMultiplier(placement: number): number {
  if (placement <= 0) return 0;
  if (placement === 1) return 1.6;
  if (placement <= 5) return 1.4;
  if (placement <= 10) return 1.2;
  return 1;
}

async function upsertDemoUsers() {
  const users = [];

  for (const player of demoPlayers) {
    const user = await prisma.user.upsert({
      where: { username: player.username },
      update: {
        status: "active",
        role: "player",
        region: player.region,
        profileTheme: player.theme,
        bio: player.bio,
        favoriteGame: "Warzone",
        favoriteWeapon: player.skill >= 1 ? "MCW" : "HRM-9",
        motto: player.skill >= 1.05 ? "Ganar tambien se audita" : "Mejorar mapa a mapa",
        passwordHash: DEMO_PASSWORD_HASH,
        lastSeen: new Date(),
      },
      create: {
        username: player.username,
        email: `${player.username.toLowerCase()}@demo.phoenix`,
        passwordHash: DEMO_PASSWORD_HASH,
        role: "player",
        status: "active",
        region: player.region,
        profileTheme: player.theme,
        bio: player.bio,
        favoriteGame: "Warzone",
        favoriteWeapon: player.skill >= 1 ? "MCW" : "HRM-9",
        motto: player.skill >= 1.05 ? "Ganar tambien se audita" : "Mejorar mapa a mapa",
        platform: "uno",
        xp: 900 + Math.round(player.skill * 800),
        seasonXp: 200 + Math.round(player.skill * 250),
        lastSeen: new Date(),
      },
    });

    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: { balance: Math.round(player.skill * 100), heldBalance: 0 },
      create: { userId: user.id, balance: Math.round(player.skill * 100), heldBalance: 0 },
    });

    users.push({ ...user, skill: player.skill });
  }

  return users;
}

async function seedPosts(userIds: string[]) {
  await prisma.profilePost.deleteMany({ where: { userId: { in: userIds } } });

  for (const userId of userIds) {
    await prisma.profilePost.createMany({
      data: [
        {
          userId,
          postType: "achievement",
          content: "Demo PSR activo: historial con deltas, sigma, lobby strength y performance signal listo para auditar.",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          postType: "highlight",
          content: "Este perfil ficticio permite revisar como cambia el ranking cuando el jugador compite en distintos lobbies.",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }
}

async function seedPsrRecords(users: Array<{ id: string; skill: number }>) {
  const userIds = users.map((user) => user.id);

  await prisma.rankingMatchRecord.deleteMany({ where: { sourceType: DEMO_SOURCE_TYPE } });
  await prisma.rankingEventLog.deleteMany({ where: { sourceType: DEMO_SOURCE_TYPE } });
  await prisma.rankingSnapshot.deleteMany({ where: { playerId: { in: userIds } } });

  const random = seededRandom(20260508);
  const eventCount = 18;
  const totalTeams = users.length;

  for (let eventIndex = 0; eventIndex < eventCount; eventIndex += 1) {
    const occurredAt = new Date(Date.now() - (eventCount - eventIndex) * 36 * 60 * 60 * 1000);
    const mapCount = 3 + (eventIndex % 3);
    const lobbySwing = 0.82 + random() * 0.36;
    const eventRows = users
      .map((user, playerIndex) => {
        const variance = (random() - 0.5) * 0.42;
        const clutch = eventIndex % 6 === playerIndex % 6 ? 0.12 : 0;
        const score = user.skill * lobbySwing + variance + clutch;
        return { user, score, playerIndex };
      })
      .sort((a, b) => b.score - a.score);

    for (let placementIndex = 0; placementIndex < eventRows.length; placementIndex += 1) {
      const row = eventRows[placementIndex];
      const placement = placementIndex + 1;
      const roundsPlayed = mapCount;
      const kills = Math.max(0, Math.round(row.score * 8 + random() * 5 - placement * 0.2));
      const averageKills = kills / roundsPlayed;
      const averagePlacement = Math.max(1, placement + (random() - 0.5) * 2.2);
      const teamKills = Math.max(kills, Math.round(kills * (1.35 + random() * 0.35)));
      const skillPoints = Number((teamKills * placementMultiplier(Math.round(averagePlacement))).toFixed(2));
      const matchpointWin = placement === 1 && eventIndex % 7 === 0;
      const rawPoints = matchpointWin ? 999 : skillPoints;

      await prisma.rankingMatchRecord.create({
        data: {
          playerId: row.user.id,
          eventId: `demo-event-${eventIndex + 1}`,
          seasonId: "global",
          sourceType: DEMO_SOURCE_TYPE,
          sourceId: `demo-event-${eventIndex + 1}`,
          evidenceUrl: "https://demo.phoenix-arena.local/psr",
          verified: true,
          modelVersion: PSR_MODEL_VERSION,
          tournamentType: eventIndex % 4 === 0 ? "all_skills" : "detri",
          date: occurredAt,
          kills,
          deaths: Math.max(0, Math.round(3 + random() * 5 - row.score)),
          position: placement,
          totalTeams,
          teamName: `Squad ${Math.floor(row.playerIndex / 3) + 1}`,
          teamNumber: Math.floor(row.playerIndex / 3) + 1,
          teamGroup: eventIndex % 2 === 0 ? "A" : "B",
          roundsPlayed,
          averagePlacement,
          averageKills,
          teamKills,
          teamPoints: skillPoints,
          skillPoints,
          rawPoints,
          matchpointWin,
          matchpointBonus: matchpointWin ? Math.max(0, rawPoints - skillPoints) : 0,
          captureSchemaVersion: "psr-legacy-v1",
          complianceFlags: JSON.stringify({
            paymentVerified: true,
            discordVerified: true,
            photoVerified: true,
            flyerVerified: true,
            rulesAccepted: true,
            adminVerified: true,
          }),
          bestKillsInTournament: 22,
          bestTeamPointsInTournament: 54,
        },
      });
    }
  }
}

async function main() {
  console.log("Seeding PSR demo users and history...");
  const users = await upsertDemoUsers();
  await seedPosts(users.map((user) => user.id));
  await seedPsrRecords(users);
  const snapshot = await rebuildAndPersistPsrRankings();
  console.log(`Demo PSR ready: ${users.length} users, ${snapshot.stats.events} PSR events, ${snapshot.stats.deltas} deltas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
