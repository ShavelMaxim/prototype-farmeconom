import { describe, expect, it } from 'vitest';
import { catalogQuerySchema } from './model';
import { getCatalog, products } from './repository';
describe('демонстрационный каталог', () => {
  it('имеет уникальные slug и корректные цены/остатки для каждой аптеки', () => {
    expect(products).toHaveLength(24);
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
    for (const p of products)
      for (const offer of Object.values(p.offers)) {
        expect(Number.isInteger(offer.price)).toBe(true);
        expect(offer.price).toBeGreaterThan(0);
        expect(offer.stock).toBeGreaterThanOrEqual(0);
      }
  });
  it('совмещает поиск, категорию, наличие и сортировку выбранной аптеки', () => {
    const query = catalogQuerySchema.parse({
      q: 'для',
      category: 'Уход и гигиена',
      available: 'true',
      pharmacy: 'family',
      sort: 'price-asc',
    });
    const result = getCatalog(query);
    expect(result.items.length).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(item.name.toLowerCase()).toContain('для');
      expect(item.offers.family.stock).toBeGreaterThan(0);
    }
    const prices = result.items.map((p) => p.offers.family.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
  it('понимает ё/е и не меняет порядок исходного каталога при сортировке', () => {
    const original = products.map((p) => p.id);
    expect(getCatalog(catalogQuerySchema.parse({ q: 'щетка' })).total).toBe(1);
    getCatalog(catalogQuerySchema.parse({ sort: 'price-desc' }));
    expect(products.map((p) => p.id)).toEqual(original);
  });
  it('возвращает пустой результат для неизвестного запроса', () => {
    expect(getCatalog(catalogQuerySchema.parse({ q: 'несуществующийтовар' })).total).toBe(0);
  });
});
