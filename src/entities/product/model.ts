import { z } from 'zod';
import { pharmacySchema } from '@/shared/config/pharmacy-id';
import { productIdSchema } from '@/shared/config/product-id';
export { pharmacySchema, type PharmacyId } from '@/shared/config/pharmacy-id';
export const categories = [
  'Все товары',
  'Уход и гигиена',
  'Медтехника',
  'Первая помощь',
  'Для детей',
] as const;
const offerSchema = z.object({
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
});
export type Offer = z.infer<typeof offerSchema>;
export const productSchema = z.object({
  id: productIdSchema,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  description: z.string(),
  details: z.string(),
  category: z.enum(categories),
  brand: z.string(),
  size: z.string(),
  kind: z.enum(['bottle', 'box', 'device', 'tube']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  label: z.string(),
  offers: z.object({ central: offerSchema, park: offerSchema, family: offerSchema }),
});
export type Product = z.infer<typeof productSchema>;
export const catalogQuerySchema = z.object({
  q: z.string().trim().max(80).default(''),
  category: z.enum(categories).default('Все товары'),
  sort: z.enum(['popular', 'price-asc', 'price-desc', 'name']).default('popular'),
  available: z.enum(['true', 'false']).default('false'),
  pharmacy: pharmacySchema.default('central'),
});
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
export const catalogResponseSchema = z
  .object({ items: z.array(productSchema), total: z.number().int().nonnegative() })
  .refine(
    ({ items, total }) =>
      items.length === total &&
      new Set(items.map((p) => p.id)).size === total &&
      new Set(items.map((p) => p.slug)).size === total,
    'Ожидается полный каталог с уникальными товарами',
  );
export type CatalogResponse = z.infer<typeof catalogResponseSchema>;
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
