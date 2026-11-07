export const audiences = {
  children: 'Для детей',
  pregnant: 'Для беременных',
  nursing: 'Для кормящих мам',
  women: 'Женский уход',
  men: 'Мужской уход',
  seniors: 'Уход за пожилыми',
  recovery: 'Реабилитация',
  sport: 'Спорт и активность',
} as const;
export const features = {
  'sugar-free': 'Без сахара',
  'lactose-free': 'Без лактозы',
  'gluten-free': 'Без глютена',
  'fragrance-free': 'Без отдушек',
  'latex-free': 'Без латекса',
  sterile: 'Стерильно',
  disposable: 'Одноразовое',
} as const;
export type Audience = keyof typeof audiences;
export type ProductFeature = keyof typeof features;
export const facetKeys = [
  'audience',
  'brand',
  'feature',
  'form',
  'dose',
  'packs',
  'ingredient',
  'min',
  'max',
  'age',
  'flavor',
  'weight',
  'volume',
  'material',
  'size',
  'skin',
  'manufacturer',
] as const;
export type FacetKey = (typeof facetKeys)[number];
export function values(value: string) {
  return value ? value.split('|') : [];
}
export function toggleValue(value: string, option: string) {
  const selected = new Set(values(value));
  if (selected.has(option)) selected.delete(option);
  else selected.add(option);
  return [...selected].sort().join('|');
}
export const medicalCategories = ['Лекарственные средства', 'Гомеопатия'];
