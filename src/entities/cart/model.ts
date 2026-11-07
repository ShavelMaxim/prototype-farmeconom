import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as z from 'zod/mini';
import { pharmacySchema } from '@/shared/config/pharmacy-id';
import { productIdSchema } from '@/shared/config/product-id';
const itemSchema = z.object({
  id: productIdSchema,
  quantity: z.int().check(z.minimum(1), z.maximum(99)),
});
export const cartSchema = z.object({
  items: z.array(itemSchema).check(z.maxLength(50)),
  pharmacy: pharmacySchema,
});
export type CartData = z.infer<typeof cartSchema>;
export type CartState = CartData & { hydrated: boolean };
export const initialCart: CartState = { items: [], pharmacy: 'central', hydrated: false };
const slice = createSlice({
  name: 'cart',
  initialState: initialCart,
  reducers: {
    restore(state, action: PayloadAction<unknown>) {
      const result = cartSchema.safeParse(action.payload);
      if (result.success) {
        state.items = result.data.items.filter(
          (item, i, items) => items.findIndex((x) => x.id === item.id) === i,
        );
        state.pharmacy = result.data.pharmacy;
      }
      state.hydrated = true;
    },
    setPharmacy(state, action: PayloadAction<CartData['pharmacy']>) {
      state.pharmacy = action.payload;
    },
    addItem(state, action: PayloadAction<{ id: string; stock: number }>) {
      const { id, stock } = action.payload;
      if (stock <= 0) return;
      const item = state.items.find((x) => x.id === id);
      if (item) item.quantity = Math.min(item.quantity + 1, stock, 99);
      else if (state.items.length < 50) state.items.push({ id, quantity: 1 });
    },
    setQuantity(state, action: PayloadAction<{ id: string; quantity: number; stock: number }>) {
      const item = state.items.find((x) => x.id === action.payload.id);
      if (item && action.payload.stock > 0)
        item.quantity = Math.max(
          1,
          Math.min(Math.floor(action.payload.quantity), action.payload.stock),
        );
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((x) => x.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
    repeatItems(
      state,
      { payload }: PayloadAction<{ id: string; quantity: number; stock: number }[]>,
    ) {
      if (!state.hydrated) return;
      payload.forEach(({ id, quantity, stock }) => {
        if (quantity <= 0 || stock <= 0) return;
        const item = state.items.find((line) => line.id === id);
        if (item) item.quantity = Math.min(99, stock, item.quantity + quantity);
        else if (state.items.length < 50)
          state.items.push({ id, quantity: Math.min(99, stock, quantity) });
      });
    },
  },
});
export const { restore, setPharmacy, addItem, setQuantity, removeItem, clearCart, repeatItems } =
  slice.actions;
export const cartReducer = slice.reducer;
