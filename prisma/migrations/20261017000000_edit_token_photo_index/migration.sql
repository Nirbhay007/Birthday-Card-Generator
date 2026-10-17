-- Ownership token for card editing (PATCH /api/birthday/[id]).
-- Nullable: cards created before this migration stay editable for their
-- (unverifiable) original creators; every new card receives a token.
ALTER TABLE "BirthdayPage" ADD COLUMN "editToken" TEXT;

CREATE UNIQUE INDEX "BirthdayPage_editToken_key" ON "BirthdayPage"("editToken");

-- Photo lookups/joins/cleanup filter by pageId; Postgres does not index
-- foreign keys automatically.
CREATE INDEX "Photo_pageId_idx" ON "Photo"("pageId");
