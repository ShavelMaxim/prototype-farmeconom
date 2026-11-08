import { useState, type ReactNode } from 'react';
import { categories, type CatalogQuery, type Product } from '@/entities/product/model';
import {
  audiences,
  features,
  medicalCategories,
  toggleValue,
  values,
  type FacetKey,
  categoryPatch,
} from '@/entities/product/facets';
import styles from './filters.module.css';

export function FilterFields({
  query,
  products,
  onChange,
  disabled = false,
  priceSlider,
  compactCategories = false,
}: {
  query: CatalogQuery;
  products: Product[];
  onChange: (patch: Record<string, string>) => void;
  disabled?: boolean;
  priceSlider?: ReactNode;
  compactCategories?: boolean;
}) {
  const [ageUnit, setAgeUnit] = useState('months');
  const subset = products.filter(
    (p) => query.category === 'Все товары' || p.category === query.category,
  );
  const medical = medicalCategories.includes(query.category);
  function options(
    key: FacetKey,
    title: string,
    entries: [string, string][],
    field: (p: Product) => string[],
  ) {
    const counts = new Map<string, number>();
    subset.forEach((p) => field(p).forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1)));
    const selected = values(query[key]);
    const shown = entries.filter(
      ([value]) => (counts.get(value) ?? 0) > 0 || selected.includes(value),
    );
    if (!shown.length) return null;
    return (
      <details className={styles.group} open={key === 'audience' || key === 'feature'}>
        <summary>
          {title}
          <span>{selected.length || ''}</span>
        </summary>
        <div className={styles.options}>
          {shown.map(([value, label]) => (
            <label key={value}>
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => {
                  const next = toggleValue(query[key], value);
                  onChange({
                    [key]: next,
                    ...(key === 'audience' && !values(next).includes('children')
                      ? { age: '' }
                      : {}),
                  });
                }}
              />
              <span>{label}</span>
              <small>{counts.get(value) ?? 0}</small>
            </label>
          ))}
        </div>
      </details>
    );
  }
  const unique = (field: (p: Product) => string): [string, string][] =>
    [...new Set(subset.map(field).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'ru'))
      .map((v) => [v, v]);
  return (
    <fieldset className={styles.fields} disabled={disabled}>
      <legend className="visually-hidden">Условия подбора товаров</legend>
      <details className={styles.group} open={!compactCategories}>
        <summary>
          Категории
          {compactCategories && (
            <small className={styles.categorySelection}>{query.category}</small>
          )}
        </summary>
        <div className={styles.categories}>
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              aria-pressed={query.category === category}
              onClick={() => onChange(categoryPatch(category))}
            >
              {category}
              <small>
                {category === 'Все товары'
                  ? products.length
                  : products.filter((p) => p.category === category).length}
              </small>
            </button>
          ))}
        </div>
      </details>
      <label className={styles.availability}>
        <input
          type="checkbox"
          checked={query.available === 'true'}
          onChange={(e) => onChange({ available: e.target.checked ? 'true' : '' })}
        />
        Только в наличии
      </label>
      <p className={styles.note}>
        Цена и наличие — в выбранной аптеке. Числа у вариантов — товары в категории.
      </p>
      <div className={styles.group}>
        <p className={styles.title}>Цена, ₽</p>
        {priceSlider}
        <div className={styles.range}>
          <label>
            От
            <input
              aria-label="Цена от, рублей"
              inputMode="numeric"
              placeholder="0"
              value={query.min}
              onChange={(e) => onChange({ min: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            />
          </label>
          <label>
            До
            <input
              aria-label="Цена до, рублей"
              inputMode="numeric"
              placeholder="Любая"
              value={query.max}
              onChange={(e) => onChange({ max: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            />
          </label>
        </div>
        {query.min && query.max && Number(query.min) > Number(query.max) && (
          <p role="alert" className={styles.warning}>
            Цена «от» больше цены «до». Исправьте диапазон.
          </p>
        )}
      </div>
      {options('audience', 'Для кого', Object.entries(audiences), (p) => p.audience)}
      {values(query.audience).includes('children') && (
        <div className={styles.group}>
          <div className={styles.title}>
            Возраст ребёнка
            <span className={styles.range}>
              <input
                aria-label="Возраст ребёнка"
                inputMode="numeric"
                placeholder="Укажите возраст"
                value={query.age ? String(Number(query.age) / (ageUnit === 'years' ? 12 : 1)) : ''}
                onChange={(e) => {
                  const n = e.target.value.replace(/\D/g, '').slice(0, 3);
                  onChange({
                    age: n
                      ? String(
                          Math.min(Number(n), ageUnit === 'years' ? 17 : 216) *
                            (ageUnit === 'years' ? 12 : 1),
                        )
                      : '',
                  });
                }}
              />
              <select
                aria-label="Единица возраста"
                value={ageUnit}
                onChange={(e) => {
                  setAgeUnit(e.target.value);
                  onChange({ age: '' });
                }}
              >
                <option value="months">месяцев</option>
                <option value="years">лет</option>
              </select>
            </span>
          </div>
          <p className={styles.note}>
            Сопоставление с возрастной маркировкой. Возраст не определяет дозу лекарства.
          </p>
        </div>
      )}
      {medical && (
        <p className={styles.warning}>
          Фильтры не подтверждают возможность применения при беременности, кормлении и в детском
          возрасте.
        </p>
      )}
      {options('feature', 'Особенности', Object.entries(features), (p) => p.features)}
      {options(
        'brand',
        'Бренд',
        unique((p) => p.brand),
        (p) => [p.brand],
      )}
      {options(
        'form',
        'Форма выпуска / формат',
        unique((p) => p.form),
        (p) => [p.form],
      )}
      {medical &&
        options(
          'dose',
          'Дозировка',
          unique((p) => p.dose),
          (p) => [p.dose],
        )}
      {options(
        'packs',
        'Количество в упаковке',
        unique((p) => (p.packCount ? String(p.packCount) : '')),
        (p) => (p.packCount ? [String(p.packCount)] : []),
      )}
      {medical &&
        options(
          'ingredient',
          'Действующее вещество',
          unique((p) => p.ingredient),
          (p) => [p.ingredient],
        )}
      {options(
        'flavor',
        'Вкус',
        unique((p) => p.flavor ?? ''),
        (p) => (p.flavor ? [p.flavor] : []),
      )}
      {options(
        'weight',
        'Масса, г',
        unique((p) => (p.weightGrams ? String(p.weightGrams) : '')),
        (p) => (p.weightGrams ? [String(p.weightGrams)] : []),
      )}
      {options(
        'volume',
        'Объём, мл',
        unique((p) => (p.volumeMl ? String(p.volumeMl) : '')),
        (p) => (p.volumeMl ? [String(p.volumeMl)] : []),
      )}
      {options(
        'material',
        'Материал',
        unique((p) => p.material ?? ''),
        (p) => (p.material ? [p.material] : []),
      )}
      {options(
        'size',
        'Размер',
        unique((p) => p.variantSize ?? ''),
        (p) => (p.variantSize ? [p.variantSize] : []),
      )}
      {options(
        'skin',
        'Тип кожи',
        unique((p) => p.skinType ?? ''),
        (p) => (p.skinType ? [p.skinType] : []),
      )}
      {options(
        'manufacturer',
        'Производитель',
        unique((p) => p.manufacturer),
        (p) => [p.manufacturer],
      )}
    </fieldset>
  );
}
