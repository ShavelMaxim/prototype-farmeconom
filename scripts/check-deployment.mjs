import assert from 'node:assert/strict';
const target = process.argv[2];
assert(target, 'Usage: npm run check:deployment -- https://owner.github.io/repository/');
const base = new URL(target.endsWith('/') ? target : `${target}/`);
assert(['http:', 'https:'].includes(base.protocol));
assert(!base.username && !base.password);
for (const route of [
  '',
  'products/digital-thermometer/',
  'products/demo-tablets-a/',
  'cart/',
  'checkout/',
  'favorites/',
  'orders/',
  'about/',
]) {
  const url = new URL(route, base);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${url}: HTTP status`);
  const html = await response.text();
  assert.match(html, /Аптека рядом/);
  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css)(?:\?[^"]*)?)"/g)].map(
    (match) => new URL(match[1].replaceAll('&amp;', '&'), url),
  );
  assert(assets.length > 0, 'No JS/CSS assets');
  for (const asset of assets) {
    assert(asset.pathname.startsWith(base.pathname), `Asset outside base path: ${asset}`);
    const result = await fetch(asset, { signal: AbortSignal.timeout(30000) });
    assert.equal(result.status, 200, `Asset unavailable: ${asset}`);
    assert(!result.headers.get('content-type')?.includes('text/html'), 'Asset returned HTML');
  }
  console.log(`OK ${url.pathname} and ${assets.length} assets`);
}
const missing = await fetch(new URL('products/unknown-demo-product/', base));
assert.equal(missing.status, 404);
console.log('Static deployment smoke check passed.');
