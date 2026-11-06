// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { POST } from '../../../app/api/demo-checkout/route';
const request = (body: unknown) =>
  new Request('http://localhost/api/demo-checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
describe('API оформления', () => {
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
