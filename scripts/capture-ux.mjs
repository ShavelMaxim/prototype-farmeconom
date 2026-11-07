import { chromium } from '@playwright/test';
import fs from 'node:fs';
const url = process.argv[2] || 'http://127.0.0.1:3103/prototype-farmeconom/';
const destination = 'docs/screenshots/ux-expansion';
fs.mkdirSync(destination, { recursive: true });
async function snapshot(page, options) {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {}))),
  );
  await page.screenshot(options);
}
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [1440, 768, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      isMobile: width < 900,
      hasTouch: width < 900,
    });
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForFunction(() =>
      document.querySelector('button[data-product-id="product-2"]')?.matches(':enabled'),
    );
    if (width >= 901) await page.getByRole('button', { name: /^Медтехника/ }).waitFor();
    await snapshot(page, { path: `${destination}/home-${width}.png` });
    await page
      .getByRole('heading', { name: 'Для вас и ваших близких', exact: true })
      .evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await snapshot(page, { path: `${destination}/catalog-${width}.png` });
    if (width === 390) {
      await page.getByRole('button', { name: /Категории и фильтры/ }).click();
      const drawer = page.getByRole('dialog');
      await drawer.getByRole('checkbox', { name: /^Для детей/ }).check();
      await drawer.getByRole('textbox', { name: 'Возраст ребёнка', exact: true }).fill('8');
      await drawer
        .getByRole('textbox', { name: 'Возраст ребёнка', exact: true })
        .scrollIntoViewIfNeeded();
      await snapshot(page, { path: `${destination}/filters-mobile.png` });
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Настройки отображения', exact: true }).click();
      await page.getByRole('dialog').getByRole('radio', { name: '150%', exact: true }).check();
      await page
        .getByRole('dialog')
        .getByRole('radio', { name: 'Контрастная тёмная', exact: true })
        .check();
      await page.getByRole('dialog').getByRole('button', { name: 'Готово', exact: true }).click();
      await snapshot(page, { path: `${destination}/contrast-mobile.png` });
      await page.getByRole('button', { name: 'Настройки отображения', exact: true }).click();
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Сбросить настройки', exact: true })
        .click();
      await page.getByRole('dialog').getByRole('button', { name: 'Готово', exact: true }).click();
      await page.goto(new URL('products/digital-thermometer/', url).href);
      await page.waitForFunction(() =>
        document.querySelector('button[data-product-id="product-2"]')?.matches(':enabled'),
      );
      await snapshot(page, { path: `${destination}/product-mobile.png` });
    }
    console.log(
      JSON.stringify({
        width,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        ),
      }),
    );
    await context.close();
  }
} finally {
  await browser.close();
}
