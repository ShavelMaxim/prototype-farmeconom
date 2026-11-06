import * as z from 'zod/mini';
export const pharmacySchema = z.enum(['central', 'park', 'family']);
export type PharmacyId = z.infer<typeof pharmacySchema>;
