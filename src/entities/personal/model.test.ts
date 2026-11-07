import { expect, it } from 'vitest';
import {
  personalReducer,
  restorePersonal,
  recordOrder,
  defaultDisplay,
  setFavorite,
  type DemoOrder,
} from './model';
const order: DemoOrder = {
  reference: 'DEMO-test',
  createdAt: '2026-11-07T00:00:00.000Z',
  pharmacy: 'central',
  pickup: 'today',
  lines: [{ id: 'product-1', name: 'Снимок названия', price: 10000, quantity: 2 }],
};
it('отклоняет повреждённые снимки, не блокируя готовность интерфейса', () => {
  const state = personalReducer(
    undefined,
    restorePersonal({
      favorites: ['product-1'],
      orders: [{ ...order, lines: [{ ...order.lines[0], quantity: -1 }] }],
      display: defaultDisplay,
    }),
  );
  expect(state.hydrated).toBe(true);
  expect(state.orders).toEqual([]);
});
it('восстанавливает настройки и избранное, исключает дубли и сохраняет снимок заказа', () => {
  let state = personalReducer(
    undefined,
    restorePersonal({
      favorites: ['product-1', 'product-1'],
      orders: [],
      display: { ...defaultDisplay, scale: '150' },
    }),
  );
  expect(state.favorites).toEqual(['product-1']);
  expect(state.display.scale).toBe('150');
  state = personalReducer(state, setFavorite({ id: 'product-1', selected: false }));
  expect(state.favorites).toEqual([]);
  state = personalReducer(state, recordOrder(order));
  state = personalReducer(state, recordOrder(order));
  expect(state.orders).toEqual([order]);
  expect(state.orders[0].lines[0].price).toBe(10000);
});
