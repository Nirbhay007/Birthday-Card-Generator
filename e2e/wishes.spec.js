const { test, expect } = require('../qa/fixtures/test');

function isoDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

test.describe('wish-to-card funnel', () => {
  test('a wish prefills the creator and preserves the source @smoke', async ({
    page,
    cards,
  }) => {
    await page.goto('/wishes/best-friend', { waitUntil: 'domcontentloaded' });

    const firstUse = page.getByRole('link', { name: /Use In Card/i }).first();
    await expect(firstUse).toBeVisible();
    await firstUse.click();

    await page.waitForURL(/\?wish=.*from=wishes(%2F|\/)best-friend/);
    await expect(page.getByText(/Selected wish loaded into your card/i)).toBeVisible();

    // Step 1 is prefilled with the relationship from the wish page.
    await expect(
      page
        .getByRole('radiogroup', { name: 'Relationship' })
        .getByRole('radio', { name: 'Best Friend', exact: true })
    ).toHaveAttribute('aria-checked', 'true');

    const recipient = `QA Wish ${Date.now().toString(36)}`;
    await page.locator('#recipientName').fill(recipient);
    await page.locator('#birthdayDate').fill(isoDate(5));
    await page.locator('#senderName').fill('QA Wish Bot');
    await page.getByRole('button', { name: /^Continue/ }).click();

    // Step 2 carries the wish text and theme selected on the wish page.
    await expect(page.locator('#message')).toBeVisible();
    const wishText = await page.locator('#message').inputValue();
    expect(wishText.length).toBeGreaterThan(10);
    await expect(
      page.getByRole('radio', { name: /Fun & Colorful/ })
    ).toHaveAttribute('aria-checked', 'true');

    await page.getByRole('button', { name: /^Continue/ }).click();
    await page.waitForTimeout(950);
    await page.getByRole('button', { name: /Generate Free Birthday Page/ }).click();

    await page.waitForURL(/\/b\/[a-z0-9]+\?created=1/, { timeout: 45_000 });
    const id = new URL(page.url()).pathname.split('/').pop();
    cards.track(id);

    const card = await cards.get(id);
    expect(card.recipientName).toBe(recipient);
    expect(card.message).toBe(wishText);
    expect(card.relationship).toBe('Best Friend');
    expect(card.theme).toBe('fun');
    expect(card.source).toBe('wishes/best-friend');
  });
});
