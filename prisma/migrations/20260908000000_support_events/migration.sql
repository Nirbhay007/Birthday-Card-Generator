-- Support-funnel analytics (ADDITIVE ONLY).
-- Creates the standalone "SupportEvent" table. No ALTER / DROP / CREATE INDEX
-- on any existing table, so existing data is untouched. Safe to re-run.
-- NOTE: this repo's migration history is sqlite-flavored while production runs
-- Postgres, so apply via `npx prisma db push` (adds only the missing table)
-- or run this file directly with psql / the database dashboard SQL editor.

-- CreateTable
CREATE TABLE IF NOT EXISTS "SupportEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event" TEXT NOT NULL,
    "amount" INTEGER,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SupportEvent_event_createdAt_idx" ON "SupportEvent"("event", "createdAt");
