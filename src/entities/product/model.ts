import * as z from 'zod/mini';
import { pharmacySchema } from '@/shared/config/pharmacy-id';
export { pharmacySchema, type PharmacyId } from '@/shared/config/pharmacy-id';
export const categories = [
  'Все товары',
  'Уход и гигиена',
  'Медтехника',
  'Первая помощь',
  'Для детей',
  'Лекарственные средства',
  'Витамины и БАДы',
  'Питание',
  'Спортивное питание',
  'Материнство',
  'Косметика',
  'Ортопедия и реабилитация',
  'Гомеопатия',
] as const;
export type Offer = { price: number; stock: number };
export type Product = import('zod').infer<typeof import('./contracts').productSchema>;
export const catalogQuerySchema = z.object({
  q: z._default(z.string().check(z.trim(), z.maxLength(80)), ''),
  category: z._default(z.enum(categories), 'Все товары'),
  sort: z._default(z.enum(['popular', 'price-asc', 'price-desc', 'name']), 'popular'),
  available: z._default(z.enum(['true', 'false']), 'false'),
  pharmacy: z._default(pharmacySchema, 'central'),
  audience: z._default(z.string().check(z.maxLength(200)), ''),
  brand: z._default(z.string().check(z.maxLength(240)), ''),
  feature: z._default(z.string().check(z.maxLength(200)), ''),
  form: z._default(z.string().check(z.maxLength(200)), ''),
  dose: z._default(z.string().check(z.maxLength(200)), ''),
  packs: z._default(z.string().check(z.maxLength(100)), ''),
  ingredient: z._default(z.string().check(z.maxLength(200)), ''),
  min: z._default(z.string().check(z.regex(/^\d{0,6}$/)), ''),
  max: z._default(z.string().check(z.regex(/^\d{0,6}$/)), ''),
  age: z._default(z.string().check(z.regex(/^(?:\d{1,3})?$/)), ''),
  flavor: z._default(z.string().check(z.maxLength(200)), ''),
  weight: z._default(z.string().check(z.maxLength(200)), ''),
  volume: z._default(z.string().check(z.maxLength(200)), ''),
  material: z._default(z.string().check(z.maxLength(200)), ''),
  size: z._default(z.string().check(z.maxLength(200)), ''),
  skin: z._default(z.string().check(z.maxLength(200)), ''),
  manufacturer: z._default(z.string().check(z.maxLength(240)), ''),
});
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
export type CatalogResponse = { items: Product[]; total: number };
export function parseCatalogQuery(input: Record<string, unknown>): CatalogQuery {
  const parsed = catalogQuerySchema.safeParse(input);
  if (parsed.success) return parsed.data;
  const defaults = catalogQuerySchema.parse({});
  const repaired = { ...input };
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof CatalogQuery;
    if (key in defaults) repaired[key] = defaults[key];
  }
  return catalogQuerySchema.parse(repaired);
}
const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});
export function money(kopecks: number) {
  return rubles.format(kopecks / 100);
}
