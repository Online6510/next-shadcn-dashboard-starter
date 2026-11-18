const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const base = process.env.WANDERLY_TEST_URL || 'http://localhost:3100';
const output = path.join(__dirname, '..', 'docs', 'screenshots', 'v3');
const pages = [
  ['/', 'home'],
  ['/explore', 'explore'],
  ['/trips/khuvsgul-demo', 'trip'],
  ['/journal/khuvsgul-demo', 'journal'],
  ['/trips/khuvsgul-demo#budget', 'budget'],
  ['/trips/suggest', 'planner'],
  ['/settings/appearance', 'appearance']
];

async function run() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox']
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(base + '/settings/appearance', { waitUntil: 'load' });
    const midnight = page.getByRole('button', { name: /Midnight Explorer/ });
    await midnight.click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'midnight');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'midnight');
    assert.equal(await midnight.getAttribute('aria-pressed'), 'true');

    await page.getByRole('button', { name: /Desert Editorial/ }).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'desert');
    await page.getByRole('button', { name: /Nature Luxury/ }).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'nature');

    for (const [width, height, device] of [
      [1440, 900, 'desktop'],
      [390, 844, 'mobile']
    ]) {
      await page.setViewportSize({ width, height });
      for (const [route, name] of pages) {
        const response = await page.goto(base + route, { waitUntil: 'load' });
        assert.equal(response.status(), 200, 'HTTP 200 required: ' + route);
        await page.evaluate(async () => {
          await document.fonts.ready;
          for (const img of document.images) {
            if (img.getBoundingClientRect().top < innerHeight + 160) img.loading = 'eager';
          }
        });
        await page.waitForTimeout(350);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 2
        );
        assert.equal(overflow, false, 'Horizontal overflow: ' + route + ' ' + width);
        if (name === 'budget') {
          await page.locator('#budget').evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
          await page.waitForTimeout(200);
        }
        await page.screenshot({
          path: path.join(output, name + '-' + device + '.png'),
          fullPage: false
        });
      }
    }
    await page.goto(base + '/explore');
    assert(await page.locator('.destination-card').count() > 0, 'Explore catalog missing');
    await page.goto(base + '/trips/khuvsgul-demo');
    assert(await page.locator('.v3-workspace-sidebar').count(), 'Workspace sidebar missing');
    await page.goto(base + '/journal/khuvsgul-demo');
    assert(await page.locator('.v3-scrapbook').count(), 'Journal scrapbook missing');
    assert.deepEqual(errors, [], 'Uncaught client-side errors');
    console.log('Wanderly V3: responsive screens, theme persistence, route navigation and visual layout passed.');
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
