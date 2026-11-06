import { z } from 'zod';
import { pharmacySchema } from '@/entities/product/model';
export const checkoutFormSchema = z.object({
  pickup: z.enum(['today', 'tomorrow']),
  acknowledge: z.boolean().refine((value) => value, 'Подтвердите, что это демонстрационный заказ'),
});
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
export const checkoutRequestSchema = checkoutFormSchema.extend({
  pharmacy: pharmacySchema,
  items: z
    .array(z.object({ id: z.string().min(1), quantity: z.number().int().min(1).max(99) }))
    .min(1)
    .max(50)
    .refine(
      (items) => new Set(items.map((i) => i.id)).size === items.length,
      'Повторяющиеся товары',
    ),
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type CheckoutResponse = { reference: string; total: number; count: number; message: string };
