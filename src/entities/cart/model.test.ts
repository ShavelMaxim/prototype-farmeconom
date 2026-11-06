import { describe, expect, it } from 'vitest';
import {
  addItem,
  cartReducer,
  cartSchema,
  initialCart,
  restore,
  setPharmacy,
  setQuantity,
} from './model';
describe('корзина: ограничения и восстановление', () => {
  it('проверяет границы сохранённых значений до восстановления', () => {
    const valid = { pharmacy: 'central', items: [{ id: 'x'.repeat(128), quantity: 99 }] };
    expect(cartSchema.safeParse(valid).success).toBe(true);
    for (const item of [
      { id: '', quantity: 1 },
      { id: 'x'.repeat(129), quantity: 1 },
      { id: 'sku', quantity: 100 },
      { id: 'sku', quantity: 1.5 },
    ])
      expect(cartSchema.safeParse({ ...valid, items: [item] }).success).toBe(false);
    expect(cartSchema.safeParse({ ...valid, items: Array(51).fill(valid.items[0]) }).success).toBe(
      false,
    );
  });
  it('не добавляет недоступный товар и не превышает остаток при повторном добавлении', () => {
    let state = cartReducer(initialCart, addItem({ id: 'product-1', stock: 0 }));
    expect(state.items).toEqual([]);
    for (let i = 0; i < 5; i++) state = cartReducer(state, addItem({ id: 'product-1', stock: 2 }));
    expect(state.items).toEqual([{ id: 'product-1', quantity: 2 }]);
  });
  it('отклоняет повреждённое сохранение и завершает hydration', () => {
    const state = cartReducer(
      initialCart,
      restore({ pharmacy: 'unknown', items: [{ id: 'product-1', quantity: -1 }] }),
    );
    expect(state.items).toEqual([]);
    expect(state.pharmacy).toBe('central');
    expect(state.hydrated).toBe(true);
  });
  it('убирает дубли сохранения и ограничивает количество остатком', () => {
    const saved = {
      pharmacy: 'park',
      items: [
        { id: 'product-2', quantity: 3 },
        { id: 'product-2', quantity: 3 },
      ],
    };
    const restored = cartReducer(initialCart, restore(saved));
    expect(restored.items).toHaveLength(1);
    const updated = cartReducer(
      restored,
      setQuantity({ id: 'product-2', quantity: 100, stock: 2 }),
    );
    expect(updated.items[0].quantity).toBe(2);
  });
  it('не удаляет товары молча при смене аптеки', () => {
    const state = cartReducer(
      { ...initialCart, items: [{ id: 'product-1', quantity: 2 }] },
      setPharmacy('park'),
    );
    expect(state.items).toHaveLength(1);
    expect(state.pharmacy).toBe('park');
  });
});

it('сохраняет идентификаторы товаров из API при восстановлении', () => {
  const state = cartReducer(
    initialCart,
    restore({ pharmacy: 'central', items: [{ id: 'sku-thermometer-2026', quantity: 1 }] }),
  );
  expect(state.items[0]?.id).toBe('sku-thermometer-2026');
});
