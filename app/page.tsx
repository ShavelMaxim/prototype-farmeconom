import { Catalog } from '@/widgets/catalog/catalog';
import { defaultCatalog } from '@/entities/product/repository';
import { CatalogIntro } from '@/widgets/catalog/catalog-intro';
export default function Home() {
  return (
    <Catalog
      initial={defaultCatalog}
      intro={<CatalogIntro products={defaultCatalog.items.slice(0, 2)} />}
    />
  );
}
