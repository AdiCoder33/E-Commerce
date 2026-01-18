import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createRazorpayOrder, getRazorpayKeyId } from '@/lib/payments/razorpay';
import { paymentCreateSchema } from '@/lib/validators/payment';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getClientIp, rateLimit } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed, retryAfter } = rateLimit(`payments:create:${ip}`, {
    limit: 10,
    windowMs: 60_000
  });

  if (!allowed) {
    const response = jsonError('Too many requests.', 429);
    response.headers.set('Retry-After', retryAfter.toString());
    return response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON payload.', 400);
  }

  const parsed = paymentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid payload.', 400);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError('Unauthorized.', 401);
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, user_id, total_amount, currency, payment_status, status, payment_method')
    .eq('id', parsed.data.orderId)
    .single();

  if (error || !order) {
    return jsonError('Order not found.', 404);
  }

  if (order.user_id !== user.id) {
    return jsonError('Forbidden.', 403);
  }

  if (!['unpaid', 'failed'].includes(order.payment_status)) {
    return jsonError('Order is already paid.', 409);
  }

  if (order.payment_method !== 'razorpay') {
    return jsonError('Selected payment method is not supported for online payment.', 409);
  }

  if (order.status === 'cancelled') {
    return jsonError('Order is cancelled.', 409);
  }

  if (!order.total_amount || order.total_amount <= 0) {
    return jsonError('Order total is invalid.', 400);
  }

  let keyId: string;
  try {
    keyId = getRazorpayKeyId();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Razorpay is not configured.';
    return jsonError(message, 500);
  }

  const admin = createAdminSupabaseClient();
  const { data: existingPayment } = await admin
    .from('payments')
    .select('provider_order_id, amount, currency, status')
    .eq('order_id', order.id)
    .eq('provider', 'razorpay')
    .in('status', ['created', 'authorized'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingPayment?.provider_order_id) {
    return jsonOk({
      providerOrderId: existingPayment.provider_order_id,
      amount: existingPayment.amount,
      currency: existingPayment.currency,
      keyId,
      orderId: order.id
    });
  }

  try {
    const razorpayOrder = await createRazorpayOrder(
      order.total_amount,
      order.currency,
      order.id
    );

    const { error: insertError } = await admin.from('payments').insert({
      order_id: order.id,
      provider: 'razorpay',
      provider_order_id: razorpayOrder.id,
      status: 'created',
      amount: order.total_amount,
      currency: order.currency,
      raw: razorpayOrder
    });

    if (insertError) {
      return jsonError(insertError.message, 500);
    }

    return jsonOk({
      providerOrderId: razorpayOrder.id,
      amount: order.total_amount,
      currency: order.currency,
      keyId,
      orderId: order.id
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create Razorpay order.';
    console.error('payments:create error', message);
    return jsonError(message, 500);
  }
}
