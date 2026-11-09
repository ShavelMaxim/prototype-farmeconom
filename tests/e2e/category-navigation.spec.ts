import { test, expect } from '@playwright/test';

test.setTimeout(60000);
const childrenQuery = '?category=' + encodeURIComponent('Для детей');
async function readyCategory(
  page: import('@playwright/test').Page,
  category: string,
  count: number,
) {
  await expect(page.locator('#catalog-results')).toHaveText(category);
  await expect(page.locator('article')).toHaveCount(count);
  await expect(page.getByRole('group', { name: 'Товары каталога', exact: true })).toHaveAttribute(
    'aria-busy',
    'false',
  );
}

test('ссылка «Каталог» очищает категорию после прямого входа, Back/Forward восстанавливают выдачу', async ({
  page,
}, testInfo) => {
  await page.goto('./' + childrenQuery);
  await readyCategory(page, 'Для детей', 6);
  const navigation = page.getByRole('navigation', {
    name: testInfo.project.name === 'mobile' ? 'Мобильная навигация' : 'Основная навигация',
    exact: true,
  });
  await navigation.getByRole('link', { name: 'Каталог', exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.has('category')).toBe(false);
  await readyCategory(page, 'Для вас и ваших близких', 12);
  await page.goBack();
  await readyCategory(page, 'Для детей', 6);
  await page.goForward();
  await readyCategory(page, 'Для вас и ваших близких', 12);
});

test('плитки разделов обновляют URL, товары и выбранный фильтр с главной и прямой ссылки', async ({
  page,
}) => {
  // Exercise desktop tiles with both mouse and touch browser profiles.
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const query of ['', childrenQuery]) {
    await page.goto('./' + query);
    await readyCategory(page, query ? 'Для детей' : 'Для вас и ваших близких', query ? 6 : 12);
    const navigation = page.getByRole('navigation', { name: 'Популярные разделы', exact: true });
    for (const [category, count] of [
      ['Медтехника', 5],
      ['Уход и гигиена', 10],
      ['Для детей', 6],
    ] as const) {
      await navigation.getByRole('link', { name: category, exact: true }).click();
      await expect.poll(() => new URL(page.url()).searchParams.get('category')).toBe(category);
      await readyCategory(page, category, count);
      await expect(
        page
          .getByRole('complementary', { name: 'Фильтры каталога', exact: true })
          .getByRole('button', { name: new RegExp('^' + category) }),
      ).toHaveAttribute('aria-pressed', 'true');
    }
    await page.goBack();
    await readyCategory(page, 'Уход и гигиена', 10);
    await page.goForward();
    await readyCategory(page, 'Для детей', 6);
    await page.reload();
    await readyCategory(page, 'Для детей', 6);
  }
});
