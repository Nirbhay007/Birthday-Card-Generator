const { defineConfig, devices } = require('@playwright/test');
const {
  BASE_URL,
  DB_URL,
  STATS_TOKEN,
  RAZORPAY_ENABLED,
  serverEnv,
} = require('./qa/env');

// Test workers and helper scripts connect to the QA database. Explicit values
// here win over the developer's .env (which points at production).
process.env.PRISMA_DATABASE_URL = DB_URL;
process.env.POSTGRES_URL = DB_URL;
process.env.STATS_TOKEN = STATS_TOKEN;

module.exports = defineConfig({
  testDir: './e2e',
  // Run the real Razorpay test-mode spec whenever a test key pair is available
  // (auto-loaded from .env). Use QA_ALLOW_RAZORPAY=0 for a keyless/offline run.
  testIgnore: RAZORPAY_ENABLED ? [] : ['**/razorpay.spec.js'],
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // Next dev compiles routes on demand; a cold run with 4 workers can queue
  // compiles behind each other. Two workers stays comfortably parallel while
  // keeping first-run compiles and Postgres connections bounded.
  workers: 2,
  timeout: 150_000,
  expect: {
    timeout: 12_000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  globalSetup: require.resolve('./qa/global-setup.js'),
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    reducedMotion: 'reduce',
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    actionTimeout: 60_000,
    navigationTimeout: 90_000,
    permissions: ['clipboard-read', 'clipboard-write', 'microphone'],
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        },
      },
      grepInvert: /@mobile-only/,
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        },
      },
      grep: /@mobile/,
    },
  ],
  webServer: {
    command: 'npx next dev --port 3100 --hostname 127.0.0.1',
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 240_000,
    env: serverEnv(),
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
