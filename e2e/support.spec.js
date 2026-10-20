const { test, expect } = require('../qa/fixtures/test');

test.describe('support funnel', () => {
  test('opens the support modal, records intent, and copies UPI @smoke', async ({
    page,
    db,
  }) => {
    const startedAt = new Date();

    // Hermetic: the QR image is cosmetic and normally comes from an external
    // QR service. Serve a tiny local PNG instead of hitting the network.
    await page.route('https://api.qrserver.com/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=',
          'base64'
        ),
      })
    );

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /chip in to keep it free/i }).click();

    const dialog = page.getByRole('dialog', { name: /Support BirthdayGen/i });
    await expect(dialog).toBeVisible();

    await expect
      .poll(
        () =>
          db.supportEvent.count({
            where: { event: 'modal_open', createdAt: { gte: startedAt } },
          }),
        { timeout: 12_000 }
      )
      .toBeGreaterThan(0);

    await dialog.getByRole('radio', { name: /249/ }).first().click();

    // UPI links use a custom protocol; prevent the navigation while still
    // firing React's click handler (which records pay_click).
    const pay = dialog.getByRole('link', { name: /Pay ₹249 via UPI/i }).first();
    await pay.evaluate((a) => {
      a.addEventListener('click', (e) => e.preventDefault());
    });
    await pay.click();

    await expect
      .poll(
        () =>
          db.supportEvent.count({
            where: {
              event: 'pay_click',
              amount: 249,
              createdAt: { gte: startedAt },
            },
          }),
        { timeout: 12_000 }
      )
      .toBe(1);

    await dialog.getByRole('button', { name: 'Copy UPI ID' }).click();
    await expect(dialog.getByRole('button', { name: 'UPI ID copied' })).toBeVisible();

    await expect
      .poll(
        () =>
          db.supportEvent.count({
            where: { event: 'copy_upi', createdAt: { gte: startedAt } },
          }),
        { timeout: 12_000 }
      )
      .toBeGreaterThan(0);

    await db.supportEvent.deleteMany({ where: { createdAt: { gte: startedAt } } });
  });
});
