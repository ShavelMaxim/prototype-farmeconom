'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CATALOG_URL_CHANGE } from './use-catalog-search';

// Next Link navigation does not emit popstate or our native filter event.
// Keep this URL-only observer inside its own empty Suspense boundary so the
// actual catalog remains in the static HTML instead of opting into CSR.
export function CatalogUrlObserver() {
  const params = useSearchParams();
  const query = params.toString();
  useEffect(() => {
    window.dispatchEvent(new Event(CATALOG_URL_CHANGE));
  }, [query]);
  return null;
}
