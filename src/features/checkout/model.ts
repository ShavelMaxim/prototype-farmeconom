import { z } from 'zod';
import { pharmacySchema } from '@/entities/product/model';
import { productIdSchema } from '@/shared/config/product-id';
export const checkoutFormSchema = z.object({
  pickup: z.enum(['today', 'tomorrow']),
  acknowledge: z.boolean().refine((value) => value, 'Подтвердите сохранение заказа на устройстве'),
});
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
export const checkoutRequestSchema = checkoutFormSchema.extend({
  pharmacy: pharmacySchema,
  items: z
    .array(z.object({ id: productIdSchema, quantity: z.number().int().min(1).max(99) }))
    .min(1)
    .max(50)
    .refine(
      (items) => new Set(items.map((i) => i.id)).size === items.length,
      'Повторяющиеся товары',
    ),
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export const checkoutResponseSchema = z.object({
  reference: z.string().min(1),
  total: z.number().int().nonnegative(),
  count: z.number().int().positive(),
  message: z.string().min(1),
});
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;
