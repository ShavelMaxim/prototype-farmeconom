import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';

const base = process.argv[2] || 'http://127.0.0.1:3103/prototype-farmeconom/';
const destination = 'docs/screenshots/final-ux';
fs.mkdirSync(destination, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
});
const page = await context.newPage();
async function snapshot(name) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    ),
  );
  const geometry = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(geometry.content, name).toBeLessThanOrEqual(geometry.viewport);
  await page.screenshot({ path: `${destination}/${name}.png` });
  console.log(JSON.stringify({ name, ...geometry }));
}
try {
  await page.goto(base);
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeEnabled();
  await snapshot('home-390');
  await page.getByRole('button', { name: /Категории и фильтры/ }).click();
  await expect(page.locator('[data-dialog-ready="true"]')).toBeAttached();
  await snapshot('filters-390');
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Поиск товаров', exact: true }).fill('термометр');
  await page.getByRole('combobox', { name: 'Поиск товаров', exact: true }).press('Enter');
  await expect(page.locator('article')).toHaveCount(2);
  await snapshot('search-390');
  await page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }).click();
  await page.getByRole('link', { name: 'Корзина, товаров: 1', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Увеличить количество: Электронный термометр', exact: true }),
  ).toBeEnabled();
  await snapshot('cart-390');
  await page.getByRole('button', { name: 'Удалить: Электронный термометр', exact: true }).click();
  await snapshot('cart-undo-390');
  await page.getByRole('button', { name: 'Отменить', exact: true }).click();
  await page.getByRole('link', { name: 'К оформлению', exact: true }).click();
  await page
    .getByRole('checkbox', { name: 'Я понимаю, что это учебный сценарий без реального заказа' })
    .check();
  await page.getByRole('button', { name: 'Завершить демо-оформление', exact: true }).click();
  await page.getByRole('link', { name: 'Посмотреть мои заказы', exact: true }).click();
  await expect(page.getByText('Демо завершено', { exact: true })).toBeVisible();
  await snapshot('orders-390');
  await page.goto(new URL('products/digital-thermometer/', base).href);
  await page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }).click();
  await page.getByRole('link', { name: 'Корзина, товаров: 1', exact: true }).click();
  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByRole('button', { name: 'Настройки отображения', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('radio', { name: '200%', exact: true }).check();
  await dialog.getByRole('radio', { name: 'Контрастная тёмная', exact: true }).check();
  await dialog.getByRole('checkbox', { name: 'Увеличить интервалы текста', exact: true }).check();
  await snapshot('display-320-200');
  await dialog.getByRole('button', { name: 'Готово', exact: true }).click();
  await page
    .getByRole('button', { name: 'Увеличить количество: Электронный термометр', exact: true })
    .click();
  await snapshot('cart-320-200');
  await page.getByRole('button', { name: 'Удалить: Электронный термометр', exact: true }).click();
  await snapshot('cart-undo-320-200');
} finally {
  await browser.close();
}
