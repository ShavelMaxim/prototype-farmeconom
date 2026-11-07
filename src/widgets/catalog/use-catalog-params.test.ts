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
it('повторное применение тех же условий не добавляет запись в History', () => {
  window.history.replaceState(null, '', '/?category=Медтехника');
  const { result } = renderHook(() =>
    useCatalogParams(catalogQuerySchema.parse({ category: 'Медтехника' })),
  );
  const push = vi.spyOn(window.history, 'pushState');
  act(() => result.current.update({ category: 'Медтехника' }));
  // URLSearchParams canonicalizes the literal Cyrillic URL once.
  push.mockClear();
  act(() => result.current.update({ category: 'Медтехника' }));
  expect(push).not.toHaveBeenCalled();
  push.mockRestore();
});
it('смена условий сбрасывает раскрытие выдачи, а само раскрытие сохраняет поиск', () => {
  window.history.replaceState(null, '', '/?q=уход&page=2');
  const { result } = renderHook(() => useCatalogParams(catalogQuerySchema.parse({ q: 'уход' })));
  act(() => result.current.update({ page: '3' }));
  expect(new URLSearchParams(location.search).get('q')).toBe('уход');
  expect(new URLSearchParams(location.search).get('page')).toBe('3');
  act(() => result.current.update({ category: 'Уход и гигиена' }));
  expect(new URLSearchParams(location.search).has('page')).toBe(false);
});
