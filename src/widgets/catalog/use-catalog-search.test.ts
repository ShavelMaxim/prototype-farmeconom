import { afterEach, expect, it } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useCatalogSearch, CATALOG_URL_CHANGE } from './use-catalog-search';
afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});
it('синхронизирует query по собственному событию и Back/Forward', () => {
  const { result } = renderHook(useCatalogSearch);
  expect(result.current).toBe('');
  act(() => {
    window.history.pushState(null, '', '/?q=cream');
    window.dispatchEvent(new Event(CATALOG_URL_CHANGE));
  });
  expect(result.current).toBe('?q=cream');
  act(() => {
    window.history.replaceState(null, '', '/?q=soap');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(result.current).toBe('?q=soap');
});
