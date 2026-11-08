import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settleMotion } from './settle-motion';
test.setTimeout(60000);

test('подсказки: клавиатура, Escape, IME и прямой переход без запоздавшего поиска', async ({
  page,
}, testInfo) => {
  await page.goto('./');
  const input = page.getByRole('combobox', { name: 'Поиск товаров', exact: true });
  await expect(input).toBeEnabled();
  await input.fill('терм');
  await expect(page.getByRole('listbox', { name: 'Подсказки поиска' })).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/discovery/search-normal-${testInfo.project.name}.png`,
  });
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', /.+/);
  await input.press('Escape');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('терм');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await input.dispatchEvent('compositionstart');
  await input.press('Enter');
  await expect(page).not.toHaveURL(/products\//);
  await input.dispatchEvent('compositionend');
  await input.fill('электронный терм');
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(page).toHaveURL(/products\/digital-thermometer\/?$/);
  await expect(
    page.getByRole('heading', { name: 'Электронный термометр', exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(input).toBeVisible();
});

test('опечатка исправляется явно, фильтры сохраняются, пустые подсказки не подменяют запрос', async ({
  page,
}, testInfo) => {
  await page.goto('./?category=Медтехника');
  const input = page.getByRole('combobox', { name: 'Поиск товаров', exact: true });
  await expect(input).toBeEnabled();
  await input.fill('терммоетр');
  const correction = page.getByRole('option', { name: /Возможно, вы имели в виду «термометр»/ });
  await expect(correction).toBeVisible();
  await expect(input).toHaveValue('терммоетр');
  if (testInfo.project.name === 'mobile') await correction.tap();
  else await correction.click();
  await expect(input).toHaveValue('термометр');
  await expect(page).toHaveURL(/q=/);
  expect(new URL(page.url()).searchParams.get('category')).toBe('Медтехника');
  await expect(page.locator('article')).toHaveCount(1);
  await page.goto('./?category=Питание');
  await input.fill('терммоетр');
  await expect(input).toHaveValue('терммоетр');
  await expect(page.getByRole('listbox', { name: 'Подсказки поиска', exact: true })).toHaveCount(0);
  await input.press('Enter');
  expect(new URL(page.url()).searchParams.get('q')).toBe('терммоетр');
  await page.goto('./');
  await input.fill('терм');
  await expect(page.getByRole('listbox', { name: 'Подсказки поиска' })).toBeVisible();
  await page.goto('./?diagnostics=1');
  await page.getByText('Проверить поведение интерфейса', { exact: true }).click();
  await page.getByRole('combobox', { name: 'Режим сети', exact: true }).selectOption('error');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Не удалось обновить каталог' }),
  ).toBeVisible();
  await input.focus();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('сравнение аптек: цены/остатки, отмена, подтверждение и сохранение количества корзины', async ({
  page,
}, testInfo) => {
  await page.goto('./products/digital-thermometer/');
  const add = page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true });
  await expect(add).toBeEnabled();
  await add.click();
  await page
    .getByRole('button', { name: 'Добавить ещё: Электронный термометр', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Добавить ещё: Электронный термометр', exact: true })
    .click();
  const offers = page.getByRole('region', { name: 'Цена и наличие в аптеках', exact: true });
  await expect(offers.getByRole('listitem')).toHaveCount(3);
  const park = offers
    .getByRole('listitem')
    .filter({ has: page.getByRole('heading', { name: 'У парка', exact: true }) });
  await expect(park).toContainText('364,00');
  await expect(park).toContainText('В наличии 2 шт.');
  await offers.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `docs/screenshots/discovery/offers-normal-${testInfo.project.name}.png`,
  });
  const trigger = park.getByRole('button', { name: 'Выбрать аптеку: У парка', exact: true });
  await trigger.click();
  await expect(page.getByRole('radio', { name: /У парка/ })).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(park).not.toContainText('Выбрана');
  await trigger.click();
  await page.getByRole('button', { name: 'Применить выбор', exact: true }).click();
  const selected = park.getByRole('button', {
    name: 'Изменить выбор аптеки: У парка',
    exact: true,
  });
  await expect(selected).toBeFocused();
  await expect(park).toContainText('Выбрана');
  await page.reload();
  await expect(park).toContainText('Выбрана');
  await page.getByRole('link', { name: 'Корзина, товаров: 3', exact: true }).click();
  await expect(
    page.getByRole('spinbutton', { name: 'Количество: Электронный термометр', exact: true }),
  ).toHaveValue('3');
  await expect(
    page.getByRole('button', { name: 'Исправьте наличие товаров', exact: true }),
  ).toBeDisabled();
});

test('подсказки и сравнение аптек доступны при 320px/200%, axe проверяет открытый список', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Настройки отображения', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('radio', { name: '200%', exact: true }).check();
  await dialog.getByRole('radio', { name: 'Контрастная тёмная', exact: true }).check();
  await dialog.getByRole('checkbox', { name: 'Увеличить интервалы текста', exact: true }).check();
  await dialog.getByRole('button', { name: 'Готово', exact: true }).click();
  const input = page.getByRole('combobox', { name: 'Поиск товаров', exact: true });
  await input.fill('электронный терм');
  await expect(page.getByRole('listbox')).toBeVisible();
  await input.press('ArrowDown');
  await expect(page).toHaveURL(/q=/);
  await expect(page.locator('article')).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeEnabled();
  await expect(page.getByRole('group', { name: 'Товары каталога', exact: true })).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await settleMotion(page);
  const popupBox = await page.getByRole('listbox').locator('..').boundingBox();
  const navBox = await page
    .getByRole('navigation', { name: 'Мобильная навигация', exact: true })
    .boundingBox();
  expect(popupBox!.y + popupBox!.height).toBeLessThanOrEqual(navBox!.y + 1);
  let audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
    })),
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: `docs/screenshots/discovery/search-${testInfo.project.name}.png` });
  await input.press('Enter');
  await expect(page).toHaveURL(/products\/digital-thermometer\/?$/);
  const offers = page.getByRole('region', { name: 'Цена и наличие в аптеках', exact: true });
  await offers.scrollIntoViewIfNeeded();

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: `docs/screenshots/discovery/offers-${testInfo.project.name}.png` });
  audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
  await offers.getByRole('button', { name: 'Выбрать аптеку: У парка', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await settleMotion(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.getByRole('dialog').getByRole('button', { name: 'Отмена', exact: true }).click();
});
