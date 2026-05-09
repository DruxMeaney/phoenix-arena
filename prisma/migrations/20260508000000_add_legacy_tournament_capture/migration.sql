-- Preserve the operational fields recovered from 00_old while keeping PSR as
-- the official rating model. Legacy point totals are captured as evidence
-- signals; the matchpoint 999 bonus is stored separately from skillPoints.

ALTER TABLE "Tournament" ADD COLUMN "scoringModel" TEXT NOT NULL DEFAULT 'psr';
ALTER TABLE "Tournament" ADD COLUMN "captureSchemaVersion" TEXT NOT NULL DEFAULT 'psr-legacy-v1';
ALTER TABLE "Tournament" ADD COLUMN "mapCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Tournament" ADD COLUMN "ranked" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Tournament" ADD COLUMN "psrWeight" REAL NOT NULL DEFAULT 1;
ALTER TABLE "Tournament" ADD COLUMN "captureMeta" TEXT;

ALTER TABLE "RankingMatchRecord" ADD COLUMN "teamName" TEXT;
ALTER TABLE "RankingMatchRecord" ADD COLUMN "teamNumber" INTEGER;
ALTER TABLE "RankingMatchRecord" ADD COLUMN "teamGroup" TEXT;
ALTER TABLE "RankingMatchRecord" ADD COLUMN "roundsPlayed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RankingMatchRecord" ADD COLUMN "averagePlacement" REAL NOT NULL DEFAULT 0;
ALTER TABLE "RankingMatchRecord" ADD COLUMN "averageKills" REAL NOT NULL DEFAULT 0;
ALTER TABLE "RankingMatchRecord" ADD COLUMN "skillPoints" REAL NOT NULL DEFAULT 0;
ALTER TABLE "RankingMatchRecord" ADD COLUMN "rawPoints" REAL NOT NULL DEFAULT 0;
ALTER TABLE "RankingMatchRecord" ADD COLUMN "matchpointWin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RankingMatchRecord" ADD COLUMN "matchpointBonus" REAL NOT NULL DEFAULT 0;
ALTER TABLE "RankingMatchRecord" ADD COLUMN "captureSchemaVersion" TEXT NOT NULL DEFAULT 'psr-legacy-v1';
ALTER TABLE "RankingMatchRecord" ADD COLUMN "roundResults" TEXT;
ALTER TABLE "RankingMatchRecord" ADD COLUMN "complianceFlags" TEXT;

ALTER TABLE "TournamentResult" ADD COLUMN "teamName" TEXT;
ALTER TABLE "TournamentResult" ADD COLUMN "teamNumber" INTEGER;
ALTER TABLE "TournamentResult" ADD COLUMN "teamGroup" TEXT;
ALTER TABLE "TournamentResult" ADD COLUMN "rosterSlot" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "TournamentResult" ADD COLUMN "captainHandle" TEXT;
ALTER TABLE "TournamentResult" ADD COLUMN "rawHandle" TEXT;
ALTER TABLE "TournamentResult" ADD COLUMN "normalizedHandle" TEXT;
ALTER TABLE "TournamentResult" ADD COLUMN "roundsPlayed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TournamentResult" ADD COLUMN "averagePlacement" REAL NOT NULL DEFAULT 0;
ALTER TABLE "TournamentResult" ADD COLUMN "averageKills" REAL NOT NULL DEFAULT 0;
ALTER TABLE "TournamentResult" ADD COLUMN "skillPoints" REAL NOT NULL DEFAULT 0;
ALTER TABLE "TournamentResult" ADD COLUMN "rawPoints" REAL NOT NULL DEFAULT 0;
ALTER TABLE "TournamentResult" ADD COLUMN "matchpointWin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TournamentResult" ADD COLUMN "matchpointBonus" REAL NOT NULL DEFAULT 0;
ALTER TABLE "TournamentResult" ADD COLUMN "paymentVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TournamentResult" ADD COLUMN "discordVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TournamentResult" ADD COLUMN "photoVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TournamentResult" ADD COLUMN "flyerVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TournamentResult" ADD COLUMN "rulesAccepted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TournamentResult" ADD COLUMN "adminVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TournamentResult" ADD COLUMN "sourceType" TEXT NOT NULL DEFAULT 'admin_capture';
ALTER TABLE "TournamentResult" ADD COLUMN "sourceHash" TEXT;
ALTER TABLE "TournamentResult" ADD COLUMN "captureSchemaVersion" TEXT NOT NULL DEFAULT 'psr-legacy-v1';
ALTER TABLE "TournamentResult" ADD COLUMN "roundResults" TEXT;
ALTER TABLE "TournamentResult" ADD COLUMN "complianceFlags" TEXT;

CREATE INDEX "RankingMatchRecord_sourceType_sourceId_idx" ON "RankingMatchRecord"("sourceType", "sourceId");
CREATE INDEX "TournamentResult_teamNumber_idx" ON "TournamentResult"("teamNumber");
CREATE INDEX "TournamentResult_sourceType_sourceHash_idx" ON "TournamentResult"("sourceType", "sourceHash");
