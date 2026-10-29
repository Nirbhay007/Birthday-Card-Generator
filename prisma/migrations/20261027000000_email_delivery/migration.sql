-- Transactional email state (ADDITIVE ONLY).
-- Existing rows keep null values, meaning "no reminder/receipt sent yet".
-- No other table is altered and no data is rewritten.
--
-- Production does not use `prisma migrate` (see previous migrations), so apply
-- this file manually or run `npx prisma db push`. Safe to re-run.

ALTER TABLE "BirthdayPage" ADD COLUMN IF NOT EXISTS "reminderSentFor" INTEGER;
ALTER TABLE "BirthdayPage" ADD COLUMN IF NOT EXISTS "reminderOptOutAt" TIMESTAMP(3);

ALTER TABLE "PremiumOrder" ADD COLUMN IF NOT EXISTS "receiptSentAt" TIMESTAMP(3);
