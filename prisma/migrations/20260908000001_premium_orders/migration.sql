-- Premium payment receipts (ADDITIVE ONLY).
-- Creates the standalone "PremiumOrder" table. No ALTER / DROP / CREATE INDEX
-- on any existing table, so existing data is untouched. Safe to re-run.
-- Apply via `npx prisma db push` or run this file in the database SQL editor.

-- CreateTable
CREATE TABLE IF NOT EXISTS "PremiumOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL DEFAULT 'razorpay',
    "orderId" TEXT NOT NULL UNIQUE,
    "paymentId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "unlockToken" TEXT UNIQUE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PremiumOrder_status_createdAt_idx" ON "PremiumOrder"("status", "createdAt");
