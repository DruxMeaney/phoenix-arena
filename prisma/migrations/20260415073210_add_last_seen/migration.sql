-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "seasonXp" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("activisionId", "avatar", "banner", "bio", "createdAt", "discordId", "email", "favoriteGame", "favoriteWeapon", "id", "motto", "passwordHash", "peakScore", "platform", "profileTheme", "region", "role", "seasonXp", "socialTwitch", "socialTwitter", "socialYoutube", "status", "tier", "updatedAt", "username", "xp") SELECT "activisionId", "avatar", "banner", "bio", "createdAt", "discordId", "email", "favoriteGame", "favoriteWeapon", "id", "motto", "passwordHash", "peakScore", "platform", "profileTheme", "region", "role", "seasonXp", "socialTwitch", "socialTwitter", "socialYoutube", "status", "tier", "updatedAt", "username", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
