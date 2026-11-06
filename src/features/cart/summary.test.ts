import { describe, expect, it } from 'vitest';
import { getCartSummary } from './summary';
import { products } from '@/entities/product/repository';
describe('проверка корзины', () => {
  it('считает сумму в копейках по выбранной аптеке', () => {
    const summary = getCartSummary([{ id: 'product-2', quantity: 2 }], products, 'park');
    expect(summary.total).toBe(products[1].offers.park.price * 2);
    expect(summary.valid).toBe(true);
  });
  it('блокирует оформление при отсутствии, превышении остатка и неизвестном товаре', () => {
    expect(getCartSummary([{ id: 'product-1', quantity: 1 }], products, 'park').valid).toBe(false);
    expect(getCartSummary([{ id: 'product-2', quantity: 99 }], products, 'central').valid).toBe(
      false,
    );
    expect(getCartSummary([{ id: 'missing', quantity: 1 }], products, 'central').valid).toBe(false);
    expect(getCartSummary([], products, 'central').valid).toBe(false);
  });
});
