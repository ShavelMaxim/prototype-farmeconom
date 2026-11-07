'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useCatalogParams } from './use-catalog-params';
import { apiErrorMessage } from '@/shared/api/errors';
import { ProductGrid } from './product-grid';
import { useCatalogSearch } from './use-catalog-search';
import { ActionButton as Button } from '@/shared/ui/action-button';
import { LoadingNotice } from '@/shared/ui/loading-notice';
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

const FilterDrawer = dynamic(() => import('./filter-drawer'), {
  loading: () => <LoadingNotice>Открываем фильтры…</LoadingNotice>,
});
const sorting = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'name', label: 'По названию' },
];
export function Catalog({ initial }: { initial: CatalogResponse }) {
  const search = useCatalogSearch();
  const pharmacy = useAppSelector((s) => s.cart.pharmacy);
  const hydrated = useAppSelector((s) => s.cart.hydrated);
  const query = parseCatalogQuery({ ...Object.fromEntries(new URLSearchParams(search)), pharmacy });
  const { draft, searchChanged, reset, update, submitSearch } = useCatalogParams(query);
  const [drawer, setDrawer] = useState(false);
  const filterTrigger = useRef<HTMLButtonElement>(null);
  function closeFilters() {
    setDrawer(false);
    requestAnimationFrame(() => filterTrigger.current?.focus());
  }
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
      <label className={styles.checkField}>
        <input
          type="checkbox"
          disabled={!hydrated}
          checked={query.available === 'true'}
          onChange={(event) => update({ available: event.currentTarget.checked ? 'true' : '' })}
        />
        <span>Только в наличии</span>
      </label>
      <p className={styles.filterNote}>В выбранной аптеке</p>
      <Button variant="link" onClick={reset} className={styles.reset}>
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
        <span className={styles.searchInput}>
          <SearchOutlined aria-hidden="true" />
          <input
            aria-label="Поиск товаров"
            disabled={!hydrated}
            placeholder="Название товара, бренд или категория"
            value={draft}
            onChange={(event) => searchChanged(event.currentTarget.value)}
            maxLength={80}
          />
          {draft && (
            <button
              className={styles.clear}
              type="button"
              aria-label="Очистить поиск"
              onClick={() => searchChanged('')}
            >
              <CloseOutlined />
            </button>
          )}
        </span>
        <Button variant="primary" type="submit" disabled={!hydrated}>
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
            <div className={styles.sortControl}>
              <select
                aria-label="Сортировка товаров"
                className={styles.select}
                disabled={!hydrated}
                value={query.sort}
                onChange={(event) => update({ sort: event.currentTarget.value })}
              >
                {sorting.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button
            ref={filterTrigger}
            aria-haspopup="dialog"
            aria-expanded={drawer}
            onPointerEnter={() => {
              void import('./filter-drawer').catch(() => {});
            }}
            onFocus={() => {
              void import('./filter-drawer').catch(() => {});
            }}
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
            <div role="alert" className={styles.error}>
              <strong>Не удалось обновить каталог</strong>
              <p>
                {apiErrorMessage(error)} Добавление временно недоступно, пока не удастся обновить
                каталог.
              </p>
              <div className={styles.errorActions}>
                <Button small onClick={refetch} disabled={isFetching}>
                  Повторить
                </Button>
                {demo === 'error' && (
                  <Button small variant="link" onClick={() => setDemo('normal')}>
                    Отключить демонстрационную ошибку
                  </Button>
                )}
              </div>
            </div>
          )}
          {!result.total && !isFetching && !isError ? (
            <div className={styles.empty}>
              <div className={styles.emptyContent}>
                <SearchOutlined className={styles.emptyIcon} aria-hidden="true" />
                <p>По вашему запросу ничего не нашлось</p>
                <p className="muted">Попробуйте другое название или уберите фильтры.</p>
                <Button onClick={reset} variant="primary">
                  Показать все товары
                </Button>
              </div>
            </div>
          ) : (
            <ProductGrid products={result.items} pharmacy={pharmacy} busy={isFetching || isError} />
          )}
          <div className={styles.catalogNote}>
            Изображения упаковок условные. Все товары и цены — демонстрационные.
          </div>
        </div>
      </section>
      {drawer && <FilterDrawer onClose={closeFilters}>{filters}</FilterDrawer>}
      <details className={styles.demoPanel}>
        <summary>Проверить поведение интерфейса</summary>
        <p>
          Инструмент для демонстрации на собеседовании. Задержка и ошибка применяются только к
          запросам каталога.
        </p>
        <select
          aria-label="Режим сети"
          className={styles.select}
          disabled={!hydrated}
          value={demo}
          onChange={(event) => setDemo(event.currentTarget.value)}
          style={{ minWidth: 220 }}
        >
          <option value="normal">Обычная сеть</option>
          <option value="slow">Задержка 1,5 секунды</option>
          <option value="error">Ошибка API</option>
        </select>
      </details>
    </main>
  );
}
