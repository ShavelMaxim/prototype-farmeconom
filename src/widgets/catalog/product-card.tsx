import Link from 'next/link';
import { memo } from 'react';
import { ProductArtwork } from '@/entities/product/artwork';
import { money, type Product, type PharmacyId } from '@/entities/product/model';
import { CartAction } from '@/features/cart/cart-action';
import styles from './catalog.module.css';
export const ProductCard = memo(function ProductCard({
  product,
  pharmacy,
  busy,
  quantity,
}: {
  product: Product;
  pharmacy: PharmacyId;
  busy: boolean;
  quantity: number;
}) {
  return (
    <article className={`${styles.card} ${busy ? styles.updating : ''}`}>
      <Link
        prefetch={false}
        href={`/products/${product.slug}`}
        aria-label={`Подробнее: ${product.name}`}
      >
        <ProductArtwork product={product} />
      </Link>
      <div className={styles.cardBody}>
        <span className={styles.brand}>{product.brand}</span>
        <h3>
          <Link prefetch={false} href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        <p className={styles.size}>{product.size}</p>
        <div className={styles.price}>{money(product.offers[pharmacy].price)}</div>
        <p className={product.offers[pharmacy].stock ? styles.stock : styles.noStock}>
          {product.offers[pharmacy].stock
            ? `● В наличии · ${product.offers[pharmacy].stock} шт.`
            : 'Нет в выбранной аптеке'}
        </p>
        <CartAction
          productId={product.id}
          name={product.name}
          stock={product.offers[pharmacy].stock}
          quantity={quantity}
          locked={busy}
        />
      </div>
    </article>
  );
});
