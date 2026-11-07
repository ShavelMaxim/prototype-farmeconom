import type { CatalogQuery, Product } from './model';
import { values } from './facets';
export function filterCatalog(query: CatalogQuery, source: Product[]) {
  const normalized = query.q
    .trim()
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .replace(/\s+/g, ' ');
  const items = source.filter(
    (p) =>
      `${p.name} ${p.brand} ${p.category} ${p.ingredient}`
        .toLocaleLowerCase('ru-RU')
        .replaceAll('ё', 'е')
        .replace(/\s+/g, ' ')
        .includes(normalized) &&
      (query.category === 'Все товары' || p.category === query.category) &&
      (query.available !== 'true' || p.offers[query.pharmacy].stock > 0) &&
      (!query.min || p.offers[query.pharmacy].price >= Number(query.min) * 100) &&
      (!query.max || p.offers[query.pharmacy].price <= Number(query.max) * 100) &&
      (!query.audience || values(query.audience).some((a) => p.audience.some((x) => x === a))) &&
      (!query.feature || values(query.feature).some((f) => p.features.some((x) => x === f))) &&
      (!query.brand || values(query.brand).includes(p.brand)) &&
      (!query.form || values(query.form).includes(p.form)) &&
      (!query.dose || values(query.dose).includes(p.dose)) &&
      (!query.packs || values(query.packs).includes(String(p.packCount))) &&
      (!query.ingredient || values(query.ingredient).includes(p.ingredient)) &&
      (!query.flavor || values(query.flavor).includes(p.flavor ?? '')) &&
      (!query.weight || values(query.weight).includes(String(p.weightGrams))) &&
      (!query.volume || values(query.volume).includes(String(p.volumeMl))) &&
      (!query.material || values(query.material).includes(p.material ?? '')) &&
      (!query.size || values(query.size).includes(p.variantSize ?? '')) &&
      (!query.skin || values(query.skin).includes(p.skinType ?? '')) &&
      (!query.manufacturer || values(query.manufacturer).includes(p.manufacturer)) &&
      (!query.age ||
        (p.audience.includes('children') &&
          p.minAgeMonths !== undefined &&
          Number(query.age) >= p.minAgeMonths &&
          (p.maxAgeMonths === undefined || Number(query.age) <= p.maxAgeMonths))),
  );
  if (query.sort === 'price-asc')
    items.sort((a, b) => a.offers[query.pharmacy].price - b.offers[query.pharmacy].price);
  if (query.sort === 'price-desc')
    items.sort((a, b) => b.offers[query.pharmacy].price - a.offers[query.pharmacy].price);
  if (query.sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  return { items, total: items.length };
}
