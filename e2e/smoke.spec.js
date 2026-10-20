const { test, expect } = require('../qa/fixtures/test');

const PUBLIC_PAGES = [
  { path: '/', heading: /birthday/i },
  { path: '/wishes', heading: /perfect words|birthday wishes/i },
  { path: '/wishes/best-friend', heading: /best friend/i },
  { path: '/ages', heading: /milestone age|birthday wishes/i },
  { path: '/ages/21', heading: /21/i },
  { path: '/anniversary', heading: /anniversary/i },
  { path: '/premium', heading: /made just for you|premium|universe/i },
];

test.describe('public pages', () => {
  for (const { path, heading } of PUBLIC_PAGES) {
    test(`${path} renders without a browser exception @smoke`, async ({ page, pageErrors }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response.status(), `${path} HTTP status`).toBeLessThan(400);

      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('h1').first()).toContainText(heading);

      expect(pageErrors, `uncaught errors on ${path}`).toEqual([]);
    });
  }

  test('mobile home + wishes smoke @smoke @mobile', async ({ page, pageErrors }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /create|birthday page|start/i }).first()).toBeVisible();

    await page.goto('/wishes/best-friend', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('unknown card returns a real 404 @smoke', async ({ page }) => {
    const response = await page.goto('/b/qa-does-not-exist', {
      waitUntil: 'domcontentloaded',
    });
    expect(response.status()).toBe(404);
    await expect(page.locator('body')).toContainText(/not found|404/i);
  });

  test('OG image endpoint returns a PNG @smoke', async ({ request }) => {
    // The edge OG route is the slowest cold compile in the app (~1 min on a
    // cold Next dev cache). Warm runs are fast; allow the cold run to finish.
    test.setTimeout(180_000);
    const response = await request.get('/api/og?name=QA&theme=fun', {
      timeout: 150_000,
    });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
    expect((await response.body()).length).toBeGreaterThan(1000);
  });

  test('robots.txt is served @smoke', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('Sitemap:');
  });
});
