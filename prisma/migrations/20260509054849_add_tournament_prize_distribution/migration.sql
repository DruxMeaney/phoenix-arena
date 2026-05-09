-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "game" TEXT NOT NULL DEFAULT 'Warzone',
    "format" TEXT NOT NULL,
    "tournamentType" TEXT NOT NULL DEFAULT 'detri',
    "entryFee" REAL NOT NULL,
    "prizePool" REAL NOT NULL DEFAULT 0,
    "maxSlots" INTEGER NOT NULL,
    "filledSlots" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'registration',
    "description" TEXT,
    "rules" TEXT,
    "evidenceUrl" TEXT,
    "createdById" TEXT,
    "startDate" DATETIME,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    "prizeDistribution" TEXT NOT NULL DEFAULT 'winner_takes_all',
    "customPrizeSplits" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tournament_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tournament" ("completedAt", "createdAt", "createdById", "description", "entryFee", "evidenceUrl", "filledSlots", "format", "game", "id", "maxSlots", "name", "prizePool", "rules", "startDate", "status", "tournamentType", "updatedAt") SELECT "completedAt", "createdAt", "createdById", "description", "entryFee", "evidenceUrl", "filledSlots", "format", "game", "id", "maxSlots", "name", "prizePool", "rules", "startDate", "status", "tournamentType", "updatedAt" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
