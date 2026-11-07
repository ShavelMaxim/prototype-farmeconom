import type { DemoOrder } from '@/entities/personal/model';
import type { Product, PharmacyId } from '@/entities/product/model';
export function repeatPlan(
  order: DemoOrder,
  products: Product[],
  pharmacy: PharmacyId,
  cart: { id: string; quantity: number }[],
) {
  let freeSlots = Math.max(0, 50 - cart.length);
  return order.lines.map((line) => {
    const product = products.find((p) => p.id === line.id);
    const offer = product?.offers[pharmacy];
    const existing = cart.find((item) => item.id === line.id)?.quantity ?? 0;
    const limitReached = !existing && freeSlots === 0;
    const adding = limitReached
      ? 0
      : Math.max(0, Math.min(line.quantity, (offer?.stock ?? 0) - existing, 99 - existing));
    if (!existing && adding) freeSlots--;
    return {
      ...line,
      product,
      offer,
      existing,
      adding,
      limitReached,
      changedPrice: offer?.price !== line.price,
    };
  });
}
