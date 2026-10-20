const { test, expect } = require('../qa/fixtures/test');
const { PHOTO_URL } = require('../qa/helpers/api');
const { waitForHydration } = require('../qa/helpers/ui');
const { BASE_URL } = require('../qa/env');

test.describe('recipient card experience', () => {
  test('gift reveal, candles, love dedupe, photos, views @critical @mobile', async ({
    page,
    cards,
    db,
    pageErrors,
  }) => {
    const card = await cards.create({
      photos: [PHOTO_URL, PHOTO_URL, PHOTO_URL, PHOTO_URL],
      message: 'A QA message from the card experience suite.',
    });

    await page.goto(`/b/${card.id}`, { waitUntil: 'domcontentloaded' });

    // First view is recorded once per browser session.
    await expect
      .poll(
        async () => (await db.birthdayPage.findUnique({ where: { id: card.id } }))?.viewCount,
        { timeout: 12_000 }
      )
      .toBe(1);

    // Non-owner sees the gift gate, never the creator tools.
    await expect(page.getByRole('button', { name: `Open birthday surprise for ${card.payload.recipientName}` })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Creator view notice' })).toHaveCount(0);

    await page.getByRole('button', { name: `Open birthday surprise for ${card.payload.recipientName}` }).click();
    await expect(page.getByRole('heading', { name: 'Happy Birthday', exact: true })).toBeVisible();
    await expect(page.getByText(card.payload.message)).toBeVisible();

    // Free cards cap the visible gallery at 3 photos, even when 4 were saved.
    const gallery = page.getByRole('region', { name: 'Photo Memories' });
    await expect(gallery).toBeVisible();
    await expect(gallery.getByRole('button', { name: /View photo memory/ })).toHaveCount(3);

    // Candle interaction: mic path opens, then the deterministic tap fallback.
    await page
      .getByRole('button', { name: 'Enable microphone to blow out virtual birthday candles' })
      .click();
    await expect(page.getByText('Blow into your microphone!')).toBeVisible();
    // The deterministic tap fallback also stops listening. Dispatch directly:
    // the button unmounts as soon as the candles go out, which can make a
    // normal click report "element detached" even though the action succeeded.
    // The fake mic can also auto-blow first, so a missing fallback is fine.
    await page
      .getByRole('button', { name: /Or tap here to blow them out/ })
      .dispatchEvent('click', {}, { timeout: 5_000 })
      .catch(() => {});
    await expect(page.getByText(/Yay! Wish made!/)).toBeVisible({ timeout: 30_000 });

    // Love: every tap animates, the first tap per session is persisted.
    const loveButton = page.getByRole('button', { name: 'Send love to this birthday page' });
    await loveButton.click();
    await expect
      .poll(
        async () => (await db.birthdayPage.findUnique({ where: { id: card.id } }))?.loves,
        { timeout: 12_000 }
      )
      .toBe(1);
    await expect(loveButton).toHaveText(/Send love • 1/);

    await loveButton.click();
    await page.waitForTimeout(500);
    const afterSecondTap = await db.birthdayPage.findUnique({ where: { id: card.id } });
    expect(afterSecondTap.loves).toBe(1);

    // Reload: sessionStorage keeps both the view and the love deduped.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: `Open birthday surprise for ${card.payload.recipientName}` }).click();
    const reloadedLove = page.getByRole('button', { name: 'Send love to this birthday page' });
    await expect(reloadedLove).toHaveText(/Send love • 1/);
    await reloadedLove.click();
    await page.waitForTimeout(500);
    const afterReload = await db.birthdayPage.findUnique({ where: { id: card.id } });
    expect(afterReload.loves).toBe(1);
    expect(afterReload.viewCount).toBe(1);

    expect(pageErrors).toEqual([]);
  });

  test('preview mode pauses views and reactions @smoke', async ({
    browser,
    cards,
    db,
  }) => {
    const card = await cards.create({ photos: [PHOTO_URL] });
    const context = await browser.newContext({ baseURL: BASE_URL });
    const previewPage = await context.newPage();
    const previewErrors = [];
    previewPage.on('pageerror', (error) => {
      previewErrors.push(error.message);
    });

    try {
      await previewPage.goto(`/b/${card.id}?preview=1`, {
        waitUntil: 'domcontentloaded',
      });
      await waitForHydration(previewPage);

      await expect(
        previewPage.getByText(/Preview mode: views & reactions are paused/i)
      ).toBeVisible();
      await previewPage
        .getByRole('button', { name: `Open birthday surprise for ${card.payload.recipientName}` })
        .click();
      await previewPage
        .getByRole('button', { name: /Be the first to send love|Send love/ })
        .click();
      await previewPage.waitForTimeout(700);

      const afterPreview = await db.birthdayPage.findUnique({ where: { id: card.id } });
      expect(afterPreview.viewCount).toBe(0);
      expect(afterPreview.loves).toBe(0);
      expect(await db.shareEvent.count({ where: { pageId: card.id } })).toBe(0);
      expect(previewErrors).toEqual([]);
    } finally {
      await context.close();
    }
  });

  test('owner sees creator tools that viewers never see @critical', async ({
    page,
    cards,
  }) => {
    const card = await cards.create();

    await page.addInitScript((key) => {
      localStorage.setItem(key, '1');
    }, `bgen_owner_${card.id}`);

    await page.goto(`/b/${card.id}`, { waitUntil: 'domcontentloaded' });

    const notice = page.getByRole('region', { name: 'Creator view notice' });
    await expect(notice).toBeVisible();
    await expect(notice.getByText(/Creator Mode/)).toBeVisible();
    await expect(notice.getByRole('button', { name: /Upgrade to VIP/ })).toBeVisible();
    await expect(page.getByText(new RegExp(`Copy Link for ${card.payload.recipientName}`))).toBeVisible();
  });
});
