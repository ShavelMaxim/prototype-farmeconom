import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'node:fs';
const [label = 'local', url = 'http://127.0.0.1:3103/prototype-farmeconom/', count = '3'] =
  process.argv.slice(2);
if (
  !/^[a-z0-9-]+$/.test(label) ||
  !['http:', 'https:'].includes(new URL(url).protocol) ||
  !/^[1-5]$/.test(count)
)
  throw new Error('Invalid measurement arguments');
const directory = 'docs/performance/ux-expansion';
fs.mkdirSync(directory, { recursive: true });
for (let i = 1; i <= Number(count); i++) {
  const chrome = await launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const { lhr } = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });
    fs.writeFileSync(`${directory}/${label}-${i}.json`, JSON.stringify(lhr));
    console.log(
      JSON.stringify({
        run: i,
        scores: Object.fromEntries(
          Object.entries(lhr.categories).map(([key, value]) => [
            key,
            Math.round(value.score * 100),
          ]),
        ),
        lcp: lhr.audits['largest-contentful-paint'].numericValue,
        tbt: lhr.audits['total-blocking-time'].numericValue,
        cls: lhr.audits['cumulative-layout-shift'].numericValue,
      }),
    );
  } finally {
    await chrome.kill();
  }
}
