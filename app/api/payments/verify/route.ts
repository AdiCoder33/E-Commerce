import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { paymentVerifySchema } from '@/lib/validators/payment';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getClientIp, rateLimit } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed, retryAfter } = rateLimit(`payments:verify:${ip}`, {
    limit: 12,
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

  const parsed = paymentVerifySchema.safeParse(body);
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
    .select('id, user_id, payment_status, total_amount, currency, payment_method')
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

  const isValid = verifyPaymentSignature({
    orderId: parsed.data.razorpay_order_id,
    paymentId: parsed.data.razorpay_payment_id,
    signature: parsed.data.razorpay_signature
  });

  if (!isValid) {
    return jsonError('Invalid payment signature.', 400);
  }

  const admin = createAdminSupabaseClient();
  const { data: existingPayment } = await admin
    .from('payments')
    .select('id, status')
    .eq('order_id', order.id)
    .eq('provider', 'razorpay')
    .eq('provider_order_id', parsed.data.razorpay_order_id)
    .maybeSingle();

  if (existingPayment) {
    const { error: updateError } = await admin
      .from('payments')
      .update({
        provider_payment_id: parsed.data.razorpay_payment_id,
        provider_signature: parsed.data.razorpay_signature,
        status: 'authorized',
        raw: {
          order_id: parsed.data.razorpay_order_id,
          payment_id: parsed.data.razorpay_payment_id
        }
      })
      .eq('id', existingPayment.id);

    if (updateError) {
      return jsonError(updateError.message, 500);
    }
  } else {
    const { error: insertError } = await admin.from('payments').insert({
      order_id: order.id,
      provider: 'razorpay',
      provider_order_id: parsed.data.razorpay_order_id,
      provider_payment_id: parsed.data.razorpay_payment_id,
      provider_signature: parsed.data.razorpay_signature,
      status: 'authorized',
      amount: order.total_amount,
      currency: order.currency,
      raw: {
        order_id: parsed.data.razorpay_order_id,
        payment_id: parsed.data.razorpay_payment_id
      }
    });

    if (insertError) {
      return jsonError(insertError.message, 500);
    }
  }

  return jsonOk({
    message: 'Payment received. Awaiting confirmation.'
  });
}
