const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { test, expect } = require('../qa/fixtures/test');
const { DB_URL, repoRoot } = require('../qa/env');

function runAnalyticsJson() {
  const output = execFileSync(
    process.execPath,
    [path.join('scripts', 'analytics.js'), '--json', '--days', '1'],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        PRISMA_DATABASE_URL: DB_URL,
        POSTGRES_URL: DB_URL,
      },
      encoding: 'utf8',
      timeout: 60_000,
    }
  );
  return JSON.parse(output);
}

test.describe('analytics', () => {
  test('CLI reports event-time shares, channel/source rows, and the legacy counter @critical', async ({
    request,
    cards,
    ip,
  }) => {
    const headers = { 'x-forwarded-for': ip };
    const card = await cards.create();
    const url = `/api/birthday/${card.id}/react`;

    await request.post(url, {
      headers,
      data: {
        type: 'share',
        channel: 'whatsapp',
        source: 'post_creation',
        sessionId: 'qa-analytics-session-a',
      },
    });
    await request.post(url, {
      headers,
      data: {
        type: 'share',
        channel: 'copy',
        source: 'post_creation',
        sessionId: 'qa-analytics-session-a',
      },
    });

    const report = runAnalyticsJson();

    expect(report.shareEvents).toBeTruthy();
    expect(Array.isArray(report.shareEvents.daily)).toBe(true);
    expect(Array.isArray(report.shareEvents.byChannel)).toBe(true);

    const whatsapp = report.shareEvents.byChannel.find(
      (row) => row.channel === 'whatsapp' && row.source === 'post_creation'
    );
    const copy = report.shareEvents.byChannel.find(
      (row) => row.channel === 'copy' && row.source === 'post_creation'
    );
    expect(whatsapp).toBeTruthy();
    expect(copy).toBeTruthy();
    expect(whatsapp.shares).toBeGreaterThanOrEqual(1);
    expect(copy.shares).toBeGreaterThanOrEqual(1);

    const today = report.shareEvents.daily[0];
    expect(today).toBeTruthy();
    expect(today.shares).toBeGreaterThanOrEqual(2);

    // Legacy counter is not used for the channel table, but must still be
    // reported for reconciliation.
    expect(report.legacyShareCounter).toBeGreaterThanOrEqual(2);
    expect(report.generatedAt).toBeTruthy();
  });
});
