import Link from 'next/link';
import { ArrowRightOutlined, EnvironmentOutlined, AppstoreOutlined } from '@/shared/ui/shop-icons';
import { ProductArtwork } from '@/entities/product/artwork';
import { categories, type Product } from '@/entities/product/model';
import styles from './catalog.module.css';

// Static presentation is composed on the server and passed into the interactive
// catalog as rendered content; cart/search updates do not recreate this subtree.
export function CatalogIntro({ products }: { products: Product[] }) {
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div>
          <span className="eyebrow">ДЛЯ ВАС И ВАШИХ БЛИЗКИХ</span>
          <h1 id="hero-title">
            Забота о себе.
            <br />
            <span>Каждый день.</span>
          </h1>
          <p>Всё необходимое для домашней аптечки и ежедневного ухода — в одном месте.</p>
          <a href="#catalog-results" className={styles.heroCta}>
            Перейти в каталог <ArrowRightOutlined />
          </a>
          <div className={styles.heroMeta}>
            <span>
              <EnvironmentOutlined /> 3 аптеки в Ангарске
            </span>
            <span>Самовывоз</span>
          </div>
        </div>
        <div className={styles.heroGraphic} aria-hidden="true">
          <div className={styles.orbit} />
          <div className={styles.plinth} />
          <div className={styles.heroPacks}>
            {products.map((product) => (
              <ProductArtwork key={product.id} product={product} />
            ))}
          </div>
          <span className={styles.heroChip}>
            <EnvironmentOutlined /> Самовывоз рядом с вами
          </span>
        </div>
      </section>
      <nav className={styles.quickCategories} aria-label="Популярные разделы">
        {categories.slice(1, 7).map((category) => (
          <Link prefetch={false} key={category} href={`/?category=${encodeURIComponent(category)}`}>
            <AppstoreOutlined aria-hidden="true" />
            <span>{category}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
