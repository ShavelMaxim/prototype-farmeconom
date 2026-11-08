import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';
const url = process.argv[2] || 'http://127.0.0.1:3103/prototype-farmeconom/';
const directory = 'docs/screenshots/graphite';
fs.mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
async function capture(page, name) {
  await page.waitForFunction(() =>
    document.querySelector('button[aria-label="Новогоднее оформление"]')?.matches(':enabled'),
  );
  const search = page.getByRole('combobox', { name: 'Поиск товаров', exact: true });
  if (await search.count()) await expect(search).toBeEnabled();
  await page.screenshot({ path: `${directory}/${name}.png` });
  const width = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  const copy = await page.locator('body').innerText();
  if (width.content > width.viewport || /учебн|демонстрац|портфолио|макет/i.test(copy))
    throw new Error(`Unexpected layout/copy in ${name}`);
  results.push({ name, ...width });
}
try {
  for (const width of [1440, 768, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      hasTouch: width < 901,
    });
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForFunction(() =>
      document
        .querySelector('button[aria-label="В корзину: Электронный термометр"]')
        ?.matches(':enabled'),
    );
    await capture(page, `viewport-${width}`);
    await page.getByRole('button', { name: 'Новогоднее оформление', exact: true }).click();
    await capture(page, `festive-viewport-${width}`);
    if (width === 390) {
      await page
        .getByRole('button', { name: 'В избранное: Электронный термометр', exact: true })
        .click();
      await page.getByRole('link', { name: 'Избранное', exact: true }).click();
      await page.waitForURL(/favorites\/?$/);
      await expect(page.locator('article')).toHaveCount(1);
      await capture(page, 'favorites-390');
      await page.goto(new URL('products/digital-thermometer/', url).href);
      await page
        .getByRole('button', { name: 'В корзину: Электронный термометр', exact: true })
        .click();
      await page.getByRole('link', { name: /^Перейти в корзину/ }).click();
      await page.getByRole('link', { name: 'К оформлению', exact: true }).waitFor();
      await capture(page, 'cart-390');
      await page.getByRole('link', { name: 'К оформлению', exact: true }).click();
      await page.getByRole('button', { name: 'Сохранить заказ', exact: true }).waitFor();
      await capture(page, 'checkout-390');
      await page
        .getByRole('checkbox', {
          name: 'Сохранить заказ на этом устройстве без передачи в аптеку',
          exact: true,
        })
        .check();
      await page.getByRole('button', { name: 'Сохранить заказ', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Заказ сохранён', exact: true }),
      ).toBeFocused();
      await capture(page, 'result-390');
    }
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 320, height: 844 },
    hasTouch: true,
  });
  await context.addInitScript(() => {
    localStorage.setItem(
      'apteka-ryadom:personal:v1',
      JSON.stringify({
        favorites: [],
        orders: [],
        display: {
          scale: '200',
          contrast: 'dark',
          spacing: true,
          reducedMotion: true,
          festive: true,
        },
      }),
    );
    localStorage.setItem(
      'apteka-ryadom:cart:v1',
      JSON.stringify({ items: [{ id: 'product-2', quantity: 1 }], pharmacy: 'central' }),
    );
  });
  const page = await context.newPage();
  for (const path of [
    '',
    'products/digital-thermometer/',
    'cart/',
    'checkout/',
    'favorites/',
    'orders/',
  ]) {
    await page.goto(new URL(path, url).href);
    await page.getByRole('button', { name: 'Новогоднее оформление', exact: true }).waitFor();
    await page.waitForFunction(() => document.querySelector('html')?.dataset.scale === '200');
    await capture(page, `${path.split('/')[0] || 'home'}-320-200`);
    if (path === 'checkout/') {
      await page
        .getByRole('checkbox', {
          name: 'Сохранить заказ на этом устройстве без передачи в аптеку',
          exact: true,
        })
        .check();
      await page.getByRole('button', { name: 'Сохранить заказ', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Заказ сохранён', exact: true }),
      ).toBeFocused();
      await capture(page, 'result-320-200');
    }
  }
  await context.close();
  fs.writeFileSync(`${directory}/geometry.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}
