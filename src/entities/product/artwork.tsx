import type { CSSProperties } from 'react';
import type { Product } from './model';
import styles from './artwork.module.css';
export function ProductArtwork({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`${styles.scene} ${large ? styles.large : ''}`}
      style={{ '--pack-color': product.color } as CSSProperties}
    >
      <div className={`${styles.pack} ${styles[product.kind]}`}>
        <span className={styles.brand}>{product.brand}</span>
        <span className={styles.mark}>+</span>
        <span className={styles.name}>{product.name}</span>
        <span className={styles.size}>{product.size}</span>
      </div>
    </div>
  );
}
