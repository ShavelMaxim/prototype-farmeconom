'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { Provider, useStore } from 'react-redux';
import { makeStore, type AppStore } from './store';
import type { CatalogResponse } from '@/entities/product/model';
import { restore } from '@/entities/cart/model';
const STORAGE_KEY = 'apteka-ryadom:cart:v1';
const useAppStore = useStore.withTypes<AppStore>();
function CartPersistence() {
  const store = useAppStore();
  useEffect(() => {
    let saved: unknown = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    } catch {
      /* Empty state is a safe fallback. */
    }
    store.dispatch(restore(saved));
    let previousCart = store.getState().cart;
    return store.subscribe(() => {
      const currentCart = store.getState().cart;
      if (currentCart === previousCart) return;
      previousCart = currentCart;
      const { items, pharmacy, hydrated } = currentCart;
      if (hydrated)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, pharmacy }));
        } catch {
          /* Storage may be disabled; session state still works. */
        }
    });
  }, [store]);
  return null;
}
export function Providers({
  children,
  initialCatalog,
}: {
  children: ReactNode;
  initialCatalog?: CatalogResponse;
}) {
  // Keep the initial snapshot stable: persisted state may arrive before a streamed
  // product subtree hydrates. React Redux must hydrate against the server HTML.
  const [{ store, serverState }] = useState(() => {
    const store = makeStore(initialCatalog);
    return { store, serverState: store.getState() };
  });
  return (
    <Provider store={store} serverState={serverState}>
      {children}
      <CartPersistence />
    </Provider>
  );
}
