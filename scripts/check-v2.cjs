const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const base = process.env.WANDERLY_TEST_URL || 'http://localhost:3100';
const repo = require('node:path').resolve(__dirname, '..');
const tripDemo = '/trips/khuvsgul-demo';
const journalDemo = '/journal/khuvsgul-demo';
const name = 'Шалгалтын аялал ' + Date.now();
async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH,
    args: ['--no-sandbox']
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.setDefaultTimeout(12000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('dialog', (dialog) => dialog.accept());
    for (const [width, height, size] of [
      [1440, 900, 'desktop'],
      [390, 844, 'mobile']
    ]) {
      await page.setViewportSize({ width, height });
      for (const [route, label] of [
        ['/', 'home'],
        ['/explore', 'explore'],
        [tripDemo, 'trip'],
        [journalDemo, 'journal'],
        ['/trips/suggest', 'planner'],
        ['/trips/new', 'new-trip'],
        [tripDemo + '#budget', 'budget']
      ]) {
        const response = await page.goto(base + route, { waitUntil: 'networkidle' });
        assert.equal(response.status(), 200, route);
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(
            [...document.images].map((image) => {
              image.loading = 'eager';
              return image.decode();
            })
          );
        });
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          'overflow ' + route + ' ' + size
        );
        await page.screenshot({
          path: repo + '/docs/screenshots/v2/' + label + '-' + size + '.jpg',
          type: 'jpeg',
          quality: 83
        });
      }
    }
    console.log('Desktop/mobile views rendered; no broken images or horizontal overflow');
    await page.goto(base + '/explore', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Дараагийн онцлох газар' }).click();
    await page.waitForFunction(() => document.querySelector('.featured-slider').scrollLeft > 0);
    await page.getByLabel('Хайх').fill('Хөвсгөл');
    await page.getByText('3 газар', { exact: true }).waitFor();
    await page.getByLabel('Төрөл').selectOption('Байгаль');
    await page.getByText('1 газар', { exact: true }).waitFor();
    await page.getByRole('link', { name: /Хөвсгөл нуур/ }).click();
    await page.getByRole('link', { name: /Шинэ аялалд нэмэх/ }).click();
    await page.getByLabel('Аяллын нэр').fill(name);
    await page.getByLabel('Эхлэх өдөр').fill('2026-12-01');
    await page.getByLabel('Дуусах өдөр').fill('2026-12-03');
    await page.getByRole('button', { name: 'Аялал үүсгэх', exact: true }).click();
    await page.waitForURL(/\/trips\/[\w-]+\?add=khuvsgul/);
    const trip = new URL(page.url()).pathname;
    let add = page
      .locator('details')
      .filter({ has: page.getByText('＋ Зогсоол нэмэх', { exact: true }) })
      .first();
    await add.getByLabel('Тэмдэглэл').fill('Эхний зогсоол');
    await add.getByRole('button', { name: 'Зогсоол нэмэх', exact: true }).click();
    await page.waitForURL(/\?day=2026-12-01/);
    for (const [destination, notes] of [
      ['terelj', 'Хоёр дахь зогсоол'],
      ['orkhon', 'Гурав дахь зогсоол']
    ]) {
      add = page
        .locator('details.editor')
        .filter({ has: page.getByText('＋ Зогсоол нэмэх', { exact: true }) });
      if (!((await add.getAttribute('open')) !== null)) await add.locator('summary').click();
      await add.getByLabel('Очих газар').selectOption(destination);
      await add.getByLabel('Тэмдэглэл').fill(notes);
      await add.getByRole('button', { name: 'Зогсоол нэмэх', exact: true }).click();
      await page.locator('article.stop p').getByText(notes, { exact: true }).waitFor();
    }
    const second = page
      .locator('article.stop')
      .filter({
        has: page.locator('.stop-title strong').getByText('Горхи-Тэрэлж', { exact: true })
      });
    await second.getByRole('button', { name: '↑ Дээш' }).click();
    await page
      .locator('article.stop')
      .first()
      .locator('.stop-title strong')
      .getByText('Горхи-Тэрэлж', { exact: true })
      .waitFor();
    const third = page
      .locator('article.stop')
      .filter({
        has: page.locator('.stop-title strong').getByText('Орхоны хүрхрээ', { exact: true })
      });
    await third.getByText('Засах', { exact: true }).click();
    await third.getByLabel('Тэмдэглэл').fill('Шинэчилсэн тэмдэглэл');
    await third.getByLabel('Төлөвлөсөн зардал (₮)').fill('85000');
    await third.getByRole('button', { name: 'Зогсоол хадгалах' }).click();
    await page
      .locator('article.stop p')
      .getByText('Шинэчилсэн тэмдэглэл', { exact: true })
      .waitFor();
    await page.reload();
    assert.equal(await page.locator('article.stop').count(), 3);
    await third.locator('p').getByText('Шинэчилсэн тэмдэглэл', { exact: true }).waitFor();
    await third.getByRole('button', { name: /Орхоны хүрхрээ/ }).click();
    await page.locator('.workspace-shortcuts a[href$="#trip-map"]').click();
    await page.getByRole('button', { name: /Зогсоол 3, Орхоны хүрхрээ/, pressed: true }).waitFor();
    await page.locator('.workspace-shortcuts a[href$="#budget"]').click();
    await page.getByText('＋ Зардал нэмэх', { exact: true }).click();
    await page.getByLabel('Тайлбар', { exact: true }).fill('Өдрийн хоолны шалгалт');
    await page.getByLabel('Ангилал', { exact: true }).selectOption('Хоол');
    await page.getByLabel('Дүн (₮)', { exact: true }).fill('120000');
    await page.getByRole('button', { name: 'Зардал нэмэх', exact: true }).click();
    await page.getByText('Өдрийн хоолны шалгалт', { exact: true }).waitFor();
    await page.reload();
    await page.getByText('1,380,000 ₮', { exact: true }).waitFor();
    const expense = page.locator('article.expense-record');
    await expense.getByText('Засах', { exact: true }).click();
    await expense.getByLabel('Дүн (₮)', { exact: true }).fill('130000');
    await expense.getByRole('button', { name: 'Зардал хадгалах' }).click();
    await page.getByText('1,370,000 ₮', { exact: true }).waitFor();
    await expense.getByRole('button', { name: 'Устгах', exact: true }).click();
    await expense.waitFor({ state: 'detached' });
    await page.getByRole('link', { name: /Дурсамжийн дэвтэр/ }).click();
    await page.getByText('＋ Дурсамж нэмэх', { exact: true }).click();
    await page.getByLabel('Гарчиг', { exact: true }).fill('Шинэ дурсамж');
    await page.getByLabel('Түүх', { exact: true }).fill('Дэвтэрт хадгалагдах түүх.');
    await page
      .locator('input[type=file]:visible')
      .setInputFiles([repo + '/public/images/lake.webp', repo + '/public/images/orkhon.webp']);
    await page.getByRole('button', { name: 'Тэмдэглэл нэмэх', exact: true }).click();
    await page.getByRole('heading', { name: 'Шинэ дурсамж' }).waitFor();
    await page.reload();
    const entry = page.locator('article.journal-record');
    const photoUrl = await entry.locator('.journal-photo img').first().getAttribute('src');
    assert.equal((await page.request.get(new URL(photoUrl, base).href)).status(), 200);
    await entry
      .getByRole('button', { name: /зураг томруулах/ })
      .first()
      .click();
    await page.getByRole('button', { name: 'Дараах →' }).click();
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await entry.getByText('Засах', { exact: true }).click();
    await entry.getByLabel('Гарчиг', { exact: true }).fill('Зассан дурсамж');
    const secondPhoto = await entry.locator('.journal-photo img').nth(1).getAttribute('src');
    await entry.locator('input[name=removePhoto]').nth(1).check();
    await entry.getByRole('button', { name: 'Тэмдэглэл хадгалах' }).click();
    await page.getByRole('heading', { name: 'Зассан дурсамж' }).waitFor();
    assert.equal(await entry.locator('.journal-photo').count(), 1);
    assert.equal((await page.request.get(new URL(secondPhoto, base).href)).status(), 404);
    await entry.getByRole('button', { name: 'Устгах', exact: true }).click();
    await page.getByText('Энэ аяллын анхны дурсамжийг бичээрэй.').waitFor();
    assert.equal((await page.request.get(new URL(photoUrl, base).href)).status(), 404);
    await page.goto(base + trip);
    await page.getByText('Аяллын мэдээлэл засах', { exact: true }).click();
    await page.getByLabel('Аяллын нэр').fill(name + ' зассан');
    await page.getByRole('button', { name: 'Өөрчлөлт хадгалах' }).click();
    await page.getByRole('heading', { name: name + ' зассан' }).waitFor();
    await page.reload();
    await page.getByRole('heading', { name: name + ' зассан' }).waitFor();
    await page.getByText('Аяллын мэдээлэл засах', { exact: true }).click();
    await page.getByRole('button', { name: 'Аялал устгах' }).click();
    await page.waitForURL((url) => url.pathname === '/trips');
    assert.equal(await page.getByText(name + ' зассан', { exact: true }).count(), 0);
    await page.getByRole('link', { name: /Ухаалаг санал/ }).click();
    await page.getByLabel('Аяллын нэр').fill('Дүрэмт санал ' + Date.now());
    await page.getByLabel('Эхлэх өдөр').fill('2026-12-01');
    await page.getByLabel('Аймаг', { exact: true }).selectOption('Хөвсгөл');
    await page.getByRole('button', { name: /Санал харах/ }).click();
    await page.getByText('Сонирхолтой нийцсэн · Байгаль', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Аялал болгож хадгалах' }).click();
    await page.getByRole('heading', { name: /Дүрэмт санал/ }).waitFor();
    await page.reload();
    assert.equal(await page.locator('article.stop').count(), 2);
    await page.getByText('Аяллын мэдээлэл засах', { exact: true }).click();
    await page.getByRole('button', { name: 'Аялал устгах' }).click();
    await page.waitForURL((url) => url.pathname === '/trips');
    assert.deepEqual(errors, []);
    console.log(
      'Explore, trip create and reload, stops add/reorder/edit, pin selection, expenses, journal CRUD, lightbox, trip deletion, featured carousel and persisted smart suggestion passed'
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
