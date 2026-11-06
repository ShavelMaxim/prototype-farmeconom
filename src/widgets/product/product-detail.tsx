'use client';
import Link from 'next/link';
import { Alert, Divider, Tag } from 'antd';
import { ProductArtwork } from '@/entities/product/artwork';
import { money, type Product } from '@/entities/product/model';
import { useAppSelector } from '@/shared/lib/store-hooks';
import { AddButton } from '@/features/cart/add-button';
import { PharmacyPicker } from '@/features/pharmacy/picker';
import styles from './product-detail.module.css';
export function ProductDetail({ product }: { product: Product }) {
  const pharmacy = useAppSelector((s) => s.cart.pharmacy);
  const offer = product.offers[pharmacy];
  return (
    <main id="main" className="container">
      <Link href="/" className="back-link">
        ← Каталог товаров
      </Link>
      <div className={styles.layout}>
        <div>
          <ProductArtwork product={product} large />
          <p className={styles.caption}>Условное изображение упаковки · учебный проект</p>
        </div>
        <div>
          <p className="eyebrow">
            {product.brand} / {product.category}
          </p>
          <h1 className={styles.title}>{product.name}</h1>
          <p className="muted">{product.size}</p>
          <Tag color={offer.stock ? 'green' : 'default'}>
            {offer.stock ? `В наличии ${offer.stock} шт.` : 'Нет в выбранной аптеке'}
          </Tag>
          <p className={styles.price}>{money(offer.price)}</p>
          <div className={styles.purchase}>
            <AddButton product={product} />
            <Link href="/cart">Перейти в корзину →</Link>
          </div>
          <Divider />
          <h2 className={styles.subtitle}>Самовывоз из аптеки</h2>
          <PharmacyPicker />
          <p className="muted">
            Выберите аптеку, чтобы увидеть её цену и наличие. Все адреса демонстрационные.
          </p>
          {!offer.stock && (
            <Alert
              type="info"
              showIcon
              title="Можно выбрать другую аптеку"
              description="Наличие отличается между точками получения."
            />
          )}
        </div>
        <section className="panel">
          <h2>О товаре</h2>
          <p>{product.description}</p>
          <p className="muted">{product.details}</p>
        </section>
        <section className="panel">
          <h2>Характеристики</h2>
          <dl className={styles.facts}>
            <div>
              <dt>Бренд</dt>
              <dd>{product.brand}</dd>
            </div>
            <div>
              <dt>Упаковка</dt>
              <dd>{product.size}</dd>
            </div>
            <div>
              <dt>Категория</dt>
              <dd>{product.category}</dd>
            </div>
            <div>
              <dt>Артикул демо</dt>
              <dd>{product.id}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
