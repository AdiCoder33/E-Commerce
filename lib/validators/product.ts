import { z } from 'zod';

const coerceNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim();
    return normalized === '' ? NaN : Number(normalized);
  }
  return NaN;
};

const coerceBoolean = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value === 'true' || value === 'on' || value === '1';
  }
  return false;
};

export const productSchema = z.object({
  title: z.string().min(3, 'Title is required').max(120),
  description: z.string().max(5000).optional().nullable(),
  priceRupees: z.preprocess(coerceNumber, z.number().min(0)),
  stock: z.preprocess(coerceNumber, z.number().int().min(0)),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.preprocess(coerceBoolean, z.boolean())
});

export type ProductInput = z.infer<typeof productSchema>;
