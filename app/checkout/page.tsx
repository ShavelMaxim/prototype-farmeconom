import type { Metadata } from 'next';
import { Checkout } from '@/widgets/checkout/checkout';
import { products } from '@/entities/product/repository';
export const metadata: Metadata = { title: 'Демонстрационное оформление' };
export default function CheckoutPage() {
  return <Checkout products={products} />;
}
