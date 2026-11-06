import type { Product, PharmacyId } from '@/entities/product/model';
import type { CartData } from '@/entities/cart/model';
export function getCartSummary(
  items: CartData['items'],
  products: Product[],
  pharmacy: PharmacyId,
) {
  const lines = items.map((item) => {
    const product = products.find((p) => p.id === item.id);
    const offer = product?.offers[pharmacy];
    return {
      ...item,
      product,
      offer,
      valid: Boolean(offer && item.quantity <= offer.stock),
      total: (offer?.price ?? 0) * item.quantity,
    };
  });
  return {
    lines,
    total: lines.reduce((sum, item) => sum + item.total, 0),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    valid: lines.length > 0 && lines.every((item) => item.valid),
  };
}
