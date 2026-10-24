const { test, expect } = require('../qa/fixtures/test');
const { PHOTO_URL } = require('../qa/helpers/api');
const { RAZORPAY_ENABLED } = require('../qa/env');

/**
 * When QA has a Razorpay test pair, the server creates real orders. The two
 * test-mode UI tests below still need the unconfigured branch, so mock the
 * order endpoint just for those pages. The real keyed order/checkout path is
 * covered by e2e/razorpay.spec.js.
 */
async function mockUnconfiguredCheckout(page) {
  if (!RAZORPAY_ENABLED) return;
  await page.route('**/api/premium/order', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        testMode: true,
        error:
          'Live payments are not connected yet (missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).',
      }),
    })
  );
}

test.describe('VIP and premium payments', () => {
  test('card VIP test-mode checkout unlocks the card and the customizer saves @critical', async ({
    page,
    cards,
    db,
    pageErrors,
  }) => {
    const card = await cards.create({
      photos: [PHOTO_URL, PHOTO_URL, PHOTO_URL, PHOTO_URL],
      theme: 'elegant',
      music: 'classic',
    });

    // The creator's browser is the only place the edit token is stored.
    await page.addInitScript(
      ({ id, token }) => {
        localStorage.setItem(`bgen_owner_${id}`, '1');
        localStorage.setItem(`bgen_edit_token_${id}`, token);
      },
      { id: card.id, token: card.editToken }
    );

    await mockUnconfiguredCheckout(page);
    await page.goto(`/b/${card.id}?created=1`, { waitUntil: 'domcontentloaded' });
    const dialog = page.getByRole('dialog', { name: /Surprise is Ready/i });
    await expect(dialog).toBeVisible();

    // Unconfigured checkout returns testMode, and the client activates VIP via
    // the provider:'test' branch.
    await dialog.getByRole('button', { name: /Upgrade to VIP/ }).click();
    await expect(dialog.getByText('VIP Activated Successfully!')).toBeVisible({
      timeout: 30_000,
    });

    const afterUpgrade = await db.birthdayPage.findUnique({ where: { id: card.id } });
    expect(afterUpgrade.isVip).toBe(true);
    expect(afterUpgrade.isVipPro).toBe(true);

    // Closing the modal navigates to the freshly unlocked card.
    await dialog.getByRole('button', { name: 'Close' }).click();
    await page.waitForURL(new RegExp(`/b/${card.id}\\?vip=1`), { timeout: 30_000 });

    await expect(page.getByText('VIP Birthday Surprise').first()).toBeVisible();

    // VIP raises the free 3-photo cap: all 4 memories are now visible.
    await page
      .getByRole('button', { name: `Open birthday surprise for ${card.payload.recipientName}` })
      .click();
    const gallery = page.getByRole('region', { name: 'Photo Memories' });
    await expect(gallery.getByRole('button', { name: /View photo memory/ })).toHaveCount(4);

    // Owner-only customizer: save a VIP theme and soundtrack.
    await page.getByRole('button', { name: 'Customize', exact: true }).click();
    const customizer = page.getByRole('dialog', { name: /Customize VIP Look & Sound/i });
    await expect(customizer).toBeVisible();

    await customizer.getByRole('button', { name: /Royal Gold/ }).click();
    await customizer.getByText('Starlight Music Box').click();
    await customizer.getByRole('button', { name: /Apply & Save to Card/ }).click();

    await expect
      .poll(
        async () => {
          const updated = await db.birthdayPage.findUnique({ where: { id: card.id } });
          return `${updated?.theme}:${updated?.music}`;
        },
        { timeout: 20_000 }
      )
      .toBe('royal:musicbox');

    expect(pageErrors).toEqual([]);
  });

  test('premium universe checkout falls back to test mode and unlocks the studio @critical', async ({
    page,
    pageErrors,
  }) => {
    await mockUnconfiguredCheckout(page);
    await page.goto('/premium?to=QA%20Aisha&from=QA%20Bot&occasion=birthday', {
      waitUntil: 'domcontentloaded',
    });

    const unlockCta = page.getByRole('button', { name: /Unlock everything for/ }).first();
    await expect(unlockCta).toBeVisible();
    await unlockCta.click();

    const simulate = page.getByRole('button', {
      name: /Live payments are not connected yet\. Simulate success/i,
    });
    await expect(simulate).toBeVisible({ timeout: 20_000 });
    await simulate.click();

    // The paywall disappears and the studio reports the unlocked state.
    await expect(unlockCta).toHaveCount(0, { timeout: 20_000 });
    await expect(page.getByText(/Card unlocked — all updates sync live/i)).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('a paid magic link unlocks the premium universe @critical', async ({
    page,
    cards,
  }) => {
    const order = await cards.createPaidPremiumOrder();

    await page.goto(
      `/premium?to=QA%20Magic&from=QA%20Bot&occasion=birthday&key=${order.token}`,
      { waitUntil: 'domcontentloaded' }
    );

    // giftMode hides the paywall immediately; the background key check proves
    // the paid token and remembers it on the device.
    await expect(page.getByRole('button', { name: /Unlock everything for/ })).toHaveCount(0);
    await expect(page.getByText(/That link did not unlock anything/i)).toHaveCount(0);

    await expect
      .poll(
        () =>
          page.evaluate(() => {
            try {
              return JSON.parse(localStorage.getItem('bgen-premium-keys-v1') || '[]');
            } catch {
              return [];
            }
          }),
        { timeout: 20_000 }
      )
      .toContain(order.token);
  });

  test('payment APIs fail safe when unconfigured or forged @smoke', async ({
    request,
    cards,
    ip,
  }) => {
    const headers = { 'x-forwarded-for': ip };

    if (RAZORPAY_ENABLED) {
      // With test keys configured the order path is real (covered in
      // razorpay.spec.js); a forged signature must still be rejected.
      const forged = await request.post('/api/premium/verify', {
        headers,
        data: {
          provider: 'razorpay',
          orderId: 'order_qa',
          paymentId: 'pay_qa',
          signature: 'deadbeef',
        },
      });
      expect(forged.status()).toBe(402);
    } else {
      const order = await request.post('/api/premium/order', {
        headers,
        data: { region: 'IN', tier: 'universe' },
      });
      expect(order.status()).toBe(503);
      expect((await order.json()).testMode).toBe(true);

      const fakeSignature = await request.post('/api/premium/verify', {
        headers,
        data: {
          provider: 'razorpay',
          orderId: 'order_qa',
          paymentId: 'pay_qa',
          signature: 'deadbeef',
        },
      });
      expect(fakeSignature.status()).toBe(503);
    }

    const malformedKey = await request.post('/api/premium/verify', {
      headers,
      data: { provider: 'key', key: 'not-a-real-key' },
    });
    expect(malformedKey.status()).toBe(200);
    expect((await malformedKey.json()).success).toBe(false);

    const paidOrder = await cards.createPaidPremiumOrder();
    const validKey = await request.post('/api/premium/verify', {
      headers,
      data: { provider: 'key', key: paidOrder.token },
    });
    expect(validKey.status()).toBe(200);
    expect((await validKey.json()).success).toBe(true);

    const card = await cards.create();
    const testVerify = await request.post('/api/premium/verify', {
      headers,
      data: { provider: 'test', pageId: card.id },
    });
    expect(testVerify.status()).toBe(200);
    expect((await testVerify.json()).success).toBe(true);
    const unlocked = await cards.get(card.id);
    expect(unlocked.isVip).toBe(true);
    expect(unlocked.isVipPro).toBe(true);
  });

  test('owner sees the proof-moment upsell after real love @critical', async ({
    page,
    cards,
    db,
  }) => {
    const card = await cards.create();
    await db.birthdayPage.update({ where: { id: card.id }, data: { loves: 3 } });

    await page.addInitScript((key) => {
      localStorage.setItem(key, '1');
    }, `bgen_owner_${card.id}`);

    await page.goto(`/b/${card.id}`, { waitUntil: 'domcontentloaded' });
    await page
      .getByRole('button', { name: `Open birthday surprise for ${card.payload.recipientName}` })
      .click();

    const banner = page.getByRole('region', { name: 'VIP upgrade suggestion' });
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/3 people have sent love/);

    await expect
      .poll(
        () =>
          db.supportEvent.count({
            where: { event: 'proof_upsell_shown', path: `/b/${card.id}` },
          }),
        { timeout: 12_000 },
      )
      .toBeGreaterThan(0);

    await banner.getByRole('button', { name: /Make it unforgettable/ }).click();
    await expect(
      page.getByRole('heading', { name: 'Make it Unforgettable with VIP' }),
    ).toBeVisible();
  });

  // Real keyed Razorpay coverage lives in e2e/razorpay.spec.js and is included
  // by `npm run qa` whenever a test pair is configured.
});
