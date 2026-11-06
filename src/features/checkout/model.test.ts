import { describe, expect, it } from 'vitest';
import { checkoutFormSchema, checkoutRequestSchema } from './model';
describe('контракт оформления', () => {
  const valid = {
    pickup: 'today',
    acknowledge: true,
    pharmacy: 'central',
    items: [{ id: 'product-1', quantity: 1 }],
  };
  it('требует подтверждение демонстрационного режима', () => {
    expect(checkoutFormSchema.safeParse({ pickup: 'today', acknowledge: false }).success).toBe(
      false,
    );
    expect(checkoutRequestSchema.safeParse(valid).success).toBe(true);
  });
  it('отклоняет дробное количество и дубли товарных строк', () => {
    expect(
      checkoutRequestSchema.safeParse({ ...valid, items: [{ id: 'product-1', quantity: 1.5 }] })
        .success,
    ).toBe(false);
    expect(
      checkoutRequestSchema.safeParse({ ...valid, items: [...valid.items, ...valid.items] })
        .success,
    ).toBe(false);
  });
});
