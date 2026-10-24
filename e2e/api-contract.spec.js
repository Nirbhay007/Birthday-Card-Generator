const { test, expect } = require('../qa/fixtures/test');
const { PHOTO_URL } = require('../qa/helpers/api');
const { STATS_TOKEN } = require('../qa/env');

test.describe('API contracts', () => {
  test('card creation validates input and returns a one-time edit token @smoke', async ({
    request,
    cards,
    ip,
  }) => {
    const headers = { 'x-forwarded-for': ip };

    const invalid = await request.post('/api/birthday', {
      headers,
      data: { recipientName: '   ' },
    });
    expect(invalid.status()).toBe(400);
    expect((await invalid.json()).error).toMatch(/name is required/i);

    const card = await cards.create({
      message: 'API contract card',
      birthdayDate: '2026-11-21',
    });
    expect(card.editToken).toHaveLength(48);

    const stored = await cards.get(card.id);
    expect(stored.recipientName).toBe(card.payload.recipientName);
    expect(stored.message).toBe('API contract card');
    expect(stored.editToken).toBe(card.editToken);
  });

  test('card source accepts only internal, utm and ref shapes @smoke', async ({
    cards,
  }) => {
    const internal = await cards.create({ source: 'wishes/best-friend' });
    expect((await cards.get(internal.id)).source).toBe('wishes/best-friend');

    const campaign = await cards.create({ source: 'UTM:Instagram' });
    expect((await cards.get(campaign.id)).source).toBe('utm:instagram');

    const referrer = await cards.create({ source: 'ref:news.ycombinator.com' });
    expect((await cards.get(referrer.id)).source).toBe('ref:news.ycombinator.com');

    // Anything else is dropped rather than stored as unbounded free text.
    const invalid = await cards.create({ source: 'https://evil.example/?q=secret' });
    expect((await cards.get(invalid.id)).source).toBeNull();
  });

  test('card edits require the ownership token @critical', async ({ request, cards, ip }) => {
    const headers = { 'x-forwarded-for': ip };
    const card = await cards.create();

    const noToken = await request.patch(`/api/birthday/${card.id}`, {
      headers,
      data: { theme: 'royal' },
    });
    expect(noToken.status()).toBe(403);

    const wrongToken = await request.patch(`/api/birthday/${card.id}`, {
      headers,
      data: { theme: 'royal', editToken: 'f'.repeat(48) },
    });
    expect(wrongToken.status()).toBe(403);

    const invalidFields = await request.patch(`/api/birthday/${card.id}`, {
      headers,
      data: { theme: 'not-a-theme', editToken: card.editToken },
    });
    expect(invalidFields.status()).toBe(400);

    const update = await request.patch(`/api/birthday/${card.id}`, {
      headers,
      data: {
        theme: 'royal',
        music: 'musicbox',
        message: 'Updated by the API contract test',
        editToken: card.editToken,
      },
    });
    expect(update.status()).toBe(200);
    expect((await update.json()).success).toBe(true);

    const stored = await cards.get(card.id);
    expect(stored.theme).toBe('royal');
    expect(stored.music).toBe('musicbox');
    expect(stored.message).toBe('Updated by the API contract test');

    const missing = await request.patch('/api/birthday/qa-missing-card', {
      headers,
      data: { theme: 'royal', editToken: card.editToken },
    });
    expect(missing.status()).toBe(404);
  });

  test('view and love counters are one-per-browser and preview is a no-op @critical', async ({
    request,
    cards,
    db,
    ip,
  }) => {
    const headers = { 'x-forwarded-for': ip };
    const card = await cards.create();
    const url = `/api/birthday/${card.id}/react`;

    const view1 = await request.post(url, { headers, data: { type: 'view' } });
    expect((await view1.json()).viewCount).toBe(1);
    const view2 = await request.post(url, { headers, data: { type: 'view' } });
    expect((await view2.json()).duplicate).toBe(true);

    const love1 = await request.post(url, { headers, data: { type: 'love' } });
    expect((await love1.json()).loves).toBe(1);
    const love2 = await request.post(url, { headers, data: { type: 'love' } });
    expect((await love2.json()).duplicate).toBe(true);

    const preview = await request.post(`${url}?preview=1`, {
      headers,
      data: { type: 'share', channel: 'whatsapp', sessionId: 'qa-preview-session' },
    });
    expect((await preview.json()).preview).toBe(true);

    const badType = await request.post(url, { headers, data: { type: 'explode' } });
    expect(badType.status()).toBe(400);

    const after = await cards.get(card.id);
    expect(after.viewCount).toBe(1);
    expect(after.loves).toBe(1);
    expect(after.shares).toBe(0);
    expect(await db.shareEvent.count({ where: { pageId: card.id } })).toBe(0);
  });

  test('share events dedupe per channel/session and count new channels or sessions @critical', async ({
    request,
    cards,
    db,
    ip,
  }) => {
    const headers = { 'x-forwarded-for': ip };
    const card = await cards.create();
    const url = `/api/birthday/${card.id}/react`;
    const session = 'qa-share-session-a';

    const first = await request.post(url, {
      headers,
      data: { type: 'share', channel: 'whatsapp', source: 'post_creation', sessionId: session },
    });
    expect((await first.json()).success).toBe(true);
    expect((await first.json()).shares).toBe(1);

    const duplicate = await request.post(url, {
      headers,
      data: { type: 'share', channel: 'whatsapp', source: 'card_footer', sessionId: session },
    });
    expect((await duplicate.json()).duplicate).toBe(true);

    const otherChannel = await request.post(url, {
      headers,
      data: { type: 'share', channel: 'telegram', source: 'card_footer', sessionId: session },
    });
    expect((await otherChannel.json()).duplicate).toBeUndefined();
    expect((await otherChannel.json()).shares).toBe(2);

    const newSession = await request.post(url, {
      headers,
      data: { type: 'share', channel: 'whatsapp', source: 'card_footer', sessionId: 'qa-share-session-b' },
    });
    expect((await newSession.json()).shares).toBe(3);

    const unknownChannel = await request.post(url, {
      headers,
      data: { type: 'share', channel: 'myspace', source: 'card_footer', sessionId: 'qa-share-session-c' },
    });
    expect((await unknownChannel.json()).shares).toBe(4);

    const events = await cards.shares(card.id);
    expect(events).toHaveLength(4);
    expect(events.map((e) => `${e.channel}:${e.source}`).sort()).toEqual([
      'other:card_footer',
      'telegram:card_footer',
      'whatsapp:card_footer',
      'whatsapp:post_creation',
    ]);

    expect(await db.shareEvent.count({
      where: { pageId: card.id, channel: 'whatsapp', sessionId: session },
    })).toBe(1);
  });

  test('stats endpoint requires its token and reports event shares + legacy counter @smoke', async ({
    request,
  }) => {
    const unauthorized = await request.get('/api/stats');
    expect(unauthorized.status()).toBe(404);

    const authorized = await request.get(`/api/stats?token=${STATS_TOKEN}`);
    expect(authorized.status()).toBe(200);
    const body = await authorized.json();
    expect(body.success).toBe(true);
    expect(typeof body.totals.shares).toBe('number');
    expect(typeof body.totals.legacyShareClicks).toBe('number');
    expect(body.support).toBeTruthy();
  });

  test('support tracking validates events and stores the donation intent @smoke', async ({
    request,
    db,
    ip,
  }) => {
    const headers = { 'x-forwarded-for': ip };

    const invalid = await request.post('/api/support/track', {
      headers,
      data: { event: 'not-real' },
    });
    expect(invalid.status()).toBe(400);

    const tracked = await request.post('/api/support/track', {
      headers,
      data: { event: 'pay_click', amount: 199, path: '/qa-api-contract' },
    });
    expect(tracked.status()).toBe(200);

    const row = await db.supportEvent.findFirst({
      where: { event: 'pay_click', path: '/qa-api-contract' },
      orderBy: { createdAt: 'desc' },
    });
    expect(row).not.toBeNull();
    expect(row.amount).toBe(199);

    await db.supportEvent.deleteMany({ where: { path: '/qa-api-contract' } });
  });

  test('cleanup cron removes expired photos but keeps the card row @smoke', async ({
    request,
    cards,
    db,
  }) => {
    const card = await cards.create({ photos: [PHOTO_URL] });
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

    await db.birthdayPage.update({
      where: { id: card.id },
      data: { createdAt: eightDaysAgo, birthdayDate: eightDaysAgo },
    });

    const cleanup = await request.get('/api/cron/cleanup');
    expect(cleanup.status()).toBe(200);
    expect((await cleanup.json()).success).toBe(true);

    expect(await db.photo.count({ where: { pageId: card.id } })).toBe(0);
    expect(await db.birthdayPage.count({ where: { id: card.id } })).toBe(1);
  });
});
