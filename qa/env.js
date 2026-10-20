/**
 * QA environment.
 *
 * Every E2E run is local-only:
 *  - Postgres runs locally in Docker (:5433) and is wiped at the start.
 *  - The Next server runs on :3100 with a separate .next-qa build dir.
 *  - R2 / Resend / Vercel Blob credentials are forced empty, so a test can
 *    never write to live storage or send a real email.
 *  - Razorpay runs only with a *test* key pair (rzp_test_...), auto-detected
 *    from the gitignored .env or explicit QA_RAZORPAY_* env. The default run
 *    includes the real test-mode checkout spec when that pair is present;
 *    set QA_ALLOW_RAZORPAY=0 for a keyless/offline run.
 *
 * The guard below is intentionally loud: running the suite against the
 * production Prisma Postgres (db.prisma.io) would pollute real analytics and
 * create real cards. Local-only is the default.
 */

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

/**
 * Read the local (gitignored) .env files without loading every production
 * secret into the QA process. `.env.local` wins over `.env`, matching Next.
 */
function readLocalEnv() {
  const values = {};
  for (const file of ['.env', '.env.local']) {
    try {
      const contents = fs.readFileSync(path.join(repoRoot, file), 'utf8');
      for (const line of contents.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!match) continue;
        let value = match[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        values[match[1]] = value;
      }
    } catch {
      // Missing local env file is fine; QA remains keyless.
    }
  }
  return values;
}

const LOCAL_ENV = readLocalEnv();

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:3100';
const DB_URL =
  process.env.QA_DATABASE_URL ||
  // Keep the pool small: the Next dev server and several Playwright workers
  // each hold their own Prisma pool, and the Docker default is 100 clients.
  'postgresql://qa:qa@127.0.0.1:5433/birthday_qa?schema=public&connection_limit=5';
const STATS_TOKEN = process.env.QA_STATS_TOKEN || 'qa-stats-token';

// Razorpay test-mode integration is included by default when a test pair is
// available. QA never uses live keys: anything not starting with rzp_test_ is
// ignored for the default run and rejected when QA_ALLOW_RAZORPAY=1 is set.
// Resolution order: explicit QA_* env -> gitignored .env -> shell env.
const RAZORPAY_EXPLICIT = process.env.QA_ALLOW_RAZORPAY === '1';
const RAZORPAY_OFF = process.env.QA_ALLOW_RAZORPAY === '0';

function trim(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function testPair(keyIds, secrets) {
  const id = keyIds.map(trim).find((value) => /^rzp_test_/.test(value)) || '';
  const secret = secrets.map(trim).find(Boolean) || '';
  return id && secret ? { id, secret } : null;
}

const EXPLICIT_RAZORPAY_ID = trim(process.env.QA_RAZORPAY_KEY_ID);
const EXPLICIT_RAZORPAY_LIVE =
  EXPLICIT_RAZORPAY_ID !== '' && !EXPLICIT_RAZORPAY_ID.startsWith('rzp_test_');

const EXPLICIT_PAIR = testPair(
  [process.env.QA_RAZORPAY_KEY_ID],
  [process.env.QA_RAZORPAY_KEY_SECRET]
);
const LOCAL_PAIR = testPair(
  [
    LOCAL_ENV.QA_RAZORPAY_KEY_ID,
    LOCAL_ENV.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    LOCAL_ENV.RAZORPAY_KEY_ID,
  ],
  [LOCAL_ENV.QA_RAZORPAY_KEY_SECRET, LOCAL_ENV.RAZORPAY_KEY_SECRET]
);
const SHELL_PAIR = testPair(
  [process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_ID],
  [process.env.RAZORPAY_KEY_SECRET]
);

const RAZORPAY_PAIR = RAZORPAY_OFF ? null : EXPLICIT_PAIR || LOCAL_PAIR || SHELL_PAIR;
const RAZORPAY_TEST_KEY_ID = RAZORPAY_PAIR?.id || '';
const RAZORPAY_TEST_KEY_SECRET = RAZORPAY_PAIR?.secret || '';
const RAZORPAY_ENABLED = !RAZORPAY_OFF && !!RAZORPAY_PAIR;

function razorpayEnv() {
  if (RAZORPAY_EXPLICIT && EXPLICIT_RAZORPAY_LIVE) {
    throw new Error(
      'QA_RAZORPAY_KEY_ID must be a Razorpay test key (rzp_test_...). ' +
        'Refusing to use live payment keys in QA.'
    );
  }

  if (!RAZORPAY_ENABLED) {
    if (RAZORPAY_EXPLICIT) {
      throw new Error(
        'QA_ALLOW_RAZORPAY=1 requires a Razorpay *test* key pair. ' +
          'Set QA_RAZORPAY_KEY_ID/QA_RAZORPAY_KEY_SECRET or add test keys to .env. ' +
          'Live keys are never used in QA.'
      );
    }
    return {
      RAZORPAY_KEY_ID: '',
      NEXT_PUBLIC_RAZORPAY_KEY_ID: '',
      RAZORPAY_KEY_SECRET: '',
    };
  }

  return {
    RAZORPAY_KEY_ID: RAZORPAY_TEST_KEY_ID,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: RAZORPAY_TEST_KEY_ID,
    RAZORPAY_KEY_SECRET: RAZORPAY_TEST_KEY_SECRET,
  };
}

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);

function databaseHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function assertLocalDatabase(url = DB_URL) {
  const host = databaseHost(url);
  if (!LOCAL_HOSTS.has(host) && process.env.QA_ALLOW_REMOTE !== '1') {
    throw new Error(
      `Refusing to run QA against database host "${host || 'unknown'}".\n` +
        'The E2E suite wipes tables. Use the local Docker database (npm run qa) ' +
        'or set QA_ALLOW_REMOTE=1 only for a dedicated QA database.'
    );
  }
  return url;
}

/**
 * Environment handed to the Next dev server. Live services are forced off;
 * the only external credential allowed through is a resolved Razorpay *test*
 * pair. Explicit empty strings win over the developer's .env file (Next's env
 * loader does not overwrite existing process env keys).
 */
function serverEnv() {
  assertLocalDatabase(DB_URL);

  return {
    ...process.env,
    PRISMA_DATABASE_URL: DB_URL,
    POSTGRES_URL: DB_URL,
    NEXT_PUBLIC_SITE_URL: BASE_URL,
    STATS_TOKEN,
    NEXT_DIST_DIR: '.next-qa',

    // Hard-disable live external services.
    RESEND_API_KEY: '',
    ALERT_FROM_EMAIL: '',
    ALERT_TO_EMAIL: '',
    R2_ACCOUNT_ID: '',
    R2_ACCESS_KEY_ID: '',
    R2_SECRET_ACCESS_KEY: '',
    R2_BUCKET_NAME: '',
    R2_PUBLIC_DOMAIN: '',
    BLOB_READ_WRITE_TOKEN: '',
    ...razorpayEnv(),
    NEXT_PUBLIC_DEMO_VIDEO_URL: '',
  };
}

/** Env for Prisma CLI / the analytics script / worker processes. */
function processEnv() {
  assertLocalDatabase(DB_URL);
  return {
    ...process.env,
    PRISMA_DATABASE_URL: DB_URL,
    POSTGRES_URL: DB_URL,
    STATS_TOKEN,
    // Pass the exact resolved test pair to Playwright. Empty values prevent a
    // stale shell key from re-enabling the flow when QA_ALLOW_RAZORPAY=0.
    QA_RAZORPAY_KEY_ID: RAZORPAY_ENABLED ? RAZORPAY_TEST_KEY_ID : '',
    QA_RAZORPAY_KEY_SECRET: RAZORPAY_ENABLED ? RAZORPAY_TEST_KEY_SECRET : '',
  };
}

let ipCounter = 0;

/** Unique spoofed client IP per worker/test, so rate limits never collide. */
function uniqueIp(testInfo) {
  const worker = (testInfo && testInfo.workerIndex) || 0;
  ipCounter = (ipCounter % 240) + 1;
  return `10.42.${worker % 240}.${ipCounter}`;
}

function uniqueSuffix() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

module.exports = {
  BASE_URL,
  DB_URL,
  STATS_TOKEN,
  RAZORPAY_ENABLED,
  RAZORPAY_TEST_KEY_ID,
  RAZORPAY_TEST_KEY_SECRET,
  assertLocalDatabase,
  serverEnv,
  processEnv,
  uniqueIp,
  uniqueSuffix,
  repoRoot,
};
