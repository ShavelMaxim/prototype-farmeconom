// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { products } from './repository';
import { catalogQuerySchema } from './model';
import { catalogResponseSchema } from './contracts';
import { checkoutResponseSchema } from '@/features/checkout/model';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});
describe('граница данных', () => {
  it('отклоняет отрицательные цены, неполные предложения, дубли и неверный total', () => {
    const body = { items: structuredClone(products), total: products.length };
    expect(catalogResponseSchema.safeParse(body).success).toBe(true);
    body.items[0].offers.central.price = -1;
    expect(catalogResponseSchema.safeParse(body).success).toBe(false);
    expect(
      catalogResponseSchema.safeParse({ items: [products[0], products[0]], total: 2 }).success,
    ).toBe(false);
    expect(catalogResponseSchema.safeParse({ items: products, total: 100 }).success).toBe(false);
    expect(
      catalogResponseSchema.safeParse({ items: [{ ...products[0], offers: {} }], total: 1 })
        .success,
    ).toBe(false);
    expect(
      checkoutResponseSchema.safeParse({ reference: 'x', total: '429', count: 1 }).success,
    ).toBe(false);
  });
  it('каталог и общая выборка используют одну проверенную HTTP-версию цен', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://example.test/api/');
    const live = structuredClone(products);
    live[0].offers.central.price = 12345;
    const fetcher = vi.fn(async () => Response.json({ items: live, total: live.length }));
    vi.stubGlobal('fetch', fetcher);
    const { makeStore } = await import('@/app/store');
    const { catalogApi, inventoryApi } = await import('./api');
    const store = makeStore();
    try {
      const result = await store.dispatch(
        catalogApi.endpoints.getCatalog.initiate(catalogQuerySchema.parse({})),
      );
      expect(result.data?.items[0].offers.central.price).toBe(12345);
      expect(
        inventoryApi.endpoints.getInventory.select()(store.getState()).data?.items[0].offers.central
          .price,
      ).toBe(12345);
      expect(fetcher).toHaveBeenCalledTimes(1);
    } finally {
      store.dispatch(catalogApi.util.resetApiState());
    }
  });
  it('не подставляет встроенные цены при некорректном HTTP-ответе', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://example.test/api/');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ items: [{ id: 'broken' }], total: 1 })),
    );
    const { makeStore } = await import('@/app/store');
    const { inventoryApi } = await import('./api');
    const store = makeStore();
    try {
      const result = await store.dispatch(inventoryApi.endpoints.getInventory.initiate());
      expect(result.data).toBeUndefined();
      expect(result.error).toMatchObject({ status: 'CUSTOM_ERROR', error: 'VALIDATION_ERROR' });
    } finally {
      store.dispatch(inventoryApi.util.resetApiState());
    }
  });
});
