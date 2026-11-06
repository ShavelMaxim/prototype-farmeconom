import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { catalogQuerySchema } from '@/entities/product/model';
import { useCatalogParams } from './use-catalog-params';
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  window.history.replaceState(null, '', '/');
});
it('запоздавший URL не стирает новый черновик поиска и его debounce', () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(
    ({ q }) => useCatalogParams(catalogQuerySchema.parse({ q })),
    { initialProps: { q: '' } },
  );
  act(() => result.current.searchChanged('крем'));
  act(() => vi.advanceTimersByTime(300));
  act(() => result.current.searchChanged('термометр'));
  rerender({ q: 'крем' });
  expect(result.current.draft).toBe('термометр');
  act(() => vi.advanceTimersByTime(300));
  expect(new URLSearchParams(window.location.search).get('q')).toBe('термометр');
  act(() => window.dispatchEvent(new PopStateEvent('popstate')));
  expect(result.current.draft).toBe('термометр');
});
