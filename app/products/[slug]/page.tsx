import { AntdBoundary } from '@/shared/ui/antd-boundary';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, products } from '@/entities/product/repository';
import { ProductDetail } from '@/widgets/product/product-detail';
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return { title: product?.name ?? 'Товар не найден', description: product?.description };
}
export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return (
    <AntdBoundary>
      <ProductDetail product={product} />
    </AntdBoundary>
  );
}
