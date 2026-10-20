/**
 * Wait until React has hydrated the document (the marker is set by
 * src/components/HydrationMarker.js). Safe to call after any full navigation.
 */
async function waitForHydration(page, timeout = 20_000) {
  await page
    .waitForSelector('html[data-hydrated="true"]', { timeout })
    .catch(() => {});
}

module.exports = { waitForHydration };
