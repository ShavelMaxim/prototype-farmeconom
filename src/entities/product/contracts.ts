import { z } from 'zod';
import { productIdSchema } from '@/shared/config/product-id';
import { categories } from './model';
import { audiences, features } from './facets';
const offerSchema = z.object({
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
});
export const productSchema = z
  .object({
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
    audience: z
      .array(
        z.enum(Object.keys(audiences) as [keyof typeof audiences, ...(keyof typeof audiences)[]]),
      )
      .default([]),
    features: z
      .array(z.enum(Object.keys(features) as [keyof typeof features, ...(keyof typeof features)[]]))
      .default([]),
    minAgeMonths: z.number().int().nonnegative().optional(),
    maxAgeMonths: z.number().int().nonnegative().optional(),
    form: z.string().default(''),
    dose: z.string().default(''),
    packCount: z.number().int().positive().optional(),
    ingredient: z.string().default(''),
    manufacturer: z.string().default('Учебная коллекция'),
    relationGroup: z.string().optional(),
    medicalDemo: z.boolean().default(false),
    flavor: z.string().optional(),
    weightGrams: z.number().positive().optional(),
    volumeMl: z.number().positive().optional(),
    material: z.string().optional(),
    variantSize: z.string().optional(),
    skinType: z.string().optional(),
    offers: z.object({ central: offerSchema, park: offerSchema, family: offerSchema }),
  })
  .refine(
    (product) =>
      product.maxAgeMonths === undefined ||
      (product.minAgeMonths !== undefined && product.maxAgeMonths >= product.minAgeMonths),
    'Некорректный возрастной диапазон',
  );
export const catalogResponseSchema = z
  .object({ items: z.array(productSchema), total: z.number().int().nonnegative() })
  .refine(
    ({ items, total }) =>
      items.length === total &&
      new Set(items.map((p) => p.id)).size === total &&
      new Set(items.map((p) => p.slug)).size === total,
    'Ожидается полный каталог с уникальными товарами',
  );
