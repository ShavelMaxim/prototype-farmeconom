import * as z from 'zod/mini';
// IDs are opaque API identifiers; they are never used as HTML or route paths.
export const productIdSchema = z.string().check(z.minLength(1), z.maxLength(128));
