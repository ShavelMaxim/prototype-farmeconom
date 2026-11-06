import { z } from 'zod';
import { productIdSchema } from '@/shared/config/product-id';
import { categories } from './model';
const offerSchema = z.object({
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
});
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
export const catalogResponseSchema = z
  .object({ items: z.array(productSchema), total: z.number().int().nonnegative() })
  .refine(
    ({ items, total }) =>
      items.length === total &&
      new Set(items.map((p) => p.id)).size === total &&
      new Set(items.map((p) => p.slug)).size === total,
    'Ожидается полный каталог с уникальными товарами',
  );
