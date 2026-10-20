/**
 * Playwright global setup: make the local QA database match prisma/schema.prisma
 * and start every run from a clean slate.
 *
 * This refuses to touch anything that is not localhost unless QA_ALLOW_REMOTE=1
 * (intended only for a dedicated hosted QA database).
 */

const { execFileSync } = require('node:child_process');
const { repoRoot, processEnv, assertLocalDatabase, DB_URL } = require('./env');

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

module.exports = async function globalSetup() {
  assertLocalDatabase(DB_URL);
  const env = processEnv();

  console.log('\n[qa] Preparing schema...');
  execFileSync(npx, ['prisma', 'generate'], { cwd: repoRoot, env, stdio: 'inherit' });
  execFileSync(
    npx,
    ['prisma', 'db', 'push', '--skip-generate', '--accept-data-loss'],
    { cwd: repoRoot, env, stdio: 'inherit' }
  );

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

  try {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "BirthdayPage", "Photo", "ShareEvent", "SupportEvent", "PremiumOrder" RESTART IDENTITY CASCADE;'
    );
    console.log('[qa] Database wiped. Starting tests with an empty QA dataset.\n');
  } finally {
    await prisma.$disconnect();
  }
};
