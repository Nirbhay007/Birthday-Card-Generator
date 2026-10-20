const crypto = require('node:crypto');
const { expect } = require('@playwright/test');
const { BASE_URL, uniqueSuffix } = require('../env');

const PHOTO_URL = `${BASE_URL}/sample-memory.jpg`;

function cardPayload(overrides = {}) {
  const suffix = uniqueSuffix();
  return {
    recipientName: `QA E2E ${suffix}`,
    birthdayDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    message: `Automated QA birthday message ${suffix}`,
    theme: 'elegant',
    music: 'classic',
    age: 29,
    senderName: 'QA Bot',
    relationship: 'Friend',
    ...overrides,
  };
}

async function createCard(request, ip, overrides = {}) {
  const payload = cardPayload(overrides);
  const res = await request.post('/api/birthday', {
    headers: { 'x-forwarded-for': ip },
    data: payload,
  });
  const body = await res.json().catch(() => ({}));

  if (!res.ok() || !body.success || !body.id) {
    throw new Error(
      `createCard failed (${res.status()}): ${body.error || JSON.stringify(body)}`
    );
  }

  return {
    id: body.id,
    editToken: body.editToken,
    payload,
  };
}

async function deleteCards(db, ids) {
  const list = [...new Set(ids)].filter(Boolean);
  if (list.length === 0) return;

  await db.shareEvent.deleteMany({ where: { pageId: { in: list } } });
  await db.premiumOrder.deleteMany({ where: { pageId: { in: list } } });
  await db.birthdayPage.deleteMany({ where: { id: { in: list } } });
}

async function getPage(db, id) {
  return db.birthdayPage.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: 'asc' } } },
  });
}

async function getShareEvents(db, pageId) {
  return db.shareEvent.findMany({
    where: { pageId },
    orderBy: { createdAt: 'asc' },
  });
}

async function waitForShareCount(db, pageId, count, timeout = 12_000) {
  await expect
    .poll(() => db.shareEvent.count({ where: { pageId } }), { timeout })
    .toBe(count);
}

async function waitForShareEvent(db, pageId, match, timeout = 12_000) {
  await expect
    .poll(
      () =>
        db.shareEvent.count({
          where: { pageId, ...match },
        }),
      { timeout }
    )
    .toBeGreaterThan(0);
}

async function seedPaidPremiumOrder(db, overrides = {}) {
  const token = `unlock_${crypto.randomBytes(24).toString('hex')}`;
  const orderId = `qa_order_${uniqueSuffix()}`;

  await db.premiumOrder.create({
    data: {
      orderId,
      amount: 4900,
      currency: 'INR',
      status: 'paid',
      paidAt: new Date(),
      unlockToken: token,
      tier: 'universe',
      ...overrides,
    },
  });

  return { orderId, token };
}

async function deletePremiumOrders(db, orderIds) {
  const list = [...new Set(orderIds)].filter(Boolean);
  if (list.length === 0) return;
  await db.premiumOrder.deleteMany({ where: { orderId: { in: list } } });
}

module.exports = {
  PHOTO_URL,
  cardPayload,
  createCard,
  deleteCards,
  getPage,
  getShareEvents,
  waitForShareCount,
  waitForShareEvent,
  seedPaidPremiumOrder,
  deletePremiumOrders,
};
