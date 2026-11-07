import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settleMotion } from './settle-motion';
test.setTimeout(60000);

test('геометрия шапки и начала страницы совпадает до и после гидратации', async ({
  page,
  browser,
  baseURL,
}, testInfo) => {
  const withoutJS = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: page.viewportSize()!,
    deviceScaleFactor: 1,
    isMobile: testInfo.project.name === 'mobile',
    hasTouch: testInfo.project.name === 'mobile',
    userAgent: await page.evaluate(() => navigator.userAgent),
  });
  const geometry = async (target: typeof page) => ({
    headerHeight: (await target.locator('header').boundingBox())!.height,
    mainTop: (await target.locator('main').boundingBox())!.y,
  });
  try {
    const staticPage = await withoutJS.newPage();
    await staticPage.goto('./');
    const initial = await geometry(staticPage);
    await page.goto('./');
    await expect(
      page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
    ).toBeEnabled();
    expect(await geometry(page)).toEqual(initial);
  } finally {
    await withoutJS.close();
  }
});

test('начальный JavaScript укладывается в бюджет до открытия диалогов', async ({ page }) => {
  const downloads: Promise<number>[] = [];
  page.on('response', (response) => {
    if (new URL(response.url()).pathname.endsWith('.js')) {
      downloads.push(response.body().then((body) => body.byteLength));
    }
  });
  await page.goto('./', { waitUntil: 'networkidle' });
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeEnabled();
  const sizes = await Promise.all(downloads);
  expect(sizes.length).toBeGreaterThan(0);
  expect(sizes.reduce((total, size) => total + size, 0)).toBeLessThan(750000);
});

test('загрузка диалога видима и не меняет высоту шапки', async ({ page }) => {
  await page.goto('./');
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeEnabled();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/_next/static/chunks/*.js', async (route) => {
    await gate;
    await route.continue();
  });
  const before = (await page.locator('header').boundingBox())!.height;
  try {
    await page.getByRole('button', { name: 'Выбрать аптеку', exact: true }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Открываем выбор аптеки…' }),
    ).toBeVisible();
    expect((await page.locator('header').boundingBox())!.height).toBe(before);
  } finally {
    release();
  }
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Открываем выбор аптеки…' })).toHaveCount(
    0,
  );
});

test('сетка добавляет правильный товар через иконку и клавиатуру и сохраняет максимум', async ({
  page,
}) => {
  await page.goto('./');
  const first = page
    .locator('article')
    .filter({
      has: page.getByRole('heading', { name: 'Гель для бережного очищения', exact: true }),
    })
    .locator('button[data-product-id]');
  await expect(first).toBeEnabled();
  await first.locator('svg').click();
  await expect(first).toContainText('В корзине 1');
  await first.focus();
  await page.keyboard.press('Space');
  await expect(first).toBeDisabled();
  await expect(first).toContainText('В корзине 2 · максимум');
  await page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 3', exact: true })).toBeVisible();
  await page.reload();
  await expect(first).toBeDisabled();
  await expect(first).toContainText('В корзине 2 · максимум');
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 3', exact: true })).toBeVisible();
});

test('Escape отменяет загрузку фильтров без позднего появления панели', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await expect(
    page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }),
  ).toBeEnabled();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/_next/static/chunks/*.js', async (route) => {
    await gate;
    await route.continue();
  });
  const trigger = page.getByRole('button', { name: /Категории и фильтры/ });
  try {
    await trigger.click();
    await expect(page.getByRole('status').filter({ hasText: 'Открываем фильтры…' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  } finally {
    release();
  }
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('первый поиск и добавление работают сразу после готовности кнопки', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const add = page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true });
  await expect(add).toBeEnabled();
  await page.getByRole('textbox', { name: 'Поиск товаров' }).fill('термометр');
  await expect(page.getByRole('status').filter({ hasText: 'Найдено товаров:' })).toHaveText(
    'Найдено товаров: 2. Цены и наличие обновлены',
  );
  await expect(page.locator('article')).toHaveCount(2);
  await add.click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Электронный термометр: в корзине 1 шт.' }),
  ).toBeVisible();
});

test('сортировка доступна с клавиатуры и восстанавливается через Back', async ({ page }) => {
  await page.goto('./');
  const sort = page.getByRole('combobox', { name: 'Сортировка товаров' });
  await sort.selectOption('price-asc');
  await expect(page).toHaveURL(/sort=price-asc/);
  await sort.focus();
  await page.keyboard.press('End');
  await expect(sort).toHaveValue('name');
  await expect(page).toHaveURL(/sort=name/);
  await page.goBack();
  await expect(sort).toHaveValue('price-asc');
  await expect(page).toHaveURL(/sort=price-asc/);
});

test('прокрутка каталога сохраняет размер упаковки и доступность последнего товара', async ({
  page,
}) => {
  await page.goto('./');
  const card = page.locator('article').last();
  await expect(page.locator('article')).toHaveCount(44);
  // The decorative subtree may be skipped offscreen, but its fixed box must remain.
  const scene = card.locator('a > div[aria-hidden="true"]').first();
  const before = await scene.evaluate((element) => element.getBoundingClientRect().height);
  await card.scrollIntoViewIfNeeded();
  await expect(card.getByRole('heading')).toBeVisible();
  await expect(card.locator('button[data-product-id]')).toBeEnabled();
  expect(await scene.evaluate((element) => element.getBoundingClientRect().height)).toBe(before);
  expect(before).toBe(198);
  await card.locator('button[data-product-id]').focus();
  await page.keyboard.press('Enter');
  await expect(card.locator('button[data-product-id]')).toContainText('В корзине');
});

test('клавиатура: возврат фокуса из диалога и доступное оформление', async ({ page }) => {
  await page.goto('./products/digital-thermometer/');
  const choose = page.getByRole('button', { name: 'Выбрать аптеку', exact: true }).first();
  await choose.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Где вам удобно');
  await settleMotion(page);
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
  await settleMotion(page);
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
  await settleMotion(page);
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
  await expect(page.getByText('2 товара · аптека «У парка»')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Крем для рук без отдушки', exact: true }),
  ).toHaveCount(0);
});
