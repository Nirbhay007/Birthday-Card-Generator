const crypto = require('node:crypto');
const { test, expect } = require('../qa/fixtures/test');
const { RAZORPAY_TEST_KEY_SECRET, uniqueSuffix } = require('../qa/env');

/**
 * The same HMAC the server issues as `pollToken` with /api/premium/order.
 * In keyless QA the secret is an empty string, which is exactly what the
 * server uses too.
 */
function tokenFor(orderId) {
  return crypto
    .createHmac('sha256', RAZORPAY_TEST_KEY_SECRET)
    .update(`poll:${orderId}`)
    .digest('hex');
}

async function seedOrder(db, overrides = {}) {
  const orderId = `qa_fail_${uniqueSuffix()}`;
  await db.premiumOrder.create({
    data: {
      orderId,
      amount: 100,
      currency: 'USD',
      status: 'created',
      tier: 'universe',
      ...overrides,
    },
  });
  return orderId;
}

test.describe('premium failure capture', () => {
  test('requires the per-order token and stores the decline reason', async ({
    request,
    db,
    ip,
  }) => {
    const orderId = await seedOrder(db);

    try {
      const bad = await request.post('/api/premium/failure', {
        headers: { 'x-forwarded-for': ip },
        data: { orderId, token: 'a'.repeat(64), code: 'CARD_DECLINED' },
      });
      expect(bad.status()).toBe(403);

      let row = await db.premiumOrder.findUnique({ where: { orderId } });
      expect(row.status).toBe('created');
      expect(row.failureCode).toBeNull();

      const ok = await request.post('/api/premium/failure', {
        headers: { 'x-forwarded-for': ip },
        data: {
          orderId,
          token: tokenFor(orderId),
          code: 'BAD_REQUEST_ERROR',
          reason: 'Your card was declined by the issuing bank.',
          method: 'card',
        },
      });
      expect(ok.status()).toBe(200);
      expect((await ok.json()).stored).toBe(true);

      row = await db.premiumOrder.findUnique({ where: { orderId } });
      expect(row.status).toBe('failed');
      expect(row.failureCode).toBe('BAD_REQUEST_ERROR');
      expect(row.failureReason).toMatch(/declined/i);
      expect(row.failureMethod).toBe('card');
      expect(row.failedAt).toBeTruthy();
    } finally {
      await db.premiumOrder.deleteMany({ where: { orderId } });
    }
  });

  test('never downgrades a paid order', async ({ request, db, ip }) => {
    const orderId = await seedOrder(db, {
      status: 'paid',
      paidAt: new Date(),
      unlockToken: `unlock_${crypto.randomBytes(24).toString('hex')}`,
    });

    try {
      const res = await request.post('/api/premium/failure', {
        headers: { 'x-forwarded-for': ip },
        data: {
          orderId,
          token: tokenFor(orderId),
          code: 'CARD_DECLINED',
          reason: 'Late failure event after capture.',
          method: 'card',
        },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.stored).toBe(false);
      expect(body.paid).toBe(true);

      const row = await db.premiumOrder.findUnique({ where: { orderId } });
      expect(row.status).toBe('paid');
      expect(row.failureCode).toBeNull();
      expect(row.failureReason).toBeNull();
    } finally {
      await db.premiumOrder.deleteMany({ where: { orderId } });
    }
  });

  test('sanitizes untrusted codes, methods and reasons', async ({ request, db, ip }) => {
    const orderId = await seedOrder(db);

    try {
      const res = await request.post('/api/premium/failure', {
        headers: { 'x-forwarded-for': ip },
        data: {
          orderId,
          token: tokenFor(orderId),
          // Not a Razorpay-shaped code: replaced with the neutral default.
          code: '<script>\nalert(1)',
          // Not a payment instrument token: dropped entirely.
          method: 'card"\tonclick=alert(1)',
          reason: 'Line one\r\nLine two\u0000\u0007 done',
        },
      });
      expect(res.status()).toBe(200);

      const row = await db.premiumOrder.findUnique({ where: { orderId } });
      expect(row.failureCode).toBe('PAYMENT_FAILED');
      expect(row.failureMethod).toBeNull();
      expect(row.failureReason).toBe('Line one Line two done');
    } finally {
      await db.premiumOrder.deleteMany({ where: { orderId } });
    }
  });

  test('a dismissal does not overwrite a concrete decline', async ({ request, db, ip }) => {
    const orderId = await seedOrder(db);

    try {
      const token = tokenFor(orderId);
      const decline = await request.post('/api/premium/failure', {
        headers: { 'x-forwarded-for': ip },
        data: {
          orderId,
          token,
          code: 'CARD_DECLINED',
          reason: 'Card declined.',
          method: 'card',
        },
      });
      expect((await decline.json()).stored).toBe(true);

      const dismissed = await request.post('/api/premium/failure', {
        headers: { 'x-forwarded-for': ip },
        data: {
          orderId,
          token,
          code: 'DISMISSED',
          reason: 'Checkout window closed before payment completed',
        },
      });
      expect((await dismissed.json()).stored).toBe(false);

      const row = await db.premiumOrder.findUnique({ where: { orderId } });
      expect(row.failureCode).toBe('CARD_DECLINED');
      expect(row.failureReason).toBe('Card declined.');
    } finally {
      await db.premiumOrder.deleteMany({ where: { orderId } });
    }
  });
});
