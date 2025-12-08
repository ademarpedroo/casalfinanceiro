-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CreditCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "limit" REAL NOT NULL,
    "closingDay" INTEGER NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'nubank',
    "brand" TEXT NOT NULL DEFAULT 'mastercard',
    "lastFourDigits" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreditCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CreditCard" ("brand", "closingDay", "color", "createdAt", "dueDay", "id", "lastFourDigits", "limit", "name", "updatedAt", "userId") SELECT "brand", "closingDay", "color", "createdAt", "dueDay", "id", "lastFourDigits", "limit", "name", "updatedAt", "userId" FROM "CreditCard";
DROP TABLE "CreditCard";
ALTER TABLE "new_CreditCard" RENAME TO "CreditCard";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
