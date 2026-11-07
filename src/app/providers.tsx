'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { Provider, useStore } from 'react-redux';
import { makeStore, type AppStore } from './store';
import type { CatalogResponse } from '@/entities/product/model';
import { restore } from '@/entities/cart/model';
import { PERSONAL_KEY, restorePersonal, markStorageUnavailable } from '@/entities/personal/model';
const STORAGE_KEY = 'apteka-ryadom:cart:v1';
const useAppStore = useStore.withTypes<AppStore>();
function CartPersistence() {
  const store = useAppStore();
  useEffect(() => {
    let personal: unknown = null;
    let storageUnavailable = false;
    let personalJson: string | null = null;
    try {
      personalJson = localStorage.getItem(PERSONAL_KEY);
    } catch {
      storageUnavailable = true;
    }
    try {
      personal = JSON.parse(personalJson ?? 'null');
    } catch {
      /* A later change replaces malformed JSON with validated data. */
    }
    store.dispatch(restorePersonal(personal));
    if (storageUnavailable) store.dispatch(markStorageUnavailable());
    let saved: unknown = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    } catch {
      /* Empty state is a safe fallback. */
    }
    store.dispatch(restore(saved));
    let previousCart = store.getState().cart;
    let previousPersonal = store.getState().personal;
    function applyDisplay() {
      const { display } = store.getState().personal;
      const root = document.documentElement;
      root.dataset.scale = display.scale;
      root.dataset.contrast = display.contrast;
      root.dataset.spacing = String(display.spacing);
      root.dataset.motion = display.reducedMotion ? 'reduce' : 'system';
    }
    applyDisplay();
    return store.subscribe(() => {
      const nextPersonal = store.getState().personal;
      if (nextPersonal !== previousPersonal) {
        const changed = previousPersonal.display !== nextPersonal.display;
        previousPersonal = nextPersonal;
        if (changed) applyDisplay();
        if (nextPersonal.hydrated && !nextPersonal.storageUnavailable)
          try {
            const { favorites, orders, display } = nextPersonal;
            localStorage.setItem(PERSONAL_KEY, JSON.stringify({ favorites, orders, display }));
          } catch {
            store.dispatch(markStorageUnavailable());
          }
      }
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
