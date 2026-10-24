const { test, expect } = require('../qa/fixtures/test');
const { BASE_URL } = require('../qa/env');

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

test.describe('free card creation', () => {
  test('validates the recipient name @smoke', async ({ page }) => {
    await startFresh(page);

    await page.getByRole('button', { name: /^Continue/ }).click();
    await expect(page.getByText(/Please add their name/i)).toBeVisible();

    await page.locator('#recipientName').fill('QA Validation');
    await expect(page.getByText(/Please add their name/i)).toBeHidden();
  });

  test('creates a card through all three steps and opens the success modal @critical @mobile', async ({
    page,
    cards,
    ip,
    pageErrors,
  }) => {
    const suffix = Date.now().toString(36);
    const recipient = `QA Aanya ${suffix}`;
    const message = `QA final message ${suffix} — you make every day brighter.`;

    await startFresh(page);

    // Step 1 — who
    await page.locator('#recipientName').fill(recipient);
    await page
      .getByRole('radiogroup', { name: 'Relationship' })
      .getByRole('radio', { name: 'Best Friend', exact: true })
      .click();
    await page.locator('#birthdayDate').fill(isoDate(7));
    await page.locator('#age').fill('29');
    await page.locator('#senderName').fill('QA Bot');
    await page.getByRole('button', { name: /^Continue/ }).click();

    // Step 2 — words & style
    await expect(page.locator('#message')).toBeVisible();
    await page.locator('#message').fill('A short warm message.');
    await page.getByRole('button', { name: /Warmer/ }).click();
    await expect(page.getByText(/made it warmer/i)).toBeVisible();
    await page.locator('#message').fill(message);

    await page.getByRole('radio', { name: /Classic Ivory/ }).click();
    await page.getByRole('radio', { name: /No Music/ }).click();
    await page.getByRole('button', { name: /^Continue/ }).click();

    // Step 3 — photos & finish. Entering the step arms Generate after 800 ms.
    await expect(page.getByText(/Add favorite photos/i)).toBeVisible();
    await page.waitForTimeout(950);
    await page.getByRole('button', { name: /Generate Free Birthday Page/ }).click();

    await page.waitForURL(/\/b\/[a-z0-9]+\?created=1/, { timeout: 45_000 });
    const id = new URL(page.url()).pathname.split('/').pop();
    cards.track(id);

    const dialog = page.getByRole('dialog', { name: /Surprise is Ready/i });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(recipient);

    const card = await cards.get(id);
    expect(card).not.toBeNull();
    expect(card.recipientName).toBe(recipient);
    expect(card.senderName).toBe('QA Bot');
    expect(card.relationship).toBe('Best Friend');
    expect(card.age).toBe(29);
    expect(card.theme).toBe('elegant');
    expect(card.music).toBe('off');
    expect(card.message).toBe(message);
    expect(card.editToken).toHaveLength(48);
    expect(card.ipAddress).toBe(ip);
    expect(card.photos).toHaveLength(0);

    // The edit token is stored once in this browser and never rendered.
    const storedToken = await page.evaluate(
      (cardId) => localStorage.getItem(`bgen_edit_token_${cardId}`),
      id
    );
    expect(storedToken).toBe(card.editToken);

    // Clipboard copy from the success modal.
    await dialog.getByRole('button', { name: 'Copy', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Copied' })).toBeVisible();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe(`${BASE_URL}/b/${id}`);

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('region', { name: 'Creator view notice' })).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('first-touch campaign source survives navigation and is sent with the card @smoke', async ({
    page,
    cards,
  }) => {
    await page.goto('/?utm_source=QA-Instagram', { waitUntil: 'domcontentloaded' });

    const stored = await page.evaluate(() => {
      try {
        return JSON.parse(localStorage.getItem('bgen-attribution-v1') || 'null');
      } catch {
        return null;
      }
    });
    expect(stored?.source).toBe('utm:qa-instagram');

    // The campaign query is gone on this load; only the browser-local
    // first-touch value remains, and submitting must still send it.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.locator('#recipientName').fill(`QA Source ${Date.now().toString(36)}`);
    await page.getByRole('button', { name: /^Continue/ }).click();
    await page.getByRole('button', { name: /^Continue/ }).click();
    await page.waitForTimeout(950);
    await page.getByRole('button', { name: /Generate Free Birthday Page/ }).click();

    await page.waitForURL(/\/b\/[a-z0-9]+\?created=1/, { timeout: 45_000 });
    const id = new URL(page.url()).pathname.split('/').pop();
    cards.track(id);

    expect((await cards.get(id)).source).toBe('utm:qa-instagram');
  });
});
