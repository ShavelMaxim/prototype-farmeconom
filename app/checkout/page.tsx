import { AntdBoundary } from '@/shared/ui/antd-boundary';
import type { Metadata } from 'next';
import { Checkout } from '@/widgets/checkout/checkout';
import { products } from '@/entities/product/repository';
export const metadata: Metadata = { title: 'Демонстрационное оформление' };
export default function CheckoutPage() {
  return (
    <AntdBoundary>
      <Checkout products={products} />
    </AntdBoundary>
  );
}
