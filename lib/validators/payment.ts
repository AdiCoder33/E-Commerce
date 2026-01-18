import { z } from 'zod';

export const paymentCreateSchema = z.object({
  orderId: z.string().uuid()
});

export const paymentVerifySchema = z.object({
  orderId: z.string().uuid(),
  razorpay_order_id: z.string().min(5),
  razorpay_payment_id: z.string().min(5),
  razorpay_signature: z.string().min(10)
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type PaymentVerifyInput = z.infer<typeof paymentVerifySchema>;
