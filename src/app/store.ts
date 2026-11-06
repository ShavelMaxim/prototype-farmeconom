import { configureStore } from '@reduxjs/toolkit';
import { cartReducer } from '@/entities/cart/model';
import { baseApi } from '@/shared/api/base-api';
import { catalogApi } from '@/entities/product/api';
import { catalogQuerySchema } from '@/entities/product/model';
import { getCatalog } from '@/entities/product/repository';
export function makeStore() {
  const store = configureStore({
    reducer: { cart: cartReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  });
  // Demo data is already available at build time. Start with the same cache on
  // server and client instead of rendering 24 buttons through a fake cold fetch.
  // Live HTTP mode must obtain and validate current prices; never seed it.
  if (!process.env.NEXT_PUBLIC_API_URL) {
    const query = catalogQuerySchema.parse({});
    const data = getCatalog(query);
    store.dispatch(
      catalogApi.util.upsertQueryEntries([
        { endpointName: 'getInventory', arg: undefined, value: data },
        { endpointName: 'getCatalog', arg: { ...query, demo: 'normal' }, value: data },
      ]),
    );
  }
  return store;
}
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
