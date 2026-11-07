import { expect, test } from '@playwright/test';
test.use({ javaScriptEnabled: false });
test('статический HTML содержит настоящий каталог до запуска JavaScript', async ({ page }) => {
  await page.goto('./');
  await expect(
    page.getByRole('heading', { name: 'Для вас и ваших близких', exact: true }),
  ).toBeVisible();
  await expect(page.locator('article')).toHaveCount(24);
  await expect(page.getByRole('combobox', { name: 'Сортировка товаров' })).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('heading', { name: 'Электронный термометр', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('status', { name: 'Загружаем каталог' })).toHaveCount(0);
});
