import { z } from 'zod';

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().positive()
});

export const shippingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z
    .string()
    .min(8, 'Phone number is too short')
    .max(20, 'Phone number is too long')
    .regex(/^[0-9+\-()\s]+$/, 'Phone number is invalid'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(4, 'Postal code is required').max(10),
  country: z.string().min(2).optional().default('India')
});

export const checkoutSchema = z.object({
  cartItems: z.array(cartItemSchema).min(1, 'Cart is empty'),
  shipping: shippingSchema,
  paymentMethod: z.enum(['razorpay', 'payu', 'stripe', 'cod'])
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
