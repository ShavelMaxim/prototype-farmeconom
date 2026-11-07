import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settleMotion } from './settle-motion';
test.setTimeout(60000);
const addName = 'В корзину: Электронный термометр';

test('мобильные фильтры: отмена, возраст, применение одной записью History и удаление метки', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await expect(page.getByRole('button', { name: addName, exact: true })).toBeEnabled();
  const trigger = page.getByRole('button', { name: /Категории и фильтры/ });
  await trigger.click();
  let dialog = page.getByRole('dialog');
  const priceSlider = dialog.getByRole('slider', { name: 'Цена от, ползунок', exact: true });
  await priceSlider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('textbox', { name: 'Цена от, рублей', exact: true })).toHaveValue(
    '80',
  );
  await dialog.getByRole('checkbox', { name: /^Для детей/ }).check();
  await dialog.getByRole('textbox', { name: 'Возраст ребёнка', exact: true }).fill('4');
  await expect(page).not.toHaveURL(/audience=/);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await trigger.click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('checkbox', { name: /^Для детей/ })).not.toBeChecked();
  await dialog.getByRole('checkbox', { name: /^Для детей/ }).check();
  await dialog.getByRole('textbox', { name: 'Возраст ребёнка', exact: true }).fill('4');
  await dialog.getByRole('checkbox', { name: /^Без отдушек/ }).check();
  await dialog.getByRole('button', { name: 'Показать 1 товар', exact: true }).click();
  await expect(page).toHaveURL(/audience=children/);
  await expect(page.locator('article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Детские салфетки без отдушки' })).toBeVisible();
  await page.reload();
  await expect(page.locator('article')).toHaveCount(1);
  await page.getByRole('button', { name: 'Убрать фильтр: Без отдушек', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(4);
  await page.goBack();
  await expect(page.locator('article')).toHaveCount(1);
  await page.goBack();
  await expect(page).not.toHaveURL(/audience=/);
  await expect(page.locator('article')).toHaveCount(44);
});

test('избранное сохраняется, удаление последнего товара можно отменить', async ({ page }) => {
  await page.goto('./');
  await page
    .getByRole('button', { name: 'В избранное: Электронный термометр', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Удалить из избранного: Электронный термометр', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: 'Избранное', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(1);
  await page.reload();
  await page
    .getByRole('button', { name: 'Удалить из избранного: Электронный термометр', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Пока ничего не сохранено' })).toBeVisible();
  await page.getByRole('button', { name: 'Отменить', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('article')).toHaveCount(1);
});

test('демо-оформление создаёт снимок истории, повтор требует подтверждения и сохраняет корзину', async ({
  page,
}) => {
  await page.goto('./');
  await page.getByRole('button', { name: addName, exact: true }).click();
  await page.getByRole('link', { name: 'Корзина, товаров: 1', exact: true }).click();
  await page.getByRole('link', { name: 'К оформлению', exact: true }).click();
  await page
    .getByRole('checkbox', { name: 'Я понимаю, что это учебный сценарий без реального заказа' })
    .check();
  await page.getByRole('button', { name: 'Завершить демо-оформление', exact: true }).click();
  await page.getByRole('link', { name: 'Посмотреть мои заказы', exact: true }).click();
  await expect(page.getByText('Демо завершено', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByText(/Состав ·/).click();
  await expect(page.getByText('Электронный термометр', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Повторить демо-заказ', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Текущая аптека: Центральная');
  await page.getByRole('button', { name: 'Отмена', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 0', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Повторить демо-заказ', exact: true }).click();
  await page.getByRole('button', { name: /^Добавить 1 шт/ }).click();
  await page.getByRole('link', { name: 'Открыть корзину', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Электронный термометр', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 1', exact: true })).toBeVisible();
});

test('настройки: контраст, 200% текста, сохранение и отсутствие переполнения 320px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Настройки отображения', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('radio', { name: '200%', exact: true }).check();
  await dialog.getByRole('radio', { name: 'Контрастная тёмная', exact: true }).check();
  await dialog.getByRole('checkbox', { name: 'Увеличить интервалы текста', exact: true }).check();
  await dialog.getByRole('checkbox', { name: 'Уменьшить анимацию', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('data-scale', '200');
  await dialog.getByRole('button', { name: 'Готово', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-scale', '200');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Настройки отображения', exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('radio', { name: '200%', exact: true })).toBeChecked();
  await dialog.getByRole('button', { name: 'Сбросить настройки', exact: true }).click();
  await dialog.getByRole('button', { name: 'Готово', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-scale', '100');
});

test('новые панели и страницы проходят автоматическую проверку доступности', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Настройки отображения', exact: true }).click();
  const check = async () => {
    await settleMotion(page);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
      })),
    ).toEqual([]);
  };
  await check();
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: /^(Мои заказы|Заказы)$/ }).click();
  await expect(page.getByRole('heading', { name: 'Мои заказы', exact: true })).toBeVisible();
  await check();
  await page.getByRole('link', { name: 'Избранное', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Избранное', exact: true })).toBeVisible();
  await check();
});

test('повреждённое и недоступное хранилище не блокирует интерфейс', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('apteka-ryadom:personal:v1', '{broken');
    Storage.prototype.setItem = () => {
      throw new Error('Storage disabled');
    };
  });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  await page
    .getByRole('button', { name: 'В избранное: Электронный термометр', exact: true })
    .click();
  await page.getByRole('link', { name: 'Избранное', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(1);
  await expect(page.getByRole('alert').filter({ hasText: 'Не удалось сохранить' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('светлая и тёмная контрастные схемы доступны в каталоге и панели фильтров', async ({
  page,
}) => {
  test.setTimeout(120000); // Four full axe scans per device, including offscreen facets.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  for (const scheme of ['Контрастная светлая', 'Контрастная тёмная']) {
    await page.getByRole('button', { name: 'Настройки отображения', exact: true }).click();
    await page.getByRole('dialog').getByRole('radio', { name: scheme, exact: true }).check();
    await page.getByRole('dialog').getByRole('button', { name: 'Готово', exact: true }).click();
    await settleMotion(page);
    let result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
      })),
    ).toEqual([]);
    await page.getByRole('button', { name: /Категории и фильтры/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await settleMotion(page);
    result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
      })),
    ).toEqual([]);
    await page.keyboard.press('Escape');
  }
});
