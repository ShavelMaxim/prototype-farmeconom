import { Suspense } from 'react';
import { Catalog, CatalogSkeleton } from '@/widgets/catalog/catalog';
import { getCatalog } from '@/entities/product/repository';
import { parseCatalogQuery } from '@/entities/product/model';
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseCatalogQuery(await searchParams);
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Catalog initial={getCatalog(query)} />
    </Suspense>
  );
}
