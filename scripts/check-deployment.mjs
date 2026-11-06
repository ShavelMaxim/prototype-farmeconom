import assert from 'node:assert/strict';

// Run only against this portfolio demo: the last request exercises its mock checkout.
const target = process.argv[2];
assert(target, 'Usage: npm run check:deployment -- https://your-demo.vercel.app');
const origin = new URL(target);
assert(['http:', 'https:'].includes(origin.protocol), 'HTTP(S) URL required');
assert(!origin.username && !origin.password, 'Do not pass credentials in the URL');

async function request(path, status = 200, options = {}) {
  const response = await fetch(new URL(path, origin), {
    ...options,
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.status, status, `${path}: unexpected HTTP status`);
  console.log(`OK ${status} ${path}`);
  return response;
}

for (const path of ['/', '/products/digital-thermometer', '/cart', '/checkout', '/about']) {
  const response = await request(path);
  assert.match(response.headers.get('content-type') || '', /text\/html/);
  assert.match(await response.text(), /Аптека рядом/, `${path}: expected demo page`);
}
await request('/products/unknown-demo-product', 404);
const catalog = await (await request('/api/products?pharmacy=central')).json();
assert.equal(catalog.total, 24);
const product = catalog.items.find((item) => item.slug === 'digital-thermometer');
assert(product?.offers.central.stock > 0);
const search = await (await request('/api/products?q=' + encodeURIComponent('термометр'))).json();
assert(search.total > 0 && search.total < catalog.total);
assert(search.items.some((item) => item.id === product.id));
assert(search.items.every((item) => item.name.toLocaleLowerCase('ru-RU').includes('термометр')));
await request('/api/products?pharmacy=unknown', 400);
await request('/api/products?demo=error', 503);
const checkout = await (
  await request('/api/demo-checkout', 200, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pharmacy: 'central',
      pickup: 'today',
      acknowledge: true,
      items: [{ id: product.id, quantity: 1 }],
    }),
  })
).json();
assert.match(checkout.reference, /^DEMO-/);
assert.equal(checkout.total, product.offers.central.price);
assert.equal(checkout.count, 1);
console.log('Deployment smoke check passed. No real order was created.');
