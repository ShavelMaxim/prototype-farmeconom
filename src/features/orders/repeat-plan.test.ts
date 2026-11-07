import { expect, it } from 'vitest';
import { repeatPlan } from './repeat-plan';
import { products } from '@/entities/product/repository';
import type { DemoOrder } from '@/entities/personal/model';
import { cartReducer, restore, repeatItems } from '@/entities/cart/model';
const order: DemoOrder = {
  reference: 'DEMO-test',
  createdAt: '2026-11-07T00:00:00.000Z',
  pharmacy: 'central',
  pickup: 'today',
  lines: [
    { id: 'product-1', name: 'Прежнее название', price: 100, quantity: 3 },
    { id: 'removed', name: 'Снятый товар', price: 500, quantity: 1 },
  ],
};
it('проверяет текущую аптеку и учитывает остаток уже занятого корзиной товара', () => {
  const plan = repeatPlan(order, products, 'central', [{ id: 'product-1', quantity: 1 }]);
  expect(plan[0]).toMatchObject({ adding: 1, changedPrice: true });
  expect(plan[1].adding).toBe(0);
  expect(repeatPlan(order, products, 'park', [])[0].adding).toBe(0);
  let state = cartReducer(
    undefined,
    restore({
      pharmacy: 'central',
      items: [
        { id: 'product-1', quantity: 1 },
        { id: 'product-2', quantity: 1 },
      ],
    }),
  );
  state = cartReducer(state, repeatItems([{ id: 'product-1', quantity: 1, stock: 2 }]));
  expect(state.items).toEqual([
    { id: 'product-1', quantity: 2 },
    { id: 'product-2', quantity: 1 },
  ]);
});
it('не обещает добавление новой позиции при заполненной корзине', () => {
  const plan = repeatPlan(
    order,
    products,
    'central',
    Array.from({ length: 50 }, (_, i) => ({ id: `other-${i}`, quantity: 1 })),
  );
  expect(plan[0]).toMatchObject({ adding: 0, limitReached: true });
});
