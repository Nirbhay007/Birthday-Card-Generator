const { test, expect } = require('../qa/fixtures/test');
const { BASE_URL } = require('../qa/env');

// 1x1 transparent PNG. Real enough for the client-side compressor and gallery.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=',
  'base64'
);

function isoDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

async function startFresh(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
}

async function mockUploads(page) {
  let uploadCount = 0;
  await page.route('**/api/upload', async (route) => {
    uploadCount += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        url: `${BASE_URL}/sample-memory.jpg?qa-upload=${uploadCount}`,
        name: `qa-${uploadCount}.png`,
        size: PNG.length,
        kind: 'photo',
        provider: 'qa-mock',
      }),
    });
  });
  return () => uploadCount;
}

test.describe('photo upload', () => {
  test('uploads photos through the real form UI and renders them on the card @critical', async ({
    page,
    cards,
    pageErrors,
  }) => {
    const suffix = Date.now().toString(36);
    const recipient = `QA Photos ${suffix}`;
    const getUploadCount = await mockUploads(page);

    await startFresh(page);

    // Step 1
    await page.locator('#recipientName').fill(recipient);
    await page.locator('#birthdayDate').fill(isoDate(10));
    await page.locator('#age').fill('30');
    await page.locator('#senderName').fill('QA Photo Bot');
    await page.getByRole('button', { name: /^Continue/ }).click();

    // Step 2
    await expect(page.locator('#message')).toBeVisible();
    await page.locator('#message').fill('A photo-filled QA message.');
    await page.getByRole('radio', { name: /Classic Ivory/ }).click();
    await page.getByRole('radio', { name: /No Music/ }).click();
    await page.getByRole('button', { name: /^Continue/ }).click();

    // Step 3 — add four photos, confirm the free-tier warning, keep two.
    await expect(page.getByText(/Add favorite photos/i)).toBeVisible();
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles([
      { name: 'qa-1.png', mimeType: 'image/png', buffer: PNG },
      { name: 'qa-2.png', mimeType: 'image/png', buffer: PNG },
      { name: 'qa-3.png', mimeType: 'image/png', buffer: PNG },
      { name: 'qa-4.png', mimeType: 'image/png', buffer: PNG },
    ]);

    await expect(page.getByAltText('Upload 4')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Photos 4 to 12 unlock with VIP/i)).toBeVisible();

    await page.getByRole('button', { name: 'Remove photo 4' }).click();
    await page.getByRole('button', { name: 'Remove photo 3' }).click();
    await expect(page.getByAltText('Upload 2')).toBeVisible();
    await expect(page.getByAltText('Upload 3')).toHaveCount(0);

    await page.waitForTimeout(950);
    await page.getByRole('button', { name: /Generate Free Birthday Page/ }).click();

    await page.waitForURL(/\/b\/[a-z0-9]+\?created=1/, { timeout: 45_000 });
    const id = new URL(page.url()).pathname.split('/').pop();
    cards.track(id);

    const dialog = page.getByRole('dialog', { name: /Surprise is Ready/i });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Close' }).click();

    // Two uploads were performed at submit time, not on file selection.
    expect(getUploadCount()).toBe(2);

    const card = await cards.get(id);
    expect(card.photos).toHaveLength(2);
    expect(card.photos.every((p) => p.url.includes('/sample-memory.jpg'))).toBe(true);

    // The gallery lives inside the opened experience, not on the gift gate.
    await page
      .getByRole('button', { name: `Open birthday surprise for ${recipient}` })
      .click();
    await expect(page.getByRole('heading', { name: 'Happy Birthday', exact: true })).toBeVisible();

    const gallery = page.getByRole('region', { name: 'Photo Memories' });
    await expect(gallery).toBeVisible();
    await expect(gallery.getByRole('button', { name: /View photo memory/ })).toHaveCount(2);
    await expect(gallery.getByAltText('Birthday memory photo 1')).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('upload API rejects missing, unsupported, and oversized files @smoke', async ({
    request,
    ip,
  }) => {
    const headers = { 'x-forwarded-for': ip };

    const missing = await request.post('/api/upload', {
      headers,
      multipart: {},
    });
    expect(missing.status()).toBe(400);
    expect((await missing.json()).error).toMatch(/No file provided/i);

    const unsupported = await request.post('/api/upload', {
      headers,
      multipart: {
        file: {
          name: 'notes.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('not a photo'),
        },
      },
    });
    expect(unsupported.status()).toBe(400);
    expect((await unsupported.json()).error).toMatch(/Unsupported file format/i);

    const oversized = await request.post('/api/upload', {
      headers,
      multipart: {
        file: {
          name: 'too-big.png',
          mimeType: 'image/png',
          buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
        },
      },
    });
    expect(oversized.status()).toBe(400);
    expect((await oversized.json()).error).toMatch(/too large/i);
  });
});
