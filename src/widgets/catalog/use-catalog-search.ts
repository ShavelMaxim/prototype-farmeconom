'use client';
import { useSyncExternalStore } from 'react';
export const CATALOG_URL_CHANGE = 'catalog-url-change';
function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(CATALOG_URL_CHANGE, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(CATALOG_URL_CHANGE, onChange);
  };
}
// Static export cannot know the query string at build time. Hydrate the known
// default catalog, then reconcile with the browser URL without a CSR bailout.
export function useCatalogSearch() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  );
}
