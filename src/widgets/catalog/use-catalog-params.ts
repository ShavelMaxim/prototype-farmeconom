'use client';
import { useEffect, useRef, useState } from 'react';
import { facetKeys } from '@/entities/product/facets';
import type { CatalogQuery } from '@/entities/product/model';
import { CATALOG_URL_CHANGE } from './use-catalog-search';
export function useCatalogParams(query: CatalogQuery) {
  const [draft, setDraft] = useState(query.q);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<string | null>(null);
  function update(values: Record<string, string>, replace = false) {
    const params = new URLSearchParams(window.location.search);
    if (Object.keys(values).some((key) => key !== 'page')) params.delete('page');
    Object.entries(values).forEach(([key, value]) =>
      value ? params.set(key, value) : params.delete(key),
    );
    const url = `${window.location.pathname}${params.size ? `?${params}` : ''}`;
    if (url === `${window.location.pathname}${window.location.search}`) return;
    if (replace) window.history.replaceState(null, '', url);
    else window.history.pushState(null, '', url);
    window.dispatchEvent(new Event(CATALOG_URL_CHANGE));
  }
  useEffect(() => {
    // An older URL update must not overwrite a newer draft or cancel its debounce.
    if (pending.current !== null && pending.current !== query.q) return;
    pending.current = null;
    setDraft(query.q);
  }, [query.q]);
  useEffect(() => {
    function restoreFromHistory() {
      if (timer.current) clearTimeout(timer.current);
      pending.current = null;
      setDraft(new URLSearchParams(window.location.search).get('q') || '');
    }
    window.addEventListener('popstate', restoreFromHistory);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener('popstate', restoreFromHistory);
    };
  }, []);
  function searchChanged(value: string) {
    pending.current = value.trim();
    setDraft(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => update({ q: value.trim() }, true), 300);
  }
  function reset() {
    if (timer.current) clearTimeout(timer.current);
    pending.current = null;
    setDraft('');
    update({
      q: '',
      category: '',
      available: '',
      sort: '',
      ...Object.fromEntries(facetKeys.map((key) => [key, ''])),
    });
  }
  return {
    draft,
    searchChanged,
    reset,
    update,
    cancelPendingSearch() {
      if (timer.current) clearTimeout(timer.current);
      pending.current = null;
    },
    submitSearch() {
      if (timer.current) clearTimeout(timer.current);
      pending.current = draft.trim();
      update({ q: draft.trim() });
    },
  };
}
