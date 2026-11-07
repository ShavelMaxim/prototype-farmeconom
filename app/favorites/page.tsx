import type { Metadata } from 'next';
import { products } from '@/entities/product/repository';
import { Favorites } from '@/widgets/catalog/favorites';
export const metadata: Metadata = { title: 'Избранное' };
export default function FavoritesPage() {
  return <Favorites products={products} />;
}
