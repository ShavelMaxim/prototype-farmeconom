'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { Provider, useStore } from 'react-redux';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { makeStore, type AppStore } from './store';
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
export function Providers({ children }: { children: ReactNode }) {
  // Keep the initial snapshot stable: persisted state may arrive before a streamed
  // product subtree hydrates. React Redux must hydrate against the server HTML.
  const [{ store, serverState }] = useState(() => {
    const store = makeStore();
    return { store, serverState: store.getState() };
  });
  return (
    <Provider store={store} serverState={serverState}>
      <ConfigProvider
        locale={ruRU}
        theme={{
          token: {
            colorPrimary: '#176b52',
            colorInfo: '#176b52',
            colorText: '#203c35',
            colorBgLayout: '#f7f8f3',
            borderRadius: 12,
            fontFamily: 'Arial, Helvetica, sans-serif',
            controlHeight: 44,
          },
          components: {
            Button: { fontWeight: 600, primaryShadow: 'none' },
            Input: { activeShadow: '0 0 0 3px #176b5218' },
          },
        }}
      >
        {children}
        <CartPersistence />
      </ConfigProvider>
    </Provider>
  );
}
