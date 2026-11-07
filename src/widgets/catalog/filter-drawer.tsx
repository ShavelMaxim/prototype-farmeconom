import { AntdBoundary } from '@/shared/ui/antd-boundary';
import { useState } from 'react';
import { Button, Drawer, Slider } from 'antd';
import { catalogQuerySchema, type CatalogQuery, type Product } from '@/entities/product/model';
import { filterCatalog } from '@/entities/product/filter-catalog';
import { FilterFields } from './filter-fields';
import { facetKeys } from '@/entities/product/facets';
import styles from './filters.module.css';
import { productCount } from '@/shared/lib/product-count';
export default function FilterDrawer({
  query,
  products,
  onApply,
  onClose,
}: {
  query: CatalogQuery;
  products: Product[];
  onApply: (patch: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(query);
  const [ready, setReady] = useState(false);
  const count = filterCatalog(draft, products).total;
  const prices = products
    .filter((p) => draft.category === 'Все товары' || p.category === draft.category)
    .map((p) => p.offers[draft.pharmacy].price / 100);
  const lower = prices.length ? Math.floor(Math.min(...prices)) : 0;
  const upper = prices.length ? Math.max(lower + 1, Math.ceil(Math.max(...prices))) : 1;
  const sliderValue = [
    Math.max(lower, Math.min(upper, draft.min ? Number(draft.min) : lower)),
    Math.max(lower, Math.min(upper, draft.max ? Number(draft.max) : upper)),
  ];
  const invalid = Boolean(draft.min && draft.max && Number(draft.min) > Number(draft.max));
  return (
    <AntdBoundary>
      <Drawer
        title="Категории и фильтры"
        open
        afterOpenChange={setReady}
        onClose={onClose}
        styles={{ wrapper: { width: 'min(100vw, 480px)' } }}
        footer={
          <div className={styles.drawerFooter}>
            <Button
              type="primary"
              block
              disabled={invalid}
              onClick={() => {
                const defaults = catalogQuerySchema.parse({});
                onApply(
                  Object.fromEntries(
                    ['category', 'available', ...facetKeys].map((key) => [
                      key,
                      draft[key as keyof CatalogQuery] === defaults[key as keyof CatalogQuery]
                        ? ''
                        : draft[key as keyof CatalogQuery],
                    ]),
                  ),
                );
                onClose();
              }}
            >
              Показать {productCount(count)}
            </Button>
            <Button
              block
              onClick={() =>
                setDraft({
                  ...catalogQuerySchema.parse({}),
                  q: query.q,
                  pharmacy: query.pharmacy,
                  sort: query.sort,
                })
              }
            >
              Сбросить условия
            </Button>
            <Button type="text" onClick={onClose}>
              Отмена
            </Button>
          </div>
        }
      >
        <span hidden data-dialog-ready={ready} />
        <p className="muted">
          Изменения применятся после нажатия «Показать». Закрытие отменяет выбор.
        </p>
        <FilterFields
          query={draft}
          products={products}
          priceSlider={
            <Slider
              range
              min={lower}
              max={upper}
              value={sliderValue}
              ariaLabelForHandle={['Цена от, ползунок', 'Цена до, ползунок']}
              tooltip={{ formatter: (value) => `${value} ₽` }}
              styles={{
                root: { margin: '22px 12px' },
                handle: { width: 24, height: 24, marginTop: -10 },
              }}
              onChange={([min, max]) =>
                setDraft((current) => ({
                  ...current,
                  min: min === lower ? '' : String(min),
                  max: max === upper ? '' : String(max),
                }))
              }
            />
          }
          onChange={(patch) =>
            setDraft(
              (current) =>
                ({
                  ...current,
                  ...patch,
                  category:
                    patch.category === '' ? 'Все товары' : (patch.category ?? current.category),
                  available:
                    patch.available === '' ? 'false' : (patch.available ?? current.available),
                }) as CatalogQuery,
            )
          }
        />
      </Drawer>
    </AntdBoundary>
  );
}
