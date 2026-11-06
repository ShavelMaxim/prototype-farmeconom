import type { Metadata } from 'next';
import { products } from '@/entities/product/repository';
import { CartView } from '@/widgets/cart/cart-view';
export const metadata: Metadata = { title: 'Корзина' };
export default function CartPage() {
  return <CartView products={products} />;
}
