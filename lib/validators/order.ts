import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled'
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;
