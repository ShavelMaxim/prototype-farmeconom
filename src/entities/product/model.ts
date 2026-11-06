import * as z from 'zod/mini';
import { pharmacySchema } from '@/shared/config/pharmacy-id';
export { pharmacySchema, type PharmacyId } from '@/shared/config/pharmacy-id';
export const categories = [
  'Все товары',
  'Уход и гигиена',
  'Медтехника',
  'Первая помощь',
  'Для детей',
] as const;
export type Offer = { price: number; stock: number };
export type Product = import('zod').infer<typeof import('./contracts').productSchema>;
export const catalogQuerySchema = z.object({
  q: z._default(z.string().check(z.trim(), z.maxLength(80)), ''),
  category: z._default(z.enum(categories), 'Все товары'),
  sort: z._default(z.enum(['popular', 'price-asc', 'price-desc', 'name']), 'popular'),
  available: z._default(z.enum(['true', 'false']), 'false'),
  pharmacy: z._default(pharmacySchema, 'central'),
});
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
export type CatalogResponse = { items: Product[]; total: number };
export function parseCatalogQuery(input: Record<string, unknown>): CatalogQuery {
  const parsed = catalogQuerySchema.safeParse(input);
  return parsed.success ? parsed.data : catalogQuerySchema.parse({});
}
const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});
export function money(kopecks: number) {
  return rubles.format(kopecks / 100);
}
