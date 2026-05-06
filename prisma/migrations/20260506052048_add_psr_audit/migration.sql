-- CreateTable
CREATE TABLE "RankingModelVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'shadow',
    "description" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RankingEventLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL DEFAULT 'global',
    "tournamentId" TEXT,
    "matchId" TEXT,
    "modelVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processed',
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "resultHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RankingDelta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventLogId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "muBefore" REAL NOT NULL,
    "sigmaBefore" REAL NOT NULL,
    "psrBefore" REAL NOT NULL,
    "muAfter" REAL NOT NULL,
    "sigmaAfter" REAL NOT NULL,
    "psrAfter" REAL NOT NULL,
    "deltaPsr" REAL NOT NULL,
    "placement" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "lobbyStrength" REAL NOT NULL DEFAULT 1,
    "performanceSignal" REAL NOT NULL DEFAULT 0,
    "explanation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RankingDelta_eventLogId_fkey" FOREIGN KEY ("eventLogId") REFERENCES "RankingEventLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RankingDelta_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RankingSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL DEFAULT 'global',
    "rank" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "mu" REAL NOT NULL,
    "sigma" REAL NOT NULL,
    "psr" REAL NOT NULL,
    "percentile" REAL NOT NULL,
    "matchesPlayed" INTEGER NOT NULL,
    "isCalibrating" BOOLEAN NOT NULL DEFAULT false,
    "isDecaying" BOOLEAN NOT NULL DEFAULT false,
    "decayMultiplier" REAL NOT NULL DEFAULT 1,
    "sourceHash" TEXT NOT NULL,
    "snapshotAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RankingSnapshot_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RankingMatchRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "tournamentId" TEXT,
    "eventId" TEXT,
    "seasonId" TEXT NOT NULL DEFAULT 'global',
    "sourceType" TEXT NOT NULL DEFAULT 'manual',
    "sourceId" TEXT,
    "evidenceUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "modelVersion" TEXT NOT NULL DEFAULT 'psr-0.1-draft',
    "psrProcessedAt" DATETIME,
    "tournamentType" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 1,
    "totalTeams" INTEGER NOT NULL DEFAULT 1,
    "teamKills" INTEGER NOT NULL DEFAULT 0,
    "teamPoints" REAL NOT NULL DEFAULT 0,
    "bestKillsInTournament" INTEGER NOT NULL DEFAULT 0,
    "bestTeamPointsInTournament" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "RankingMatchRecord_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RankingMatchRecord" ("bestKillsInTournament", "bestTeamPointsInTournament", "date", "deaths", "id", "kills", "playerId", "position", "teamKills", "teamPoints", "totalTeams", "tournamentId", "tournamentType") SELECT "bestKillsInTournament", "bestTeamPointsInTournament", "date", "deaths", "id", "kills", "playerId", "position", "teamKills", "teamPoints", "totalTeams", "tournamentId", "tournamentType" FROM "RankingMatchRecord";
DROP TABLE "RankingMatchRecord";
ALTER TABLE "new_RankingMatchRecord" RENAME TO "RankingMatchRecord";
CREATE INDEX "RankingMatchRecord_tournamentId_idx" ON "RankingMatchRecord"("tournamentId");
CREATE INDEX "RankingMatchRecord_eventId_idx" ON "RankingMatchRecord"("eventId");
CREATE INDEX "RankingMatchRecord_seasonId_modelVersion_idx" ON "RankingMatchRecord"("seasonId", "modelVersion");
CREATE INDEX "RankingMatchRecord_playerId_date_idx" ON "RankingMatchRecord"("playerId", "date");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "avatar" TEXT,
    "banner" TEXT,
    "bio" TEXT,
    "socialTwitter" TEXT,
    "socialYoutube" TEXT,
    "socialTwitch" TEXT,
    "favoriteGame" TEXT,
    "favoriteWeapon" TEXT,
    "motto" TEXT,
    "profileTheme" TEXT NOT NULL DEFAULT 'neon-blue',
    "region" TEXT NOT NULL DEFAULT 'latam-norte',
    "activisionId" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'uno',
    "discordId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'player',
    "status" TEXT NOT NULL DEFAULT 'active',
    "tier" TEXT NOT NULL DEFAULT 'Detri',
    "peakScore" REAL NOT NULL DEFAULT 0,
    "psrMu" REAL NOT NULL DEFAULT 25,
    "psrSigma" REAL NOT NULL DEFAULT 8.333333333333334,
    "psrScore" REAL NOT NULL DEFAULT 0,
    "psrMatches" INTEGER NOT NULL DEFAULT 0,
    "peakPsr" REAL NOT NULL DEFAULT 0,
    "psrModelVersion" TEXT NOT NULL DEFAULT 'psr-0.1-draft',
    "psrLastEventAt" DATETIME,
    "trustScore" REAL NOT NULL DEFAULT 0,
    "trustLevel" TEXT NOT NULL DEFAULT 'restricted',
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "seasonXp" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("activisionId", "avatar", "banner", "bio", "createdAt", "discordId", "email", "favoriteGame", "favoriteWeapon", "id", "isFlagged", "lastSeen", "motto", "passwordHash", "peakScore", "platform", "profileTheme", "region", "role", "seasonXp", "socialTwitch", "socialTwitter", "socialYoutube", "status", "tier", "trustLevel", "trustScore", "updatedAt", "username", "xp") SELECT "activisionId", "avatar", "banner", "bio", "createdAt", "discordId", "email", "favoriteGame", "favoriteWeapon", "id", "isFlagged", "lastSeen", "motto", "passwordHash", "peakScore", "platform", "profileTheme", "region", "role", "seasonXp", "socialTwitch", "socialTwitter", "socialYoutube", "status", "tier", "trustLevel", "trustScore", "updatedAt", "username", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RankingModelVersion_version_key" ON "RankingModelVersion"("version");

-- CreateIndex
CREATE INDEX "RankingEventLog_seasonId_modelVersion_idx" ON "RankingEventLog"("seasonId", "modelVersion");

-- CreateIndex
CREATE INDEX "RankingEventLog_occurredAt_idx" ON "RankingEventLog"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "RankingEventLog_sourceType_sourceId_modelVersion_key" ON "RankingEventLog"("sourceType", "sourceId", "modelVersion");

-- CreateIndex
CREATE INDEX "RankingDelta_playerId_createdAt_idx" ON "RankingDelta"("playerId", "createdAt");

-- CreateIndex
CREATE INDEX "RankingDelta_modelVersion_idx" ON "RankingDelta"("modelVersion");

-- CreateIndex
CREATE UNIQUE INDEX "RankingDelta_eventLogId_playerId_key" ON "RankingDelta"("eventLogId", "playerId");

-- CreateIndex
CREATE INDEX "RankingSnapshot_seasonId_modelVersion_snapshotAt_idx" ON "RankingSnapshot"("seasonId", "modelVersion", "snapshotAt");

-- CreateIndex
CREATE INDEX "RankingSnapshot_playerId_snapshotAt_idx" ON "RankingSnapshot"("playerId", "snapshotAt");
