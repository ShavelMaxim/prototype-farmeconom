import { configureStore } from '@reduxjs/toolkit';
import { cartReducer } from '@/entities/cart/model';
import { baseApi } from '@/shared/api/base-api';
export function makeStore() {
  return configureStore({
    reducer: { cart: cartReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  });
}
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
