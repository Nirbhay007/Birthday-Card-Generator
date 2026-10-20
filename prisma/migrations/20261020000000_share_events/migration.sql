-- Share-intent events (ADDITIVE ONLY).
-- Creates the standalone "ShareEvent" table. No ALTER / DROP on existing
-- tables, so existing data is untouched. Safe to re-run.
-- Apply via `npx prisma db push` or run this file in the database SQL editor.

-- CreateTable
CREATE TABLE IF NOT EXISTS "ShareEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'card_footer',
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ShareEvent_createdAt_idx" ON "ShareEvent"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ShareEvent_pageId_channel_sessionId_createdAt_idx"
    ON "ShareEvent"("pageId", "channel", "sessionId", "createdAt");
