/**
 * Seed script for end-to-end payment testing.
 *
 * Creates / refreshes:
 *   - A test user "test_player" with $50 wallet balance (matching the
 *     fake discordId the /api/auth/dev-login endpoint uses).
 *   - Three open tournaments with different entry fees so you can
 *     exercise wallet-only, top-up-needed, and "expensive" join flows:
 *       * "Test Cup A"   — entry $1   (covered by wallet, default flow)
 *       * "Test Cup B"   — entry $20  (covered by wallet, default flow)
 *       * "Test Cup C"   — entry $200 (forces PayPal/MP/Stripe top-up)
 *
 * Run with:
 *   DATABASE_URL="file:./dev.db" npx tsx prisma/seed-test.ts
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

const TEST_DISCORD_ID = "dev:test_player";
const TEST_USERNAME = "test_player";

const TOURNAMENTS = [
  {
    name: "Test Cup A — entrada $1",
    entryFee: 1,
    maxSlots: 8,
    description: "Torneo de prueba con entrada minima. Cubrible con saldo.",
    prizeDistribution: "winner_takes_all",
    customPrizeSplits: null as string | null,
  },
  {
    name: "Test Cup B — entrada $20",
    entryFee: 20,
    maxSlots: 16,
    description: "Torneo de prueba con entrada media. Cubrible con $50 de saldo.",
    prizeDistribution: "top_3",
    customPrizeSplits: null as string | null,
  },
  {
    name: "Test Cup C — entrada $200",
    entryFee: 200,
    maxSlots: 8,
    description: "Torneo caro: fuerza el flujo de top-up con PayPal/MP/Stripe.",
    prizeDistribution: "top_5",
    customPrizeSplits: null as string | null,
  },
];

async function main() {
  console.log("Seeding test data...");

  // ── User + wallet ─────────────────────────────────────────────────
  let user = await prisma.user.findUnique({
    where: { discordId: TEST_DISCORD_ID },
    include: { wallet: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: TEST_USERNAME,
        email: `${TEST_USERNAME}@dev.local`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${TEST_USERNAME}`,
        discordId: TEST_DISCORD_ID,
        wallet: { create: { balance: 50 } },
      },
      include: { wallet: true },
    });
    console.log(`  ✓ Created user ${user.username} with $50 wallet`);
  } else {
    if (user.wallet) {
      await prisma.wallet.update({
        where: { id: user.wallet.id },
        data: { balance: 50 },
      });
      console.log(`  ✓ Reset ${user.username} wallet balance to $50`);
    }
  }

  // ── Tournaments ────────────────────────────────────────────────────
  for (const t of TOURNAMENTS) {
    const existing = await prisma.tournament.findFirst({
      where: { name: t.name },
    });
    if (existing) {
      // Re-open it for repeat testing if it was finished/cancelled.
      await prisma.tournament.update({
        where: { id: existing.id },
        data: {
          status: "registration",
          filledSlots: 0,
          prizePool: 0,
          completedAt: null,
          cancelledAt: null,
          prizeDistribution: t.prizeDistribution,
          customPrizeSplits: t.customPrizeSplits,
        },
      });
      await prisma.tournamentEntry.deleteMany({ where: { tournamentId: existing.id } });
      await prisma.tournamentResult.deleteMany({ where: { tournamentId: existing.id } });
      console.log(`  ✓ Reset tournament: ${t.name}`);
    } else {
      await prisma.tournament.create({
        data: {
          name: t.name,
          game: "Warzone - Battle Royale",
          format: "Trios",
          tournamentType: "detri",
          entryFee: t.entryFee,
          maxSlots: t.maxSlots,
          description: t.description,
          prizeDistribution: t.prizeDistribution,
          customPrizeSplits: t.customPrizeSplits,
          status: "registration",
        },
      });
      console.log(`  ✓ Created tournament: ${t.name}`);
    }
  }

  console.log("\nDone. Test user: test_player ($50 saldo). Login via /login → 'Dev login'.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
