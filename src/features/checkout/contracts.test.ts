// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});
it('некорректный успешный ответ оформления становится ошибкой, корзина сохраняется', async () => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://example.test/api/');
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ reference: 'broken', total: -5, count: 1 })),
  );
  const { makeStore } = await import('@/app/store');
  const { restore } = await import('@/entities/cart/model');
  const { checkoutApi } = await import('./api');
  const store = makeStore();
  store.dispatch(restore({ pharmacy: 'central', items: [{ id: 'product-1', quantity: 1 }] }));
  try {
    const result = await store.dispatch(
      checkoutApi.endpoints.checkout.initiate({
        pharmacy: 'central',
        pickup: 'today',
        acknowledge: true,
        items: store.getState().cart.items,
      }),
    );
    expect(result.error).toMatchObject({ status: 'CUSTOM_ERROR', error: 'VALIDATION_ERROR' });
    expect(store.getState().cart.items).toHaveLength(1);
  } finally {
    store.dispatch(checkoutApi.util.resetApiState());
  }
});
