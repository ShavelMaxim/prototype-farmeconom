import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';

const [label = 'before', url = 'http://127.0.0.1:3100/prototype-farmeconom/'] =
  process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1.75,
    isMobile: true,
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const session = await page.context().newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.setCacheDisabled', { cacheDisabled: true });
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.startupTasks = [];
    new PerformanceObserver((list) =>
      window.startupTasks.push(
        ...list.getEntries().map(({ startTime, duration }) => ({ startTime, duration })),
      ),
    ).observe({ type: 'longtask', buffered: true });
    const observer = new MutationObserver(() => {
      if (
        document
          .querySelector('button[aria-label="В корзину: Электронный термометр"]')
          ?.matches(':enabled')
      ) {
        performance.mark('shop:ready');
        observer.disconnect();
      }
    });
    observer.observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['disabled'],
    });
  });
  await page.goto(url, { waitUntil: 'commit' });
  await page.waitForFunction(() => performance.getEntriesByName('shop:ready').length > 0);
  const readyMs = await page.evaluate(
    () => performance.getEntriesByName('shop:ready')[0].startTime,
  );
  const search = page.getByRole('combobox', { name: 'Поиск товаров' });
  const interactionStart = await page.evaluate(() => performance.now());
  await search.fill('термометр');
  await expect(search).toHaveValue('термометр');
  const valueMs = (await page.evaluate(() => performance.now())) - interactionStart;
  await expect(page.getByRole('status').filter({ hasText: 'Найдено товаров:' })).toHaveText(
    'Найдено товаров: 2. Цены и наличие обновлены',
    { timeout: 15000 },
  );
  await expect(page.locator('article')).toHaveCount(2);
  const resultsMs = (await page.evaluate(() => performance.now())) - interactionStart;
  await page.getByRole('button', { name: 'В корзину: Электронный термометр', exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Электронный термометр: в корзине 1 шт.' }),
  ).toBeVisible();
  const dialogStart = await page.evaluate(() => performance.now());
  await page.getByRole('button', { name: 'Выбрать аптеку', exact: true }).click();
  await page.getByRole('radio', { name: /У парка/ }).check();
  const dialogFromNavigationMs = await page.evaluate(() => performance.now());
  const dialogMs = dialogFromNavigationMs - dialogStart;
  await page.keyboard.press('Escape');
  const tasks = await page.evaluate(() =>
    window.startupTasks.filter(
      (entry) => entry.startTime < performance.getEntriesByName('shop:ready')[0].startTime,
    ),
  );
  const result = {
    label,
    url,
    cpuSlowdown: 4,
    readyMs,
    valueMs,
    resultsMs,
    dialogMs,
    dialogFromNavigationMs,
    tasks,
    blockingBeforeReadyMs: tasks.reduce(
      (total, task) => total + Math.max(0, task.duration - 50),
      0,
    ),
    errors,
  };
  fs.mkdirSync('docs/performance/round3', { recursive: true });
  fs.writeFileSync(
    `docs/performance/round3/${label}.interaction.json`,
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
