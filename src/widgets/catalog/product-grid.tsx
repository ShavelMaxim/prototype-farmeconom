import { memo } from 'react';
import type { PharmacyId, Product } from '@/entities/product/model';
import { useCatalogCart } from '@/features/cart/use-catalog-cart';
import { ProductCard } from './product-card';
import styles from './catalog.module.css';

export const ProductGrid = memo(function ProductGrid({
  products,
  pharmacy,
  busy,
}: {
  products: Product[];
  pharmacy: PharmacyId;
  busy: boolean;
}) {
  const { quantities, hydrated, add, announcement } = useCatalogCart(products, pharmacy, busy);
  return (
    <>
      <fieldset
        className={styles.grid}
        aria-label="Товары каталога"
        aria-busy={busy}
        disabled={!hydrated}
        onClick={(event) => {
          if (!(event.target instanceof Element)) return;
          const button = event.target.closest<HTMLButtonElement>('button[data-product-id]');
          if (button && event.currentTarget.contains(button) && !button.disabled)
            add(button.dataset.productId!);
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            pharmacy={pharmacy}
            busy={busy}
            quantity={quantities.get(product.id) ?? 0}
          />
        ))}
      </fieldset>
      <span className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </span>
    </>
  );
});
