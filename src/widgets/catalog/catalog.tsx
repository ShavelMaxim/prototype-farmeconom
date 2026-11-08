'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ProductArtwork } from '@/entities/product/artwork';
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
  EnvironmentOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { categories, parseCatalogQuery, type CatalogResponse } from '@/entities/product/model';
import { useInventory, useGetCatalogQuery } from '@/entities/product/api';
import { useAppSelector } from '@/shared/lib/store-hooks';
import { pharmacies } from '@/shared/config/pharmacies';
import styles from './catalog.module.css';
import { categoryPatch, facetKeys, values } from '@/entities/product/facets';
import { useDesktopLayout } from '@/shared/lib/use-desktop-layout';
import { AppliedFilters } from './applied-filters';
import { productCount } from '@/shared/lib/product-count';
import { useDialogController } from '@/shared/lib/use-dialog-controller';
import { SearchField } from './search-field';

const FilterDrawer = dynamic(() => import('./filter-drawer'), {
  loading: () => <LoadingNotice>Открываем фильтры…</LoadingNotice>,
});
function FilterPlaceholder() {
  return (
    <div className={styles.filterPlaceholder} role="status" aria-label="Загружаем фильтры">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
const DesktopFilters = dynamic(() => import('./desktop-filters'), {
  ssr: false,
  loading: () => <FilterPlaceholder />,
});
const sorting = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'name', label: 'По названию' },
];
const BATCH_SIZE = 12;
export function Catalog({ initial }: { initial: CatalogResponse }) {
  const search = useCatalogSearch();
  const pharmacy = useAppSelector((s) => s.cart.pharmacy);
  const hydrated = useAppSelector((s) => s.cart.hydrated);
  const query = parseCatalogQuery({ ...Object.fromEntries(new URLSearchParams(search)), pharmacy });
  const { draft, searchChanged, reset, update, submitSearch, cancelPendingSearch } =
    useCatalogParams(query);
  const {
    open: filtersOpen,
    show: showFilters,
    close: closeFilters,
    setTrigger: setFilterTrigger,
  } = useDialogController();
  const [demo, setDemo] = useState('normal');
  const { data, isFetching, isError, error, refetch } = useGetCatalogQuery(
    { ...query, demo },
    { refetchOnMountOrArgChange: Boolean(process.env.NEXT_PUBLIC_API_URL) },
  );
  const result = data ?? (process.env.NEXT_PUBLIC_API_URL ? { items: [], total: 0 } : initial);
  const requestedPage = Number(new URLSearchParams(search).get('page') ?? '1');
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, Math.max(1, Math.ceil(result.total / BATCH_SIZE)))
      : 1;
  const visible = useMemo(() => result.items.slice(0, page * BATCH_SIZE), [result.items, page]);
  const gridRef = useRef<HTMLFieldSetElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const form = searchRef.current;
    if (!form) return;
    const measure = () =>
      form.parentElement?.style.setProperty('--catalog-search-height', `${form.offsetHeight}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(form);
    measure();
    return () => observer.disconnect();
  }, []);
  const focusIndex = useRef<number | null>(null);
  useEffect(() => {
    if (focusIndex.current === null) return;
    const link = gridRef.current?.querySelectorAll<HTMLAnchorElement>('h3 a')[focusIndex.current];
    focusIndex.current = null;
    link?.focus({ preventScroll: true });
    link?.scrollIntoView({ block: 'start' });
  }, [page]);
  const inventory = useInventory(initial.items);
  const desktop = useDesktopLayout();
  const filterCount =
    Number(query.category !== 'Все товары') +
    Number(query.available === 'true') +
    facetKeys.reduce((count, key) => count + values(query[key]).length, 0);
  return (
    <main id="main" className={`container ${styles.catalogPage}`}>
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
            {initial.items.slice(0, 2).map((product) => (
              <ProductArtwork key={product.id} product={product} />
            ))}
          </div>
          <span className={styles.heroChip}>
            <EnvironmentOutlined /> Самовывоз рядом с вами
          </span>
        </div>
      </section>
      <form
        ref={searchRef}
        role="search"
        className={styles.search}
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
          if (!desktop) {
            requestAnimationFrame(() => {
              resultsRef.current?.focus({ preventScroll: true });
              resultsRef.current?.scrollIntoView({ block: 'start' });
            });
          }
        }}
      >
        <SearchField
          draft={draft}
          query={query}
          products={inventory.products}
          disabled={!hydrated}
          unavailable={!inventory.ready || inventory.isError || isError}
          onChange={searchChanged}
          onSelect={cancelPendingSearch}
        />
        <Button variant="primary" type="submit" disabled={!hydrated}>
          Найти <ArrowRightOutlined />
        </Button>
      </form>
      <div className={styles.mobileHeading}>
        <h1>Каталог</h1>
        <span>Всё нужное — рядом</span>
      </div>
      <nav className={styles.quickCategories} aria-label="Популярные разделы">
        {categories.slice(1, 7).map((category) => (
          <Link prefetch={false} key={category} href={`/?category=${encodeURIComponent(category)}`}>
            <AppstoreOutlined aria-hidden="true" />
            <span>{category}</span>
          </Link>
        ))}
      </nav>
      <div className={styles.categoryRail} aria-label="Быстрый выбор категории">
        {[...new Set([...categories.slice(0, 5), query.category])].map((category) => (
          <button
            key={category}
            disabled={!hydrated}
            aria-pressed={query.category === category}
            onClick={() => update(categoryPatch(category))}
          >
            {category}
          </button>
        ))}
        <button
          type="button"
          disabled={!hydrated}
          onClick={(event) => {
            setFilterTrigger(event.currentTarget);
            showFilters();
          }}
          aria-haspopup="dialog"
          aria-expanded={filtersOpen}
          aria-label="Все категории"
        >
          Все категории <AppstoreOutlined aria-hidden="true" />
        </button>
      </div>
      <section className={styles.layout} aria-label="Каталог товаров">
        <aside className={styles.sidebar} aria-label="Фильтры каталога">
          {desktop ? (
            <DesktopFilters
              query={query}
              products={inventory.products}
              disabled={!hydrated}
              onReset={reset}
              onChange={(patch) =>
                update(
                  patch,
                  Object.keys(patch).some((key) => ['min', 'max', 'age'].includes(key)),
                )
              }
            />
          ) : (
            <FilterPlaceholder />
          )}
        </aside>
        <div className={styles.main}>
          <div className={styles.toolbar}>
            <div>
              <h2
                id="catalog-results"
                ref={resultsRef}
                tabIndex={-1}
                className={styles.resultsTitle}
              >
                {query.q
                  ? `Поиск: «${query.q}»`
                  : query.category === 'Все товары'
                    ? 'Для вас и ваших близких'
                    : query.category}
              </h2>
              <span className="muted">
                {productCount(result.total)} · аптека «
                {pharmacies.find((p) => p.id === pharmacy)!.name}»
              </span>
            </div>
            <div className={styles.catalogControls}>
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
              <Button
                ref={setFilterTrigger}
                aria-label={`Категории и фильтры${filterCount ? `, применено: ${filterCount}` : ''}`}
                aria-haspopup="dialog"
                aria-expanded={filtersOpen}
                onPointerEnter={() => {
                  void import('./filter-drawer').catch(() => {});
                }}
                onFocus={() => {
                  void import('./filter-drawer').catch(() => {});
                }}
                className={styles.mobileFilters}
                icon={<SlidersOutlined />}
                onClick={(event) => {
                  setFilterTrigger(event.currentTarget);
                  showFilters();
                }}
              >
                Фильтры {filterCount > 0 && <span aria-hidden="true">· {filterCount}</span>}
              </Button>
            </div>
          </div>
          <AppliedFilters query={query} onChange={update} onReset={reset} />
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
                    Восстановить соединение
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
            <ProductGrid
              ref={gridRef}
              products={visible}
              pharmacy={pharmacy}
              busy={isFetching || isError}
            />
          )}
          {result.total > 0 && (
            <div className={styles.loadMore}>
              <p role="status" aria-live="polite" className="muted">
                Показано товаров: {visible.length} из {result.total}
              </p>
              {visible.length < result.total && (
                <Button
                  disabled={!hydrated || isFetching || isError}
                  onClick={() => {
                    focusIndex.current = visible.length;
                    update({ page: String(page + 1) });
                  }}
                >
                  Показать ещё {productCount(Math.min(BATCH_SIZE, result.total - visible.length))}
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
      {filtersOpen && (
        <FilterDrawer
          query={query}
          products={inventory.products}
          onApply={update}
          onClose={closeFilters}
        />
      )}
      {new URLSearchParams(search).get('diagnostics') === '1' && (
        <details className={styles.demoPanel}>
          <summary>Проверить поведение интерфейса</summary>
          <p>Диагностика соединения с каталогом.</p>
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
      )}
    </main>
  );
}
