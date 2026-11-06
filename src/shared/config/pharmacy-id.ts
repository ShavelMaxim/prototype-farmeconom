import { z } from 'zod';
export const pharmacySchema = z.enum(['central', 'park', 'family']);
export type PharmacyId = z.infer<typeof pharmacySchema>;
