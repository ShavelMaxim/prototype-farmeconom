import { describe, expect, it } from 'vitest';
import { catalogQuerySchema, parseCatalogQuery } from './model';
import { getCatalog, products } from './repository';
describe('расширенные условия каталога', () => {
  it('сочетает аудиторию, возраст и особенности без предположения о неизвестном возрасте', () => {
    const result = getCatalog(
      catalogQuerySchema.parse({ audience: 'children', age: '4', feature: 'fragrance-free' }),
    );
    expect(result.items.map((p) => p.slug)).toEqual(['baby-wipes']);
    expect(
      getCatalog(catalogQuerySchema.parse({ audience: 'children', age: '4' })).items.some(
        (p) => p.slug === 'baby-spoon',
      ),
    ).toBe(false);
    expect(
      getCatalog(catalogQuerySchema.parse({ audience: 'children', age: '8' })).items.some(
        (p) => p.slug === 'baby-spoon',
      ),
    ).toBe(true);
  });
  it('объединяет значения аудитории через ИЛИ, а группу цены через И', () => {
    const result = getCatalog(
      catalogQuerySchema.parse({ audience: 'nursing|pregnant', max: '400' }),
    );
    expect(result.items.map((p) => p.slug)).toEqual(['nursing-pads']);
    expect(
      products.filter((p) => p.medicalDemo).every((p) => !p.audience.includes('nursing')),
    ).toBe(true);
  });
  it('сравнивает цену выбранной аптеки в копейках, упаковку, форму и вещество', () => {
    const result = getCatalog(
      catalogQuerySchema.parse({
        category: 'Лекарственные средства',
        form: 'Таблетки',
        ingredient: 'Компонент A',
        packs: '40',
        dose: '10 мг',
        min: '250',
        pharmacy: 'park',
      }),
    );
    expect(result.items.map((p) => p.slug)).toEqual(['demo-tablets-a-large']);
    expect(
      getCatalog(
        catalogQuerySchema.parse({ category: 'Лекарственные средства', min: '500', max: '100' }),
      ).total,
    ).toBe(0);
  });
  it('не сбрасывает остальные условия из-за одного повреждённого параметра URL', () => {
    expect(parseCatalogQuery({ q: 'термометр', min: '-1', audience: 'children' })).toMatchObject({
      q: 'термометр',
      min: '',
      audience: 'children',
    });
  });
  it('различает вкус и массу спортивного питания, материал и размер изделий', () => {
    expect(
      getCatalog(
        catalogQuerySchema.parse({
          category: 'Спортивное питание',
          flavor: 'Ваниль',
          weight: '450',
        }),
      ).items.map((p) => p.slug),
    ).toEqual(['protein-vanilla']);
    expect(
      getCatalog(
        catalogQuerySchema.parse({
          category: 'Ортопедия и реабилитация',
          material: 'Текстиль',
          size: 'M',
        }),
      ).items.map((p) => p.slug),
    ).toEqual(['wrist-support']);
  });
});
