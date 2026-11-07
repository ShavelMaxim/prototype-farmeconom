import { chromium } from '@playwright/test';
import fs from 'node:fs';
const [label = 'render-before', url = 'http://127.0.0.1:3103/prototype-farmeconom/'] =
  process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label)) throw new Error('Invalid label');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({
      viewport: { width: 412, height: 823 },
      isMobile: true,
      deviceScaleFactor: 1.75,
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cdp.send('Performance.enable');
    const start = Date.now();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() =>
      document.querySelector('button[data-product-id="product-2"]')?.matches(':enabled'),
    );
    const readyMs = Date.now() - start;
    const metrics = Object.fromEntries(
      (await cdp.send('Performance.getMetrics')).metrics.map(({ name, value }) => [name, value]),
    );
    const dom = await cdp.send('Memory.getDOMCounters');
    const report = {
      label,
      run,
      url,
      readyMs,
      cards: await page.locator('article').count(),
      metrics,
      dom,
    };
    fs.writeFileSync(`docs/performance/ux-expansion/${label}-${run}.json`, JSON.stringify(report));
    console.log(
      JSON.stringify({
        run,
        readyMs,
        cards: report.cards,
        nodes: dom.nodes,
        scriptMs: metrics.ScriptDuration * 1000,
        layoutMs: metrics.LayoutDuration * 1000,
        taskMs: metrics.TaskDuration * 1000,
      }),
    );
    await context.close();
  }
} finally {
  await browser.close();
}
