'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkoutSchema, type CheckoutInput } from '@/lib/validators/checkout';

type PlaceOrderResult = {
  ok: boolean;
  orderId?: string;
  totalAmount?: number;
  error?: string;
};

export async function placeOrder(input: CheckoutInput): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid order data'
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'Login required to place an order.' };
  }

  const { cartItems, shipping, paymentMethod } = parsed.data;

  const { data, error } = await supabase.rpc('create_order_from_cart', {
    cart_items: cartItems,
    shipping,
    payment_method: paymentMethod
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row?.order_id) {
    return { ok: false, error: 'Order could not be created.' };
  }

  return {
    ok: true,
    orderId: row.order_id,
    totalAmount: row.total_amount
  };
}
