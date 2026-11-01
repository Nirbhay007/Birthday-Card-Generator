-- Growth features (ADDITIVE ONLY): abandoned-checkout recovery, scheduled
-- delivery, group cards, and reminder capture after creation.
--
-- Existing rows keep their current values: new columns are nullable or have a
-- safe default, and both new tables are empty on first apply.
--
-- Production does not use `prisma migrate` (see earlier migrations), so apply
-- this file manually or run `npx prisma db push`. Safe to re-run.

ALTER TABLE "BirthdayPage" ADD COLUMN IF NOT EXISTS "reminderPhone" TEXT;
ALTER TABLE "BirthdayPage" ADD COLUMN IF NOT EXISTS "isGroup" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "PremiumOrder" ADD COLUMN IF NOT EXISTS "recoverySentAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "PremiumOrder_status_recoverySentAt_createdAt_idx"
    ON "PremiumOrder" ("status", "recoverySentAt", "createdAt");

CREATE TABLE IF NOT EXISTS "CardDelivery" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "creatorEmail" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CardDelivery_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CardDelivery_pageId_fkey" FOREIGN KEY ("pageId")
        REFERENCES "BirthdayPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CardDelivery_pageId_key" ON "CardDelivery" ("pageId");
CREATE INDEX IF NOT EXISTS "CardDelivery_status_scheduledAt_idx" ON "CardDelivery" ("status", "scheduledAt");

CREATE TABLE IF NOT EXISTS "GroupWish" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "emoji" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupWish_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GroupWish_pageId_fkey" FOREIGN KEY ("pageId")
        REFERENCES "BirthdayPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "GroupWish_pageId_createdAt_idx" ON "GroupWish" ("pageId", "createdAt");
