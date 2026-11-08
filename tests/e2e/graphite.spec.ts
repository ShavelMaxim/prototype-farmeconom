import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settleMotion } from './settle-motion';

test.setTimeout(60000);
test('оформление и сохранённый заказ помещаются при 320px, контрасте и тексте 200%', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.addInitScript(() => {
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
  await page.goto('./checkout/');
  const save = page.getByRole('button', { name: 'Сохранить заказ', exact: true });
  await expect(save).toBeEnabled();
  const fits = () =>
    page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    );
  expect(await fits()).toBe(true);
  await page
    .getByRole('checkbox', {
      name: 'Сохранить заказ на этом устройстве без передачи в аптеку',
      exact: true,
    })
    .check();
  await save.click();
  await expect(page.getByText('Заказ сохранён', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Заказ сохранён', exact: true })).toBeFocused();
  expect(await fits()).toBe(true);
  await settleMotion(page);
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
    })),
  ).toEqual([]);
});
test('праздничный слой сохраняет корзину и избранное, восстанавливается до гидратации и отключается', async ({
  page,
}) => {
  await page.goto('./');
  const toggle = page.getByRole('button', { name: 'Новогоднее оформление', exact: true });
  await expect(toggle).toBeEnabled();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page).toHaveTitle(/Фарм Эконом/);
  expect(await page.locator('body').innerText()).not.toMatch(/учебн|демонстрац|демо|портфолио/i);
  await page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }).click();
  await page
    .getByRole('button', { name: 'В избранное: Электронный термометр', exact: true })
    .click();
  const mainTop = () =>
    page.locator('main').evaluate((el) => el.getBoundingClientRect().top + scrollY);
  const before = await mainTop();
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-festive', 'true');
  await expect(page.locator('.seasonal-decor')).toBeVisible();
  expect(await mainTop()).toBe(before);
  await page.reload();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('button', { name: 'Добавить ещё: Электронный термометр', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Удалить из избранного: Электронный термометр', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Настройки отображения', exact: true }).click();
  await settleMotion(page);
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('radio', { name: 'Контрастная тёмная', exact: true }).check();
  await dialog.getByRole('button', { name: 'Готово', exact: true }).click();
  await expect(page.locator('.seasonal-decor')).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Настройки отображения', exact: true }).click();
  await dialog.getByRole('radio', { name: 'Обычная', exact: true }).check();
  await dialog.getByRole('button', { name: 'Готово', exact: true }).click();
  await expect(page.locator('.seasonal-decor')).toBeVisible();
  await settleMotion(page);
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
    })),
  ).toEqual([]);
  await toggle.click();
  await expect(page.locator('.seasonal-decor')).toBeHidden();
  await page.reload();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});

test('сердечки центрированы в 44px кнопках и каталог не переполняется на узких экранах', async ({
  page,
}) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./');
    const favorite = page.getByRole('button', {
      name: 'В избранное: Электронный термометр',
      exact: true,
    });
    await expect(favorite).toBeEnabled();
    const geometry = await favorite.evaluate((el) => {
      const a = el.getBoundingClientRect(),
        b = el.querySelector('svg')!.getBoundingClientRect();
      return {
        width: a.width,
        height: a.height,
        dx: Math.abs(a.x + a.width / 2 - b.x - b.width / 2),
        dy: Math.abs(a.y + a.height / 2 - b.y - b.height / 2),
      };
    });
    expect(geometry.width).toBeGreaterThanOrEqual(44);
    expect(geometry.height).toBeGreaterThanOrEqual(44);
    expect(geometry.dx).toBeLessThan(0.6);
    expect(geometry.dy).toBeLessThan(0.6);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    for (const trigger of [
      page.getByRole('button', { name: 'Все категории', exact: true }),
      page.getByRole('button', { name: /Категории и фильтры/ }),
    ]) {
      await trigger.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
  }
});
