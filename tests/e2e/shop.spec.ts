import { expect, test } from '@playwright/test';
test('покупатель находит товар, сохраняет корзину и проходит демо-оформление', async ({ page }) => {
  await page.goto('./');
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeEnabled();
  await page.getByRole('textbox', { name: 'Поиск товаров' }).fill('термометр');
  await expect(page).toHaveURL(/q=/);
  await page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }).click();
  await page.getByRole('link', { name: 'Корзина, товаров: 1' }).click();
  await expect(page).toHaveURL(/\/cart\/?$/);
  await expect(page.getByRole('heading', { name: 'Корзина', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Электронный термометр' })).toBeVisible();
  await page.getByRole('link', { name: 'К оформлению' }).click();
  await page.getByRole('button', { name: 'Завершить демо-оформление' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Подтвердите' })).toBeVisible();
  await page
    .getByRole('checkbox', { name: 'Я понимаю, что это учебный сценарий без реального заказа' })
    .check();
  await page.getByRole('button', { name: 'Завершить демо-оформление' }).click();
  await expect(page.getByText('Демонстрация завершена')).toBeVisible();
});
test('смена аптеки блокирует недоступный товар, а возврат восстанавливает оформление', async ({
  page,
}) => {
  await page.goto('./products/gentle-cleanser');
  await page
    .getByRole('button', { name: 'В корзину: Гель для бережного очищения', exact: true })
    .click();
  await page.getByRole('link', { name: 'Перейти в корзину' }).click();
  await page.getByRole('button', { name: 'Выбрать аптеку' }).first().click();
  await page.getByRole('radio', { name: /У парка/ }).check();
  await page.getByRole('button', { name: 'Готово', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Исправьте наличие товаров' })).toBeDisabled();
  await expect(page.getByText('Проверьте наличие в выбранной аптеке')).toBeVisible();
  await page.getByRole('button', { name: 'Выбрать аптеку' }).first().click();
  await page.getByRole('radio', { name: /Центральная/ }).check();
  await page.getByRole('button', { name: 'Готово', exact: true }).click();
  await expect(page.getByRole('link', { name: 'К оформлению' })).toBeEnabled();
});
test('категория живёт в URL и восстанавливается кнопкой назад', async ({ page }) => {
  await page.goto('./');
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeEnabled();
  if (page.viewportSize()!.width < 600)
    await page.getByRole('button', { name: /Категории и фильтры/ }).click();
  await page.getByRole('button', { name: /Медтехника/ }).click();
  if (page.viewportSize()!.width < 600)
    await page.getByRole('button', { name: 'Показать товары', exact: true }).click();
  await expect(page).toHaveURL(/category=/);
  await expect(page.getByRole('heading', { name: 'Медтехника', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).not.toHaveURL(/category=/);
  await expect(page.getByRole('heading', { name: 'Для вас и ваших близких' })).toBeVisible();
});
test('клавиатурный вход доступен, консоль не содержит ошибок hydration', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeEnabled();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Перейти к содержимому' })).toBeFocused();
  expect(errors).toEqual([]);
});
test('пустая выдача сбрасывается и layout помещается в экран', async ({ page }, testInfo) => {
  await page.goto('./?q=несуществующийтовар');
  await expect(page.getByText('По вашему запросу ничего не нашлось')).toBeVisible();
  await page.getByRole('button', { name: 'Показать все товары' }).click();
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: `docs/screenshots/catalog-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
test('ошибка API локальна, товары сохраняются, повтор восстанавливает выдачу', async ({ page }) => {
  await page.goto('./');
  const add = page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true });
  await expect(add).toBeEnabled();
  await page.getByText('Проверить поведение интерфейса', { exact: true }).click();
  await page.getByRole('combobox', { name: 'Режим сети' }).click();
  await page.getByText('Ошибка API', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Поиск товаров' }).fill('термометр');
  await expect(page.getByText('Не удалось обновить каталог')).toBeVisible();
  await expect(add).toBeDisabled();
  await page.getByRole('button', { name: 'Повторить', exact: true }).click();
  await expect(page.getByText('Не удалось обновить каталог')).toBeVisible();
  await page.getByRole('combobox', { name: 'Режим сети' }).click();
  await page.getByText('Обычная сеть', { exact: true }).click();
  await expect(add).toBeEnabled();
});

test('статическая карточка открывается напрямую и после обновления', async ({ page }) => {
  await page.goto('./products/digital-thermometer/');
  await expect(
    page.getByRole('heading', { name: 'Электронный термометр', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeEnabled();
});
