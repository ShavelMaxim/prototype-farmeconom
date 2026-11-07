'use client';
import Link from 'next/link';
import { Alert, Divider, Tag } from 'antd';
import { ProductArtwork } from '@/entities/product/artwork';
import { money, type Product } from '@/entities/product/model';
import { useAppSelector } from '@/shared/lib/store-hooks';
import { AddButton } from '@/features/cart/add-button';
import { PharmacyPicker } from '@/features/pharmacy/picker';
import styles from './product-detail.module.css';
import { useInventory } from '@/entities/product/api';
import { InventoryStatus } from '@/entities/product/inventory-status';
import { FavoriteButton } from '@/features/favorites/favorite-button';
import { audiences, features } from '@/entities/product/facets';
export function ProductDetail({ product: initial }: { product: Product }) {
  const inventory = useInventory([initial]);
  const pharmacy = useAppSelector((s) => s.cart.pharmacy);
  const product = inventory.products.find((p) => p.slug === initial.slug);
  if (!inventory.ready)
    return <InventoryStatus error={inventory.error} retry={inventory.refetch} />;
  if (!product)
    return (
      <main id="main" className="container">
        <h1>Товар больше недоступен</h1>
        <Link prefetch={false} href="/">
          Вернуться в каталог
        </Link>
      </main>
    );
  const offer = product.offers[pharmacy];
  const related = product.relationGroup
    ? inventory.products.filter(
        (p) => p.id !== product.id && p.relationGroup === product.relationGroup,
      )
    : [];
  return (
    <main id="main" className="container">
      <Link prefetch={false} href="/" className="back-link">
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
          <FavoriteButton id={product.id} name={product.name} />
          {product.medicalDemo && (
            <Alert
              type="warning"
              showIcon
              title="Вымышленный медицинский образец"
              description="Название, вещество и дозировка нужны только для демонстрации фильтров. Это не инструкция. Нет подтверждённых данных о применении детьми, при беременности и кормлении."
            />
          )}
          <Tag color={offer.stock ? 'green' : 'default'} style={{ color: 'var(--green)' }}>
            {offer.stock ? `В наличии ${offer.stock} шт.` : 'Нет в выбранной аптеке'}
          </Tag>
          <p className={styles.price}>{money(offer.price)}</p>
          <div className={styles.purchase}>
            <strong className={styles.mobilePrice}>{money(offer.price)}</strong>
            <AddButton product={product} />
            <Link prefetch={false} href="/cart">
              Перейти в корзину →
            </Link>
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
            <div>
              <dt>Производитель</dt>
              <dd>{product.manufacturer}</dd>
            </div>
            {product.form && (
              <div>
                <dt>Форма / формат</dt>
                <dd>{product.form}</dd>
              </div>
            )}
            {product.dose && (
              <div>
                <dt>Дозировка · демо</dt>
                <dd>{product.dose}</dd>
              </div>
            )}
            {product.ingredient && (
              <div>
                <dt>Вещество · демо</dt>
                <dd>{product.ingredient}</dd>
              </div>
            )}
            {product.packCount && (
              <div>
                <dt>В упаковке</dt>
                <dd>{product.packCount} шт.</dd>
              </div>
            )}
            {product.audience.length > 0 && (
              <div>
                <dt>Подборка</dt>
                <dd>{product.audience.map((a) => audiences[a]).join(', ')}</dd>
              </div>
            )}
            {product.minAgeMonths !== undefined && (
              <div>
                <dt>Возрастная маркировка · демо</dt>
                <dd>
                  От {product.minAgeMonths} мес.
                  {product.maxAgeMonths !== undefined ? ` до ${product.maxAgeMonths} мес.` : ''}
                </dd>
              </div>
            )}
            {product.features.length > 0 && (
              <div>
                <dt>Особенности</dt>
                <dd>{product.features.map((f) => features[f]).join(', ')}</dd>
              </div>
            )}
            {product.flavor && (
              <div>
                <dt>Вкус</dt>
                <dd>{product.flavor}</dd>
              </div>
            )}
            {product.weightGrams && (
              <div>
                <dt>Масса</dt>
                <dd>{product.weightGrams} г</dd>
              </div>
            )}
            {product.volumeMl && (
              <div>
                <dt>Объём</dt>
                <dd>{product.volumeMl} мл</dd>
              </div>
            )}
            {product.material && (
              <div>
                <dt>Материал</dt>
                <dd>{product.material}</dd>
              </div>
            )}
            {product.variantSize && (
              <div>
                <dt>Размер</dt>
                <dd>{product.variantSize}</dd>
              </div>
            )}
            {product.skinType && (
              <div>
                <dt>Тип кожи</dt>
                <dd>{product.skinType}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>
      {related.length > 0 && (
        <section className={`panel ${styles.related}`}>
          <h2>{product.medicalDemo ? 'Сравнить учебные образцы' : 'Похожие товары'}</h2>
          <p className="muted">
            {product.medicalDemo
              ? 'Одна группа демонстрационного вещества. Это не подтверждает терапевтическую взаимозаменяемость.'
              : 'Общая товарная группа — сравните характеристики и упаковку.'}
          </p>
          <ul>
            {related.map((p) => (
              <li key={p.id}>
                <Link prefetch={false} href={`/products/${p.slug}`}>
                  <strong>{p.name}</strong>
                  <span>
                    {p.size} · {money(p.offers[pharmacy].price)} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className={styles.mobileSpace} aria-hidden="true" />
    </main>
  );
}
