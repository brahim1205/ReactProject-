-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'Moyenne',
    "createdBy" TEXT NOT NULL DEFAULT 'Utilisateur',
    "userId" INTEGER NOT NULL,
    "assignedToId" INTEGER,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "startDateTime" DATETIME,
    "endDateTime" DATETIME,
    "expirationWarningSent" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Todo_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("assignedToId", "audioUrl", "completed", "completedAt", "createdAt", "createdBy", "description", "endDateTime", "id", "imageUrl", "priority", "startDateTime", "status", "title", "updatedAt", "userId") SELECT "assignedToId", "audioUrl", "completed", "completedAt", "createdAt", "createdBy", "description", "endDateTime", "id", "imageUrl", "priority", "startDateTime", "status", "title", "updatedAt", "userId" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
