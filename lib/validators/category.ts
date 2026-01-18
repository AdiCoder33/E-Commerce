import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Name is required').max(80),
  slug: z.string().min(2).max(80).optional().nullable()
});

export type CategoryInput = z.infer<typeof categorySchema>;
