const { test, expect } = require('../qa/fixtures/test');
const { BASE_URL, STATS_TOKEN } = require('../qa/env');
const { waitForHydration } = require('../qa/helpers/ui');

async function openGift(page, card) {
  await page.goto(`/b/${card.id}`, { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('button', {
      name: `Open birthday surprise for ${card.payload.recipientName}`,
    })
    .click();
  await expect(page.getByRole('heading', { name: 'Happy Birthday', exact: true })).toBeVisible();
}

async function stubWindowOpen(page) {
  await page.addInitScript(() => {
    window.open = () => null;
  });
}

test.describe('share tracking', () => {
  test('footer shares count once per channel/session and once per new session @critical @mobile', async ({
    page,
    browser,
    cards,
    db,
    request,
    pageErrors,
  }) => {
    const card = await cards.create();
    await stubWindowOpen(page);

    await openGift(page, card);

    // Copy — first click counts.
    await page.getByRole('button', { name: 'Copy page link to clipboard' }).click();
    await expect(page.getByRole('button', { name: 'Link copied to clipboard' })).toBeVisible();
    await cards.waitForShareEvent(card.id, { channel: 'copy', source: 'card_footer' });
    await cards.waitForShares(card.id, 1);

    // Copy again — same channel/session: no new row.
    await page
      .getByRole('button', {
        name: /Copy page link to clipboard|Link copied to clipboard/,
      })
      .click();
    await page.waitForTimeout(600);
    expect(await db.shareEvent.count({ where: { pageId: card.id } })).toBe(1);

    // WhatsApp — different channel: counts.
    await page.getByRole('button', { name: 'Share on WhatsApp' }).click();
    await cards.waitForShareEvent(card.id, { channel: 'whatsapp' });
    await cards.waitForShares(card.id, 2);

    // WhatsApp again — no new row.
    await page.getByRole('button', { name: 'Share on WhatsApp' }).click();
    await page.waitForTimeout(600);
    expect(await db.shareEvent.count({ where: { pageId: card.id } })).toBe(2);

    // Reload: sessionStorage survives, so copy stays deduped; a new channel counts.
    await openGift(page, card);
    await page.getByRole('button', { name: /Copy page link to clipboard|Link copied to clipboard/ }).click();
    await page.waitForTimeout(500);
    expect(await db.shareEvent.count({ where: { pageId: card.id } })).toBe(2);

    await page.getByRole('button', { name: 'Share on Telegram' }).click();
    await cards.waitForShareEvent(card.id, { channel: 'telegram' });
    await cards.waitForShares(card.id, 3);

    // A brand-new browser session is a new share action.
    const secondContext = await browser.newContext({ baseURL: BASE_URL });
    try {
      const secondPage = await secondContext.newPage();
      await secondPage.goto(`/b/${card.id}`, { waitUntil: 'domcontentloaded' });
      await waitForHydration(secondPage);
      await secondPage
        .getByRole('button', {
          name: `Open birthday surprise for ${card.payload.recipientName}`,
        })
        .click();
      await expect(
        secondPage.getByRole('heading', { name: 'Happy Birthday', exact: true })
      ).toBeVisible();
      await secondPage.getByRole('button', { name: 'Share on WhatsApp' }).click();
      await cards.waitForShares(card.id, 4);
    } finally {
      await secondContext.close();
    }

    // Preview never writes.
    const previewContext = await browser.newContext({
      baseURL: BASE_URL,
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    try {
      const previewPage = await previewContext.newPage();
      await previewPage.goto(`/b/${card.id}?preview=1`, {
        waitUntil: 'domcontentloaded',
      });
      await waitForHydration(previewPage);
      await previewPage
        .getByRole('button', {
          name: `Open birthday surprise for ${card.payload.recipientName}`,
        })
        .click();
      await previewPage
        .getByRole('button', { name: /Copy page link to clipboard/ })
        .click();
      await previewPage.waitForTimeout(800);
      expect(await db.shareEvent.count({ where: { pageId: card.id } })).toBe(4);
    } finally {
      await previewContext.close();
    }

    // DB truth: 4 events, 4 distinct channels, every one paired with the counter.
    const events = await cards.shares(card.id);
    expect(events).toHaveLength(4);
    expect(events.map((e) => e.channel).sort()).toEqual([
      'copy',
      'telegram',
      'whatsapp',
      'whatsapp',
    ]);
    const refreshed = await cards.get(card.id);
    expect(refreshed.shares).toBe(4);

    // The authenticated stats endpoint reports event-truth shares and the
    // legacy counter separately (other parallel tests may also have events).
    const statsRes = await request.get(`/api/stats?token=${STATS_TOKEN}`);
    expect(statsRes.status()).toBe(200);
    const stats = await statsRes.json();
    expect(stats.success).toBe(true);
    expect(stats.totals.shares).toBeGreaterThanOrEqual(4);
    expect(stats.totals.legacyShareClicks).toBeGreaterThanOrEqual(4);

    expect(pageErrors).toEqual([]);
  });

  test('post-creation modal tracks its own surface and dedupes against the footer @critical', async ({
    page,
    cards,
    db,
  }) => {
    const card = await cards.create();
    await stubWindowOpen(page);

    await page.goto(`/b/${card.id}?created=1`, { waitUntil: 'domcontentloaded' });
    const dialog = page.getByRole('dialog', { name: /Surprise is Ready/i });
    await expect(dialog).toBeVisible();

    // The modal WhatsApp control is a real external anchor. Neutralise the
    // navigation so the test never opens WhatsApp; the click handler still runs.
    const whatsapp = dialog.getByRole('link', { name: /Share to WhatsApp/ });
    await whatsapp.evaluate((a) => {
      a.removeAttribute('target');
      a.setAttribute('href', '#');
    });
    await whatsapp.click();
    await cards.waitForShareEvent(card.id, {
      channel: 'whatsapp',
      source: 'post_creation',
    });
    await cards.waitForShares(card.id, 1);

    await dialog.getByRole('button', { name: 'Copy', exact: true }).click();
    await cards.waitForShareEvent(card.id, {
      channel: 'copy',
      source: 'post_creation',
    });
    await cards.waitForShares(card.id, 2);

    // Close the modal, then repeat both channels in the card footer. The
    // client-side session guard must suppress both duplicates.
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();

    // Footer share controls live inside the opened experience.
    await page
      .getByRole('button', {
        name: `Open birthday surprise for ${card.payload.recipientName}`,
      })
      .click();
    await expect(page.getByRole('heading', { name: 'Happy Birthday', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Share on WhatsApp' }).click();
    await page.getByRole('button', { name: /Copy page link to clipboard|Link copied to clipboard/ }).click();
    await page.waitForTimeout(800);
    expect(await db.shareEvent.count({ where: { pageId: card.id } })).toBe(2);

    // A different channel is still a distinct share.
    await page.getByRole('button', { name: 'Share on Telegram' }).click();
    await cards.waitForShares(card.id, 3);

    const events = await cards.shares(card.id);
    expect(
      events.map((e) => `${e.channel}:${e.source}`).sort()
    ).toEqual(['copy:post_creation', 'telegram:card_footer', 'whatsapp:post_creation']);
  });

  test('native share sheet is recorded as the native channel @smoke', async ({
    page,
    cards,
    db,
  }) => {
    const card = await cards.create();

    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'share', {
        configurable: true,
        value: async () => {},
      });
    });

    await openGift(page, card);
    await page.getByRole('button', { name: 'Share this birthday page' }).click();
    await cards.waitForShareEvent(card.id, { channel: 'native' });
    await cards.waitForShares(card.id, 1);

    await page.getByRole('button', { name: 'Share this birthday page' }).click();
    await page.waitForTimeout(600);
    expect(await db.shareEvent.count({ where: { pageId: card.id } })).toBe(1);
  });
});
