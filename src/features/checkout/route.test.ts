// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { demoCheckout as POST } from './demo-checkout';
const request = (body: unknown) =>
  new Request('http://localhost/api/demo-checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
describe('Демонстрационное оформление', () => {
  const valid = {
    pickup: 'today',
    acknowledge: true,
    pharmacy: 'central',
    items: [{ id: 'product-1', quantity: 1 }],
  };
  it('пересчитывает сумму и не доверяет цене клиента', async () => {
    const response = await POST(request({ ...valid, total: 1 }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ total: 42900, count: 1 });
  });
  it('возвращает 409 для отсутствующего в аптеке товара', async () => {
    const response = await POST(request({ ...valid, pharmacy: 'park' }));
    expect(response.status).toBe(409);
  });
  it('возвращает 400 для некорректного JSON', async () => {
    expect(
      (await POST(new Request('http://localhost', { method: 'POST', body: '{broken' }))).status,
    ).toBe(400);
  });
});
