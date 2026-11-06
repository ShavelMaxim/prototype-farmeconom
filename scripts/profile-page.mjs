import { chromium } from '@playwright/test';
import { SourceMap } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [label = 'before', directory = 'out', url = 'http://127.0.0.1:3100/prototype-farmeconom/'] =
  process.argv.slice(2);
const destination = 'docs/performance/profiles';
fs.mkdirSync(destination, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1.75,
    isMobile: true,
  });
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.setCacheDisabled', { cacheDisabled: true });
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await session.send('Performance.enable');
  await session.send('Profiler.enable');
  await session.send('Profiler.setSamplingInterval', { interval: 1000 });
  await session.send('Tracing.start', {
    categories: 'devtools.timeline,blink.user_timing,v8',
    transferMode: 'ReturnAsStream',
  });
  await session.send('Profiler.start');
  await page.goto(url, { waitUntil: 'networkidle' });
  await page
    .getByRole('button', { name: 'В корзину: Электронный термометр', exact: true })
    .waitFor({ state: 'visible' });
  await page.waitForTimeout(1000);
  const { profile } = await session.send('Profiler.stop');
  const metrics = Object.fromEntries(
    (await session.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]),
  );
  const complete = new Promise((resolve) => session.once('Tracing.tracingComplete', resolve));
  await session.send('Tracing.end');
  const { stream } = await complete;
  let trace = '';
  for (;;) {
    const chunk = await session.send('IO.read', { handle: stream });
    trace += chunk.data;
    if (chunk.eof) break;
  }
  await session.send('IO.close', { handle: stream });
  fs.writeFileSync(`${destination}/${label}.trace.json`, trace);
  fs.writeFileSync(`${destination}/${label}.cpuprofile`, JSON.stringify(profile));
  const maps = new Map();
  const prefix = new URL(url).pathname;
  function original(frame) {
    if (!frame.url.startsWith(new URL(url).origin))
      return { source: frame.url || '(native)', name: frame.functionName };
    const file = path.join(directory, new URL(frame.url).pathname.slice(prefix.length));
    try {
      if (!maps.has(file))
        maps.set(
          file,
          new SourceMap(
            JSON.parse(
              fs.readFileSync(
                path.resolve(
                  path.dirname(file),
                  fs.readFileSync(file, 'utf8').match(/sourceMappingURL=([^\s]+)/)?.[1] ||
                    path.basename(file) + '.map',
                ),
                'utf8',
              ),
            ),
          ),
        );
      const entry = maps.get(file).findEntry(frame.lineNumber, frame.columnNumber);
      return {
        source: entry.originalSource || frame.url,
        name: entry.name || entry.originalName || frame.functionName,
        line: entry.originalLine,
      };
    } catch {
      return { source: frame.url, name: frame.functionName };
    }
  }
  const nodes = new Map(
    profile.nodes.map((n) => [n.id, { ...n, original: original(n.callFrame) }]),
  );
  for (const node of nodes.values())
    for (const child of node.children || []) nodes.get(child).parent = node.id;
  const self = new Map(),
    inclusive = new Map();
  for (let i = 0; i < profile.samples.length; i++) {
    const weight = profile.timeDeltas[i] / 1000;
    let node = nodes.get(profile.samples[i]);
    const key = `${node.original.source}:${node.original.line ?? ''} ${node.original.name}`;
    self.set(key, (self.get(key) || 0) + weight);
    const sources = new Set();
    while (node) {
      sources.add(node.original.source);
      node = nodes.get(node.parent);
    }
    for (const source of sources) inclusive.set(source, (inclusive.get(source) || 0) + weight);
  }
  const top = (map) =>
    [...map]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, ms]) => ({ name, ms: Math.round(ms) }));
  const timing = {};
  for (const e of JSON.parse(trace).traceEvents)
    if (['Layout', 'UpdateLayoutTree', 'Paint'].includes(e.name) && e.ph === 'X')
      timing[e.name] = (timing[e.name] || 0) + e.dur / 1000;
  const summary = {
    label,
    url,
    cpuSlowdown: 4,
    metrics,
    timing,
    topSelf: top(self),
    topInclusiveSources: top(inclusive),
  };
  fs.writeFileSync(`${destination}/${label}.summary.json`, JSON.stringify(summary, null, 2));
  console.log(
    JSON.stringify({
      label,
      ScriptDuration: metrics.ScriptDuration,
      TaskDuration: metrics.TaskDuration,
      timing,
      topSelf: summary.topSelf.slice(0, 12),
      topInclusiveSources: summary.topInclusiveSources.slice(0, 12),
    }),
  );
  await page.screenshot({ path: `${destination}/${label}.png` });
} finally {
  await browser.close();
}
