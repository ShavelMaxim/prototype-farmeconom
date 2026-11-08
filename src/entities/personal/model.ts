import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as z from 'zod/mini';
import { productIdSchema } from '@/shared/config/product-id';
import { pharmacySchema } from '@/shared/config/pharmacy-id';

export const PERSONAL_KEY = 'apteka-ryadom:personal:v1';
export const displaySchema = z.object({
  scale: z.enum(['100', '125', '150', '200']),
  contrast: z.enum(['standard', 'light', 'dark']),
  spacing: z.boolean(),
  reducedMotion: z.boolean(),
  festive: z.optional(z.boolean()),
});
export const defaultDisplay: z.infer<typeof displaySchema> = {
  scale: '100',
  contrast: 'standard',
  spacing: false,
  reducedMotion: false,
  festive: false,
};
const text = z.string().check(z.minLength(1), z.maxLength(200));
const orderSchema = z.object({
  reference: text,
  createdAt: z.string().check(z.refine((v) => Number.isFinite(Date.parse(v)))),
  pharmacy: pharmacySchema,
  pickup: z.enum(['today', 'tomorrow']),
  lines: z
    .array(
      z.object({
        id: productIdSchema,
        name: text,
        quantity: z.int().check(z.minimum(1), z.maximum(99)),
        price: z.int().check(z.minimum(0), z.maximum(100000000)),
      }),
    )
    .check(z.minLength(1), z.maxLength(50)),
});
export type DemoOrder = z.infer<typeof orderSchema>;
export const personalSchema = z.object({
  favorites: z.array(productIdSchema).check(z.maxLength(200)),
  orders: z.array(orderSchema).check(z.maxLength(30)),
  display: displaySchema,
});
export type PersonalData = z.infer<typeof personalSchema>;
type PersonalState = PersonalData & { hydrated: boolean; storageUnavailable: boolean };
const initialState: PersonalState = {
  favorites: [],
  orders: [],
  display: defaultDisplay,
  hydrated: false,
  storageUnavailable: false,
};
const slice = createSlice({
  name: 'personal',
  initialState,
  reducers: {
    restorePersonal(state, action: PayloadAction<unknown>) {
      const parsed = personalSchema.safeParse(action.payload);
      if (parsed.success) {
        state.favorites = [...new Set(parsed.data.favorites)];
        state.orders = parsed.data.orders.filter(
          (o, i, all) => all.findIndex((v) => v.reference === o.reference) === i,
        );
        state.display = parsed.data.display;
      }
      state.hydrated = true;
    },
    setFavorite(state, { payload }: PayloadAction<{ id: string; selected: boolean }>) {
      if (!state.hydrated) return;
      if (payload.selected && !state.favorites.includes(payload.id) && state.favorites.length < 200)
        state.favorites.push(payload.id);
      if (!payload.selected) state.favorites = state.favorites.filter((id) => id !== payload.id);
    },
    setDisplay(state, { payload }: PayloadAction<Partial<PersonalData['display']>>) {
      state.display = { ...state.display, ...payload };
    },
    resetDisplay(state) {
      state.display = defaultDisplay;
    },
    recordOrder(state, { payload }: PayloadAction<DemoOrder>) {
      if (!state.orders.some((order) => order.reference === payload.reference))
        state.orders = [payload, ...state.orders].slice(0, 30);
    },
    markStorageUnavailable(state) {
      state.storageUnavailable = true;
    },
  },
});
export const {
  restorePersonal,
  setFavorite,
  setDisplay,
  resetDisplay,
  recordOrder,
  markStorageUnavailable,
} = slice.actions;
export const personalReducer = slice.reducer;
