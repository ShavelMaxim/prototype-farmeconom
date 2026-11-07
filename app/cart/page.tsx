import { AntdBoundary } from '@/shared/ui/antd-boundary';
import type { Metadata } from 'next';
import { products } from '@/entities/product/repository';
import { CartView } from '@/widgets/cart/cart-view';
export const metadata: Metadata = { title: 'Корзина' };
export default function CartPage() {
  return (
    <AntdBoundary>
      <CartView products={products} />
    </AntdBoundary>
  );
}
