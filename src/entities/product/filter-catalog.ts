import type { CatalogQuery, Product } from './model';
export function filterCatalog(query: CatalogQuery, source: Product[]) {
  const normalized = query.q.toLocaleLowerCase('ru-RU').replaceAll('ё', 'е');
  const items = source.filter(
    (p) =>
      `${p.name} ${p.brand} ${p.category}`
        .toLocaleLowerCase('ru-RU')
        .replaceAll('ё', 'е')
        .includes(normalized) &&
      (query.category === 'Все товары' || p.category === query.category) &&
      (query.available !== 'true' || p.offers[query.pharmacy].stock > 0),
  );
  if (query.sort === 'price-asc')
    items.sort((a, b) => a.offers[query.pharmacy].price - b.offers[query.pharmacy].price);
  if (query.sort === 'price-desc')
    items.sort((a, b) => b.offers[query.pharmacy].price - a.offers[query.pharmacy].price);
  if (query.sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  return { items, total: items.length };
}
