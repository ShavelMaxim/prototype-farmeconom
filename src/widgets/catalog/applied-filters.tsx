import type { CatalogQuery } from '@/entities/product/model';
import { audiences, features, facetKeys, values } from '@/entities/product/facets';
import styles from './filters.module.css';
export function AppliedFilters({
  query,
  onChange,
  onReset,
}: {
  query: CatalogQuery;
  onChange: (patch: Record<string, string>) => void;
  onReset: () => void;
}) {
  const labels: Record<string, string> = {
    brand: 'Бренд',
    form: 'Форма',
    dose: 'Дозировка',
    packs: 'В упаковке',
    ingredient: 'Вещество',
    flavor: 'Вкус',
    weight: 'Масса, г',
    volume: 'Объём, мл',
    material: 'Материал',
    size: 'Размер',
    skin: 'Тип кожи',
    manufacturer: 'Производитель',
  };
  const chips: { id: string; label: string; patch: Record<string, string> }[] = [];
  if (query.category !== 'Все товары')
    chips.push({ id: 'category', label: query.category, patch: { category: '' } });
  if (query.available === 'true')
    chips.push({ id: 'available', label: 'В наличии', patch: { available: '' } });
  facetKeys.forEach((key) =>
    values(query[key]).forEach((value) => {
      let label = labels[key] ? `${labels[key]}: ${value}` : value;
      if (key === 'audience') label = audiences[value as keyof typeof audiences] ?? value;
      if (key === 'feature') label = features[value as keyof typeof features] ?? value;
      if (key === 'age') label = `Возраст: ${value} мес.`;
      if (key === 'min') label = `От ${value} ₽`;
      if (key === 'max') label = `До ${value} ₽`;
      chips.push({
        id: `${key}-${value}`,
        label,
        patch: {
          [key]: values(query[key])
            .filter((v) => v !== value)
            .join('|'),
          ...(key === 'audience' && value === 'children' ? { age: '' } : {}),
        },
      });
    }),
  );
  if (!chips.length) return null;
  return (
    <div className={styles.applied} aria-label="Применённые фильтры">
      {chips.map((chip) => (
        <button
          key={chip.id}
          aria-label={`Убрать фильтр: ${chip.label}`}
          onClick={() => onChange(chip.patch)}
        >
          {chip.label} <span aria-hidden="true">×</span>
        </button>
      ))}
      <button onClick={onReset}>Сбросить всё</button>
    </div>
  );
}
