import fs from 'node:fs';
import { chromium } from '@playwright/test';

const [label = 'before', url = 'http://127.0.0.1:3100/prototype-farmeconom/'] =
  process.argv.slice(2);
const destination = 'docs/performance/round3';
fs.mkdirSync(destination, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1.75,
    isMobile: true,
  });
  const session = await page.context().newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.setCacheDisabled', { cacheDisabled: true });
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      const button = document.querySelector(
        'button[aria-label="В корзину: Электронный термометр"]',
      );
      if (button?.matches(':enabled')) {
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
  await page.coverage.startJSCoverage({ resetOnNavigation: true });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page
    .getByRole('button', { name: 'В корзину: Электронный термометр', exact: true })
    .waitFor();
  await page.waitForFunction(() => performance.getEntriesByName('shop:ready').length > 0);
  const readyMs = await page.evaluate(
    () => performance.getEntriesByName('shop:ready')[0].startTime,
  );
  const coverage = await page.coverage.stopJSCoverage();
  const entries = coverage
    .filter((entry) => entry.source && entry.url.startsWith(new URL(url).origin))
    .map(({ url, source, functions }) => {
      const ranges = functions.flatMap((fn) => fn.ranges);
      const positions = [
        ...new Set(ranges.flatMap((range) => [range.startOffset, range.endOffset])),
      ].sort((a, b) => a - b);
      let usedBytes = 0;
      for (let index = 0; index < positions.length - 1; index++) {
        const start = positions[index],
          end = positions[index + 1];
        // An inner unexecuted function/block overrides its executed outer script.
        const inner = ranges
          .filter((r) => r.startOffset <= start && r.endOffset >= end)
          .sort((a, b) => a.endOffset - a.startOffset - (b.endOffset - b.startOffset))[0];
        if (inner?.count > 0) usedBytes += Buffer.byteLength(source.slice(start, end));
      }
      return { url, totalBytes: Buffer.byteLength(source), usedBytes, functions };
    });
  const summary = {
    label,
    url,
    cpuSlowdown: 4,
    readyMs,
    totalBytes: entries.reduce((total, entry) => total + entry.totalBytes, 0),
    usedBytes: entries.reduce((total, entry) => total + entry.usedBytes, 0),
    scripts: entries
      .map(({ url, totalBytes, usedBytes }) => ({ url, totalBytes, usedBytes }))
      .sort((a, b) => b.totalBytes - a.totalBytes),
  };
  fs.writeFileSync(
    `${destination}/${label}.coverage.json`,
    JSON.stringify({ summary, entries }, null, 2),
  );
  console.log(JSON.stringify(summary));
} finally {
  await browser.close();
}
