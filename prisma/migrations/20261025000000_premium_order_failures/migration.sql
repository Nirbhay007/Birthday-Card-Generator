-- Premium checkout failure diagnostics (ADDITIVE ONLY).
-- Four nullable columns on the existing "PremiumOrder" table. No data is
-- changed, no defaults are backfilled, and no other table is touched.
--
-- Production does not use `prisma migrate` (no _prisma_migrations table and
-- migration_lock.toml still says sqlite), so apply this file manually:
--   ALTER TABLE "PremiumOrder" ADD COLUMN IF NOT EXISTS ...
-- or run `npx prisma db push`. Safe to re-run.

ALTER TABLE "PremiumOrder" ADD COLUMN IF NOT EXISTS "failureCode" TEXT;
ALTER TABLE "PremiumOrder" ADD COLUMN IF NOT EXISTS "failureReason" TEXT;
ALTER TABLE "PremiumOrder" ADD COLUMN IF NOT EXISTS "failureMethod" TEXT;
ALTER TABLE "PremiumOrder" ADD COLUMN IF NOT EXISTS "failedAt" TIMESTAMP(3);
