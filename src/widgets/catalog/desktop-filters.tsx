import type { CatalogQuery, Product } from '@/entities/product/model';
import { ActionButton } from '@/shared/ui/action-button';
import { FilterFields } from './filter-fields';
export default function DesktopFilters({
  query,
  products,
  disabled,
  onChange,
  onReset,
}: {
  query: CatalogQuery;
  products: Product[];
  disabled: boolean;
  onChange: (patch: Record<string, string>) => void;
  onReset: () => void;
}) {
  return (
    <>
      <FilterFields query={query} products={products} disabled={disabled} onChange={onChange} />
      <ActionButton variant="link" disabled={disabled} onClick={onReset}>
        Сбросить фильтры
      </ActionButton>
    </>
  );
}
