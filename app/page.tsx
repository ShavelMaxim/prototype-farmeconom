import { Suspense } from 'react';
import { Catalog, CatalogSkeleton } from '@/widgets/catalog/catalog';
import { getCatalog } from '@/entities/product/repository';
import { parseCatalogQuery } from '@/entities/product/model';
export default function Home() {
  const query = parseCatalogQuery({});
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Catalog initial={getCatalog(query)} />
    </Suspense>
  );
}
