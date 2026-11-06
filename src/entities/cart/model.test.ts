import { describe, expect, it } from 'vitest';
import { addItem, cartReducer, initialCart, restore, setPharmacy, setQuantity } from './model';
describe('корзина: ограничения и восстановление', () => {
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
