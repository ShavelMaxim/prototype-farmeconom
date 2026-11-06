import { Catalog } from '@/widgets/catalog/catalog';
import { getCatalog } from '@/entities/product/repository';
import { parseCatalogQuery } from '@/entities/product/model';
export default function Home() {
  const query = parseCatalogQuery({});
  return <Catalog initial={getCatalog(query)} />;
}
