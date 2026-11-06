import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.setTimeout(60000);

test('прокрутка каталога сохраняет размер упаковки и доступность последнего товара', async ({
  page,
}) => {
  await page.goto('./');
  const card = page.locator('article').last();
  await expect(page.locator('article')).toHaveCount(24);
  // The decorative subtree may be skipped offscreen, but its fixed box must remain.
  const scene = card.locator('[aria-hidden="true"]').first();
  const before = await scene.evaluate((element) => element.getBoundingClientRect().height);
  await card.scrollIntoViewIfNeeded();
  await expect(card.getByRole('heading')).toBeVisible();
  await expect(card.getByRole('button')).toBeEnabled();
  expect(await scene.evaluate((element) => element.getBoundingClientRect().height)).toBe(before);
  expect(before).toBe(198);
  await card.getByRole('button').focus();
  await page.keyboard.press('Enter');
  await expect(card.getByRole('button')).toContainText('В корзине');
});

test('клавиатура: возврат фокуса из диалога и доступное оформление', async ({ page }) => {
  await page.goto('./products/digital-thermometer/');
  const choose = page.getByRole('button', { name: 'Выбрать аптеку', exact: true }).first();
  await choose.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Где вам удобно');
  const modalAxe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    modalAxe.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
    })),
  ).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(choose).toBeFocused();
  await page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Электронный термометр: в корзине 1 шт.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Перейти в корзину' }).click();
  await page.getByRole('link', { name: 'К оформлению' }).click();
  await page.getByRole('button', { name: 'Завершить демо-оформление' }).click();
  const consent = page.getByRole('checkbox', {
    name: 'Я понимаю, что это учебный сценарий без реального заказа',
  });
  await expect(consent).toHaveAttribute('aria-invalid', 'true');
  await expect(consent).toBeFocused();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
    })),
  ).toEqual([]);
});

test('каталог: автоматическая доступность и reflow до 320px', async ({ page }) => {
  await page.goto('./');
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeEnabled();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
    })),
  ).toEqual([]);
  // Browser zoom changes the CSS viewport; emulate that reflow, not CSS body zoom.
  const original = page.viewportSize()!;
  await page.setViewportSize({
    width: Math.max(320, Math.floor(original.width / 2)),
    height: original.height,
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await expect(page.getByRole('textbox', { name: 'Поиск товаров' })).toBeVisible();
  if (page.viewportSize()!.width < 600) {
    const filters = page.getByRole('button', { name: 'Категории и фильтры', exact: false });
    await filters.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(filters).toBeFocused();
  }
});

test('последний быстрый запрос побеждает при смене аптеки', async ({ page }) => {
  await page.goto('./');
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeEnabled();
  const search = page.getByRole('textbox', { name: 'Поиск товаров' });
  await search.fill('крем');
  await search.fill('термометр');
  await page.getByRole('button', { name: 'Выбрать аптеку', exact: true }).click();
  await page.getByRole('radio', { name: /У парка/ }).check();
  await page.getByRole('button', { name: 'Применить выбор', exact: true }).click();
  await expect(page).toHaveURL(/q=%D1%82%D0%B5%D1%80%D0%BC%D0%BE%D0%BC%D0%B5%D1%82%D1%80/);
  await expect(page.getByRole('status').filter({ hasText: /Найдено товаров/ })).toContainText('2');
  await expect(page.getByText('2 товаров · аптека «У парка»')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Крем для рук без отдушки', exact: true }),
  ).toHaveCount(0);
});
