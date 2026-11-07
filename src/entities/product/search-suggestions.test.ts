import { expect, it } from 'vitest';
import { products } from './repository';
import { catalogQuerySchema } from './model';
import { searchSuggestions } from './search-suggestions';
import { filterCatalog } from './filter-catalog';

it('подсказывает названия и бренды, нормализует регистр/ё, ограничивает выдачу', () => {
  const query = catalogQuerySchema.parse({});
  expect(searchSuggestions(' ТЕРМОМЕТР ', products, query).items.map((p) => p.slug)).toContain(
    'digital-thermometer',
  );
  expect(searchSuggestions('HOME', products, query).items.length).toBeGreaterThan(0);
  expect(searchSuggestions('для', products, query).items.length).toBeLessThanOrEqual(5);
  expect(searchSuggestions('ЁЛКА', [{ ...products[0], name: 'Елка' }], query).items).toHaveLength(
    1,
  );
  expect(searchSuggestions('т', products, query).items).toHaveLength(0);
  const spaced = 'ЭЛЕКТРОННЫЙ  термометр';
  expect(searchSuggestions(spaced, products, query).items[0].slug).toBe('digital-thermometer');
  expect(filterCatalog({ ...query, q: spaced }, products).items[0].slug).toBe(
    'digital-thermometer',
  );
});
it('не обходит категорию и наличие выбранной аптеки', () => {
  const query = catalogQuerySchema.parse({ category: 'Питание' });
  expect(searchSuggestions('термометр', products, query).items).toHaveLength(0);
  const unavailable = [
    { ...products[1], offers: { ...products[1].offers, park: { price: 100, stock: 0 } } },
  ];
  expect(
    searchSuggestions(
      'термометр',
      unavailable,
      catalogQuerySchema.parse({ pharmacy: 'park', available: 'true' }),
    ).items,
  ).toHaveLength(0);
});
it('предлагает только единственное исправление одной ошибки, не меняет исходный запрос', () => {
  const query = catalogQuerySchema.parse({});
  expect(searchSuggestions('терммоетр', products, query).correction).toBe('термометр');
  for (const text of ['100мг', 'терм', 'терммоетр детский', 'zzzzzz'])
    expect(searchSuggestions(text, products, query).correction).toBe('');
  expect(query.q).toBe('');
});
it('не предлагает неоднозначное исправление', () => {
  const items = [
    { ...products[0], name: 'термометр', brand: '' },
    { ...products[1], name: 'термиметр', brand: '' },
  ];
  expect(searchSuggestions('термметр', items, catalogQuerySchema.parse({})).correction).toBe('');
});
