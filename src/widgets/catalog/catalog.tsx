'use client';
import { useState } from 'react';
import { useCatalogParams } from './use-catalog-params';
import { apiErrorMessage } from '@/shared/api/errors';
import { ProductCard } from './product-card';
import { useSearchParams } from 'next/navigation';
import { Alert, Button, Checkbox, Drawer, Empty, Input, Select, Skeleton } from 'antd';
import {
  ArrowRightOutlined,
  SearchOutlined,
  SlidersOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { categories, parseCatalogQuery, type CatalogResponse } from '@/entities/product/model';
import { useGetCatalogQuery } from '@/entities/product/api';
import { useAppSelector } from '@/shared/lib/store-hooks';
import { pharmacies } from '@/shared/config/pharmacies';
import styles from './catalog.module.css';

const sorting = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'name', label: 'По названию' },
];
export function Catalog({ initial }: { initial: CatalogResponse }) {
  const search = useSearchParams();
  const pharmacy = useAppSelector((s) => s.cart.pharmacy);
  const query = parseCatalogQuery({ ...Object.fromEntries(search), pharmacy });
  const { draft, searchChanged, reset, update, submitSearch } = useCatalogParams(query);
  const [drawer, setDrawer] = useState(false);
  const [demo, setDemo] = useState('normal');
  const { data, isFetching, isError, error, refetch } = useGetCatalogQuery(
    { ...query, demo },
    { refetchOnMountOrArgChange: Boolean(process.env.NEXT_PUBLIC_API_URL) },
  );
  const result = data ?? (process.env.NEXT_PUBLIC_API_URL ? { items: [], total: 0 } : initial);
  const filters = (
    <div className={styles.filterContent}>
      <p className="eyebrow">КАТЕГОРИИ</p>
      <div className={styles.categories}>
        {categories.map((category, i) => (
          <button
            key={category}
            aria-pressed={query.category === category}
            className={query.category === category ? styles.active : ''}
            onClick={() => update({ category: i === 0 ? '' : category })}
          >
            <span>{['✳', '◒', '⊞', '+', '♡'][i]}</span>
            {category}
            <ArrowRightOutlined />
          </button>
        ))}
      </div>
      <div className={styles.divider} />
      <Checkbox
        checked={query.available === 'true'}
        onChange={(e) => update({ available: e.target.checked ? 'true' : '' })}
      >
        Только в наличии
      </Checkbox>
      <p className={styles.filterNote}>В выбранной аптеке</p>
      <Button type="link" onClick={reset} className={styles.reset}>
        Сбросить фильтры
      </Button>
      <div className={styles.help}>
        <SafetyCertificateOutlined />
        <h3>
          Всё необходимое
          <br />
          для заботы о себе
        </h3>
        <p>Сравните товары и выберите удобную аптеку для получения.</p>
        <span>Демонстрационный каталог</span>
      </div>
    </div>
  );
  return (
    <main id="main" className="container">
      <section className={styles.hero} aria-labelledby="hero-title">
        <div>
          <span className="eyebrow">ЗАБОТА БЛИЖЕ, ЧЕМ КАЖЕТСЯ</span>
          <h1 id="hero-title">
            Всё для здоровья.
            <br />
            <span>Рядом с вами.</span>
          </h1>
          <p>
            Найдите нужное и выберите удобную аптеку.
            <br />
            Спокойно, понятно, без лишних шагов.
          </p>
          <div className={styles.heroMeta}>
            <span>
              <EnvironmentOutlined /> 3 аптеки в Ангарске
            </span>
            <span>Самовывоз</span>
          </div>
        </div>
        <div className={styles.heroGraphic} aria-hidden="true">
          <div className={styles.orbit} />
          <div className={styles.heroCross}>+</div>
          <span className={styles.heroChip}>Каждый день — с заботой</span>
          <div className={styles.smallCircle}>✳</div>
        </div>
      </section>
      <form
        role="search"
        className={styles.search}
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
      >
        <Input
          aria-label="Поиск товаров"
          placeholder="Название товара, бренд или категория"
          prefix={<SearchOutlined />}
          value={draft}
          onChange={(e) => searchChanged(e.target.value)}
          maxLength={80}
          suffix={
            draft ? (
              <button
                className={styles.clear}
                type="button"
                aria-label="Очистить поиск"
                onClick={() => searchChanged('')}
              >
                <CloseOutlined />
              </button>
            ) : null
          }
        />
        <Button type="primary" htmlType="submit">
          Найти <ArrowRightOutlined />
        </Button>
      </form>
      <section className={styles.layout} aria-label="Каталог товаров">
        <aside className={styles.sidebar}>{filters}</aside>
        <div className={styles.main}>
          <div className={styles.toolbar}>
            <div>
              <h2>
                {query.q
                  ? `Поиск: «${query.q}»`
                  : query.category === 'Все товары'
                    ? 'Для вас и ваших близких'
                    : query.category}
              </h2>
              <span className="muted">
                {result.total} товаров · аптека «{pharmacies.find((p) => p.id === pharmacy)!.name}»
              </span>
            </div>
            <Select
              aria-label="Сортировка товаров"
              value={query.sort}
              options={sorting}
              onChange={(value) => update({ sort: value })}
            />
          </div>
          <Button
            className={styles.mobileFilters}
            icon={<SlidersOutlined />}
            onClick={() => setDrawer(true)}
          >
            Категории и фильтры
          </Button>
          <div className="status-line" role="status" aria-live="polite">
            {isFetching
              ? 'Обновляем товары…'
              : isError
                ? ''
                : `Найдено товаров: ${result.total}. Цены и наличие обновлены`}
          </div>
          {isError && (
            <Alert
              type="error"
              showIcon
              title="Не удалось обновить каталог"
              description={
                <>
                  <p>
                    {apiErrorMessage(error)} Добавление временно недоступно, пока не удастся
                    обновить каталог.
                  </p>
                  <div className={styles.errorActions}>
                    <Button size="small" onClick={refetch} disabled={isFetching}>
                      Повторить
                    </Button>
                    {demo === 'error' && (
                      <Button size="small" type="link" onClick={() => setDemo('normal')}>
                        Отключить демонстрационную ошибку
                      </Button>
                    )}
                  </div>
                </>
              }
              style={{ marginBottom: 16 }}
            />
          )}
          {!result.total && !isFetching && !isError ? (
            <div className={styles.empty}>
              <Empty description="По вашему запросу ничего не нашлось">
                <p className="muted">Попробуйте другое название или уберите фильтры.</p>
                <Button onClick={reset} type="primary">
                  Показать все товары
                </Button>
              </Empty>
            </div>
          ) : (
            <div className={styles.grid} aria-busy={isFetching}>
              {result.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  pharmacy={pharmacy}
                  busy={isFetching || isError}
                />
              ))}
            </div>
          )}
          <div className={styles.catalogNote}>
            Изображения упаковок условные. Все товары и цены — демонстрационные.
          </div>
        </div>
      </section>
      <Drawer
        title="Категории и фильтры"
        open={drawer}
        onClose={() => setDrawer(false)}
        footer={
          <Button type="primary" block onClick={() => setDrawer(false)}>
            Показать товары
          </Button>
        }
      >
        {filters}
      </Drawer>
      <details className={styles.demoPanel}>
        <summary>Проверить поведение интерфейса</summary>
        <p>
          Инструмент для демонстрации на собеседовании. Задержка и ошибка применяются только к
          запросам каталога.
        </p>
        <Select
          aria-label="Режим сети"
          value={demo}
          onChange={setDemo}
          options={[
            { value: 'normal', label: 'Обычная сеть' },
            { value: 'slow', label: 'Задержка 1,5 секунды' },
            { value: 'error', label: 'Ошибка API' },
          ]}
          style={{ minWidth: 220 }}
        />
      </details>
    </main>
  );
}
export function CatalogSkeleton() {
  return (
    <div className="container" role="status" aria-label="Загружаем каталог">
      <div className={styles.hero} style={{ minHeight: 310 }}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
      <div className={styles.search}>
        <Skeleton.Input active block style={{ height: 54 }} />
      </div>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </aside>
        <div>
          <div style={{ height: 90 }}>
            <Skeleton active paragraph={{ rows: 1 }} />
          </div>
          <div className={styles.grid}>
            {Array.from({ length: 8 }, (_, i) => (
              <div className={styles.card} key={i}>
                <div style={{ height: 198, background: '#e9eee7', borderRadius: 14 }} />
                <div className={styles.cardBody}>
                  <Skeleton active paragraph={{ rows: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
