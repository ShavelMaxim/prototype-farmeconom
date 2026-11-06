import { z } from 'zod';
import { pharmacySchema, type PharmacyId } from '@/shared/config/pharmacy-id';
export { pharmacySchema, type PharmacyId } from '@/shared/config/pharmacy-id';
export const categories = [
  'Все товары',
  'Уход и гигиена',
  'Медтехника',
  'Первая помощь',
  'Для детей',
] as const;
export type Offer = { price: number; stock: number };
export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  details: string;
  category: string;
  brand: string;
  size: string;
  kind: 'bottle' | 'box' | 'device' | 'tube';
  color: string;
  label: string;
  offers: Record<PharmacyId, Offer>;
};
export const catalogQuerySchema = z.object({
  q: z.string().trim().max(80).default(''),
  category: z.enum(categories).default('Все товары'),
  sort: z.enum(['popular', 'price-asc', 'price-desc', 'name']).default('popular'),
  available: z.enum(['true', 'false']).default('false'),
  pharmacy: pharmacySchema.default('central'),
});
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
export type CatalogResponse = { items: Product[]; total: number };
export function parseCatalogQuery(input: Record<string, unknown>): CatalogQuery {
  const parsed = catalogQuerySchema.safeParse(input);
  return parsed.success ? parsed.data : catalogQuerySchema.parse({});
}
export function money(kopecks: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(kopecks / 100);
}
