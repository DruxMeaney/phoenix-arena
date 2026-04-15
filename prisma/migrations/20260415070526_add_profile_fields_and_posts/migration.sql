-- CreateTable
CREATE TABLE "ProfilePost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "postType" TEXT NOT NULL DEFAULT 'update',
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProfilePost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "seasonXp" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("activisionId", "avatar", "createdAt", "discordId", "email", "id", "passwordHash", "peakScore", "platform", "region", "role", "seasonXp", "status", "tier", "updatedAt", "username", "xp") SELECT "activisionId", "avatar", "createdAt", "discordId", "email", "id", "passwordHash", "peakScore", "platform", "region", "role", "seasonXp", "status", "tier", "updatedAt", "username", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
