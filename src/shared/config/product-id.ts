import { z } from 'zod';
// IDs are opaque API identifiers; they are never used as HTML or route paths.
export const productIdSchema = z.string().min(1).max(128);
