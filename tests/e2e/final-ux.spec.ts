import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settleMotion } from './settle-motion';

test.setTimeout(60000);
const name = 'Электронный термометр';

test('мобильный поиск выводит результат под поиском, компактные фильтры показывают выбор', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const search = page.getByRole('combobox', { name: 'Поиск товаров', exact: true });
  await expect(search).toBeEnabled();
  await search.fill('термометр');
  await search.press('Enter');
  const heading = page.getByRole('heading', { name: 'Поиск: «термометр»', exact: true });
  await expect(heading).toBeFocused();
  const searchBottom = await page
    .getByRole('search')
    .evaluate((e) => e.getBoundingClientRect().bottom);
  expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(searchBottom);
  const trigger = page.getByRole('button', { name: /Категории и фильтры/ });
  const select = page.getByRole('combobox', { name: 'Сортировка товаров', exact: true });
  expect(Math.abs((await trigger.boundingBox())!.y - (await select.boundingBox())!.y)).toBeLessThan(
    3,
  );
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await settleMotion(page);
  const categories = dialog
    .locator('details')
    .filter({ has: page.locator('summary', { hasText: 'Категории' }) });
  await expect(categories).not.toHaveAttribute('open');
  await expect(
    dialog.getByRole('textbox', { name: 'Цена от, рублей', exact: true }),
  ).toBeInViewport();
  await dialog.getByRole('checkbox', { name: 'Только в наличии', exact: true }).check();
  await dialog.getByRole('button', { name: 'Показать 1 товар', exact: true }).click();
  await expect(trigger).toHaveAccessibleName('Категории и фильтры, применено: 1');
  await expect(
    page.getByRole('button', { name: 'Убрать фильтр: В наличии', exact: true }),
  ).toBeVisible();
  await trigger.click();
  await dialog.locator('summary').filter({ hasText: 'Категории' }).click();
  await dialog.getByRole('button', { name: /^Медтехника/ }).click();
  await expect(dialog.locator('summary').filter({ hasText: 'Категории' })).toContainText(
    'Медтехника',
  );
  await page.keyboard.press('Escape');
  await expect(page).not.toHaveURL(/category=/);
});

test('корзина: сенсорное количество, закреплённый итог, отмена последнего удаления и проверка наличия', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.getByRole('button', { name: `В корзину: ${name}`, exact: true }).click();
  await page.getByRole('link', { name: 'Корзина, товаров: 1', exact: true }).click();
  const plus = page.getByRole('button', { name: `Увеличить количество: ${name}`, exact: true });
  const minus = page.getByRole('button', { name: `Уменьшить количество: ${name}`, exact: true });
  await expect(minus).toBeDisabled();
  await plus.click();
  await plus.click();
  await expect(plus).toBeDisabled();
  await expect(
    page.getByRole('spinbutton', { name: `Количество: ${name}`, exact: true }),
  ).toHaveValue('3');
  for (const button of [plus, minus]) {
    const box = (await button.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  const checkout = page.getByRole('link', { name: 'К оформлению', exact: true });
  await expect(checkout).toBeInViewport();
  const nav = await page
    .getByRole('navigation', { name: 'Мобильная навигация', exact: true })
    .boundingBox();
  const box = (await checkout.boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(nav!.y);
  await page.getByRole('button', { name: `Удалить: ${name}`, exact: true }).click();
  await expect(page.getByText('В корзине пока ничего нет', { exact: true })).toBeVisible();
  await expect(checkout).toHaveCount(0);
  await page.getByRole('button', { name: 'Отменить', exact: true }).click();
  await expect(
    page.getByRole('spinbutton', { name: `Количество: ${name}`, exact: true }),
  ).toHaveValue('3');
  await page.reload();
  await expect(
    page.getByRole('spinbutton', { name: `Количество: ${name}`, exact: true }),
  ).toHaveValue('3');
  await page.getByRole('button', { name: `Удалить: ${name}`, exact: true }).click();
  await page.getByRole('button', { name: /Выбрать аптеку/ }).click();
  await page.getByRole('radio', { name: /У парка/ }).check();
  await page.getByRole('button', { name: 'Применить выбор', exact: true }).click();
  await page.getByRole('button', { name: 'Отменить', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Исправьте наличие товаров', exact: true }),
  ).toBeDisabled();
  await expect(checkout).toHaveCount(0);
});

test('корзина при 320px и 200%: содержимое доступно над закреплёнными панелями, axe без нарушений', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('./');
  await page.getByRole('button', { name: `В корзину: ${name}`, exact: true }).click();
  await page.getByRole('link', { name: 'Корзина, товаров: 1', exact: true }).click();
  await page.getByRole('button', { name: 'Настройки отображения', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('radio', { name: '200%', exact: true }).check();
  await dialog.getByRole('radio', { name: 'Контрастная тёмная', exact: true }).check();
  await dialog.getByRole('checkbox', { name: 'Увеличить интервалы текста', exact: true }).check();
  await dialog.getByRole('button', { name: 'Готово', exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: `Увеличить количество: ${name}`, exact: true }).click();
  await expect(
    page.getByRole('spinbutton', { name: `Количество: ${name}`, exact: true }),
  ).toHaveValue('2');
  await expect(page.getByRole('link', { name: 'К оформлению', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: `Удалить: ${name}`, exact: true }).click();
  await expect(page.getByRole('button', { name: 'Отменить', exact: true })).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Отменить', exact: true }).click();
  await settleMotion(page);
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
});
