#!/usr/bin/env node
/**
 * One-command QA runner.
 *
 *   npm run qa                 # full suite
 *   npm run qa:smoke           # @smoke subset
 *   npm run qa:ui              # Playwright UI mode
 *   npm run qa:setup           # DB + Prisma only, no tests
 *
 * Steps: start Docker Postgres -> generate Prisma client -> Playwright.
 * Schema push + table wipe happen in qa/global-setup.js so a direct
 * `npx playwright test` also works after the database is running.
 */

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { repoRoot, processEnv, assertLocalDatabase, DB_URL } = require('./env');

const passthrough = process.argv.slice(2);
const setupOnly = passthrough.includes('--setup-only');
const args = passthrough.filter((a) => a !== '--setup-only');

function run(command, commandArgs, { env = processEnv(), allowFailure = false } = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    env,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }
  if (!allowFailure && result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  return result.status;
}

function npxBin() {
  return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

function ensureDocker() {
  if (process.env.QA_SKIP_DOCKER === '1') {
    console.log('QA_SKIP_DOCKER=1 — assuming a database is already reachable.');
    return;
  }

  const info = spawnSync('docker', ['info'], { stdio: 'ignore' });
  if (info.error || info.status !== 0) {
    console.error(
      '\nDocker is not running (or not installed).\n' +
        'Start Docker Desktop, then re-run: npm run qa\n' +
        'Or point QA_DATABASE_URL at a local Postgres and set QA_SKIP_DOCKER=1.\n'
    );
    process.exit(1);
  }

  console.log('\n▶ Starting QA Postgres (Docker, 127.0.0.1:5433)...');
  run('docker', [
    'compose',
    '-f',
    path.join('qa', 'docker-compose.yml'),
    'up',
    '-d',
    '--wait',
    '--wait-timeout',
    '120',
  ]);
}

function main() {
  assertLocalDatabase(DB_URL);
  console.log(`\nQA database: ${DB_URL.replace(/:\/\/[^@]+@/, '://***@')}`);
  console.log('QA site:     http://127.0.0.1:3100\n');

  ensureDocker();

  console.log('▶ Generating Prisma client for local Postgres...');
  run(npxBin(), ['prisma', 'generate']);

  if (setupOnly) {
    console.log('▶ Pushing schema and wiping QA tables...');
    run(npxBin(), ['prisma', 'db', 'push', '--skip-generate']);
    console.log('\nQA database is ready. Run: npm run qa:test\n');
    return;
  }

  console.log('▶ Running Playwright...\n');
  const status = run(npxBin(), ['playwright', 'test', ...args], { allowFailure: true });
  process.exit(status ?? 1);
}

main();
