import { Catalog } from '@/widgets/catalog/catalog';
import { defaultCatalog } from '@/entities/product/repository';
export default function Home() {
  return <Catalog initial={defaultCatalog} />;
}
