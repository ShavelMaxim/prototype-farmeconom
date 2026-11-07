import { memo, type Ref } from 'react';
import type { PharmacyId, Product } from '@/entities/product/model';
import { useCatalogCart } from '@/features/cart/use-catalog-cart';
import { ProductCard } from './product-card';
import styles from './catalog.module.css';
import { useFavorites } from '@/features/favorites/use-favorites';
import { FeedbackToast } from '@/shared/ui/feedback-toast';

export const ProductGrid = memo(function ProductGrid({
  products,
  pharmacy,
  busy,
  ref,
}: {
  products: Product[];
  pharmacy: PharmacyId;
  busy: boolean;
  ref?: Ref<HTMLFieldSetElement>;
}) {
  const { quantities, hydrated, add, announcement } = useCatalogCart(products, pharmacy, busy);
  const favorites = useFavorites();
  return (
    <>
      <fieldset
        ref={ref}
        className={styles.grid}
        aria-label="Товары каталога"
        aria-busy={busy}
        disabled={!hydrated || !favorites.hydrated}
        onClick={(event) => {
          if (!(event.target instanceof Element)) return;
          const favorite = event.target.closest<HTMLButtonElement>('button[data-favorite-id]');
          if (favorite && event.currentTarget.contains(favorite)) {
            const product = products.find((p) => p.id === favorite.dataset.favoriteId);
            if (product) favorites.toggle(product.id, product.name);
            return;
          }
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
            favorite={favorites.selected.has(product.id)}
          />
        ))}
      </fieldset>
      <span className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </span>
      {favorites.notice && (
        <FeedbackToast
          message={`${favorites.notice.name}: ${favorites.notice.previous ? 'удалено из избранного' : 'добавлено в избранное'}`}
          onClose={favorites.close}
          onUndo={favorites.notice.previous ? favorites.undo : undefined}
        />
      )}
    </>
  );
});
