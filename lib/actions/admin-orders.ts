'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { orderStatusSchema } from '@/lib/validators/order';

type ActionResult = {
  ok: boolean;
  error?: string;
};

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<ActionResult> {
  const parsed = orderStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid order status.' };
  }

  const { supabase } = await requireAdmin(`/admin/orders/${orderId}`);

  const { error } = await supabase
    .from('orders')
    .update({ status: parsed.data })
    .eq('id', orderId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');

  return { ok: true };
}
