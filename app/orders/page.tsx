import type { Metadata } from 'next';
import { products } from '@/entities/product/repository';
import { Orders } from '@/widgets/orders/orders';
export const metadata: Metadata = { title: 'Мои заказы' };
export default function OrdersPage() {
  return <Orders products={products} />;
}
