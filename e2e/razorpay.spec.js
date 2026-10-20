const crypto = require('node:crypto');
const { test, expect } = require('../qa/fixtures/test');
const {
  RAZORPAY_ENABLED,
  RAZORPAY_TEST_KEY_ID,
  RAZORPAY_TEST_KEY_SECRET,
} = require('../qa/env');

/**
 * Real Razorpay test-mode integration.
 *
 * `npm run qa` includes this spec automatically when a test key pair
 * (rzp_test_...) is available in the gitignored .env or explicit
 * QA_RAZORPAY_* env. Without a test pair the file is ignored. Run just this
 * flow with:
 *
 *   npm run qa:razorpay
 *
 * It creates real test-mode orders (no money moves), opens Razorpay's hosted
 * checkout and asserts the payment UI rendered, then verifies the exact
 * server-side HMAC signature path end to end (paid order, card VIP, magic
 * link). The final card/UPI entry inside Razorpay's hosted modal is a manual
 * step; this spec proves everything around it.
 */
test.describe('Razorpay test-mode integration', () => {
  test('creates test orders, renders hosted checkout, and verifies a signed payment', async ({
    page,
    request,
    db,
    cards,
    ip,
    pageErrors,
  }) => {
    test.skip(
      !RAZORPAY_ENABLED,
      'Add a Razorpay test key pair (rzp_test_...) to .env or QA_RAZORPAY_* to run.'
    );
    test.setTimeout(180_000);

    const keyId = RAZORPAY_TEST_KEY_ID;
    const keySecret = RAZORPAY_TEST_KEY_SECRET;
    expect(keyId).toMatch(/^rzp_test_/);
    expect(keySecret.length).toBeGreaterThan(10);

    const headers = { 'x-forwarded-for': ip };
    // Create the card before opening the hosted checkout so the heavy
    // cross-origin iframe cannot race a cold /api/birthday compile.
    const card = await cards.create();

    // 1. Server creates a real Razorpay test order with the server-fixed price.
    const universeRes = await request.post('/api/premium/order', {
      headers,
      data: { region: 'IN', tier: 'universe' },
    });
    expect(universeRes.status()).toBe(200);
    const universe = await universeRes.json();
    expect(universe.success).toBe(true);
    expect(universe.orderId).toMatch(/^order_/);
    expect(universe.amount).toBe(4900);
    expect(universe.currency).toBe('INR');
    expect(universe.keyId).toBe(keyId);
    expect(universe.pollToken).toMatch(/^[0-9a-f]{64}$/);

    // 2. The browser opens Razorpay's real hosted checkout with that order and
    // renders the actual payment UI, not just an empty cross-origin shell.
    await page.goto('/premium?to=QA%20Razorpay&from=QA%20Bot&occasion=birthday', {
      waitUntil: 'domcontentloaded',
    });
    const unlock = page.getByRole('button', { name: /Unlock everything for/ }).first();
    await expect(unlock).toBeVisible();
    await unlock.click();

    const checkoutSelector = 'iframe[src*="api.razorpay.com/v1/checkout/public"]';
    const checkoutFrame = page.locator(checkoutSelector).first();
    await expect(checkoutFrame).toBeVisible({ timeout: 60_000 });

    const checkout = page.frameLocator(checkoutSelector).first();
    await expect(
      checkout.getByText('Payment Options', { exact: true }).first()
    ).toBeVisible({ timeout: 60_000 });
    await expect(checkout.getByText('Contact details', { exact: true })).toBeVisible();
    await expect(checkout.getByText('UPI', { exact: true }).first()).toBeVisible();

    // The UI-created order is persisted before the modal opens; keep its id so
    // the test can clean up after itself.
    const pending = JSON.parse(
      (await page.evaluate(() => localStorage.getItem('bgen-premium-pending-v1'))) || 'null'
    );
    expect(pending?.orderId).toMatch(/^order_/);
    const browserOrder = await db.premiumOrder.findUnique({
      where: { orderId: pending.orderId },
    });
    expect(browserOrder?.amount).toBe(4900);
    expect(browserOrder?.currency).toBe('INR');
    expect(browserOrder?.status).toBe('created');

    // Close the hosted checkout before the next server round-trips; the UI
    // assertions above are done and the iframe is heavy under a cold dev server.
    await page.goto('about:blank');

    // 3. Create a card-VIP test order and complete the server-side signature
    // path with a deterministic test payment. This is the same HMAC check the
    // Razorpay handler triggers after a real hosted payment succeeds.
    const orderRes = await request.post('/api/premium/order', {
      headers,
      data: { region: 'IN', tier: 'card_vip', pageId: card.id },
    });
    expect(orderRes.status()).toBe(200);
    const order = await orderRes.json();
    expect(order.orderId).toMatch(/^order_/);
    expect(order.amount).toBe(2900);
    expect(order.currency).toBe('INR');

    const paymentId = `pay_${crypto.randomBytes(7).toString('hex')}`;
    const signature = crypto
      .createHmac('sha256', keySecret)
      .update(`${order.orderId}|${paymentId}`)
      .digest('hex');

    const verifyRes = await request.post('/api/premium/verify', {
      headers,
      data: {
        provider: 'razorpay',
        orderId: order.orderId,
        paymentId,
        signature,
        pageId: card.id,
      },
    });
    expect(verifyRes.status()).toBe(200);
    const verified = await verifyRes.json();
    expect(verified.success).toBe(true);
    expect(verified.testMode).toBe(false);
    expect(verified.isVip).toBe(true);
    expect(verified.unlockKey).toMatch(/^unlock_[0-9a-f]{48}$/);

    const paidOrder = await db.premiumOrder.findUnique({
      where: { orderId: order.orderId },
    });
    expect(paidOrder?.status).toBe('paid');
    expect(paidOrder?.paymentId).toBe(paymentId);
    expect(paidOrder?.unlockToken).toBe(verified.unlockKey);

    const vipCard = await cards.get(card.id);
    expect(vipCard.isVip).toBe(true);
    expect(vipCard.isVipPro).toBe(true);

    // 4. The minted magic link unlocks the premium studio without a paywall.
    await page.goto(
      `/premium?to=QA%20Magic&from=QA%20Bot&occasion=birthday&key=${verified.unlockKey}`,
      { waitUntil: 'domcontentloaded' }
    );
    await expect(page.getByRole('button', { name: /Unlock everything for/ })).toHaveCount(0);
    await expect(page.getByText(/That link did not unlock anything/i)).toHaveCount(0);

    expect(pageErrors).toEqual([]);

    await db.premiumOrder.deleteMany({
      where: {
        orderId: { in: [universe.orderId, order.orderId, pending.orderId] },
      },
    });
  });
});
