/**
 * Shared Playwright fixtures.
 *
 *  - db:            worker-scoped Prisma client pointed at the QA database
 *  - ip:            unique spoofed x-forwarded-for per test (rate-limit safe)
 *  - cards:         creates cards via the real API, tracks every id/order and
 *                   deletes them after the test even when it fails
 *  - pageErrors:    uncaught browser exceptions collected for assertions
 */

const base = require('@playwright/test');
const { PrismaClient } = require('@prisma/client');
const { DB_URL, uniqueIp } = require('../env');
const {
  createCard,
  deleteCards,
  getPage,
  getShareEvents,
  waitForShareCount,
  waitForShareEvent,
  seedPaidPremiumOrder,
  deletePremiumOrders,
} = require('../helpers/api');
const { waitForHydration } = require('../helpers/ui');

const prisma = new PrismaClient({
  datasources: { db: { url: DB_URL } },
});

const test = base.test.extend({
  db: [
    async ({}, use) => {
      await use(prisma);
      await prisma.$disconnect();
    },
    { scope: 'worker' },
  ],

  ip: async ({}, use, testInfo) => {
    await use(uniqueIp(testInfo));
  },

  // Every browser request is tagged with the test's IP so creation/upload
  // rate limits never collide across parallel workers. Navigations also wait
  // for React hydration (see src/components/HydrationMarker.js) so the first
  // click can never land on a server-rendered button with no handler yet.
  page: async ({ page, ip }, use) => {
    await page.setExtraHTTPHeaders({ 'x-forwarded-for': ip });

    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      await waitForHydration(page);
      return response;
    };

    const reload = page.reload.bind(page);
    page.reload = async (options) => {
      const response = await reload(options);
      await waitForHydration(page);
      return response;
    };

    await use(page);
  },

  pageErrors: async ({ page }, use) => {
    const errors = [];
    const onPageError = (error) => {
      errors.push(error.message || String(error));
    };
    page.on('pageerror', onPageError);
    await use(errors);
    page.off('pageerror', onPageError);
  },

  cards: async ({ db, request, ip }, use) => {
    const ids = new Set();
    const orderIds = new Set();

    const factory = {
      ip,

      track(id) {
        if (id) ids.add(id);
        return id;
      },

      async create(overrides = {}) {
        const card = await createCard(request, ip, overrides);
        ids.add(card.id);
        return card;
      },

      async createPaidPremiumOrder(overrides = {}) {
        const order = await seedPaidPremiumOrder(db, overrides);
        orderIds.add(order.orderId);
        return order;
      },

      async get(id) {
        return getPage(db, id);
      },

      async shares(id) {
        return getShareEvents(db, id);
      },

      async waitForShares(id, count) {
        await waitForShareCount(db, id, count);
      },

      async waitForShareEvent(id, match) {
        await waitForShareEvent(db, id, match);
      },

      async cleanup() {
        await deletePremiumOrders(db, [...orderIds]);
        await deleteCards(db, [...ids]);
        ids.clear();
        orderIds.clear();
      },
    };

    await use(factory);
    await factory.cleanup();
  },
});

const expect = base.expect;

module.exports = { test, expect };
