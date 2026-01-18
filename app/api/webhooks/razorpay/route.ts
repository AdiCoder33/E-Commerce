import { headers } from 'next/headers';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getClientIp, rateLimit } from '@/lib/security/rate-limit';

type RazorpayWebhookPayload = {
  event?: string;
  created_at?: number;
  id?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
      };
    };
    order?: {
      entity?: {
        id?: string;
      };
    };
  };
  [key: string]: unknown;
};

function buildEventId(payload: RazorpayWebhookPayload) {
  const eventType = payload.event || 'unknown';
  const createdAt = payload.created_at || Date.now();
  const paymentId = payload.payload?.payment?.entity?.id;
  const orderId = payload.payload?.payment?.entity?.order_id || payload.payload?.order?.entity?.id;
  return `${eventType}:${paymentId || orderId || 'unknown'}:${createdAt}`;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed, retryAfter } = rateLimit(`webhooks:razorpay:${ip}`, {
    limit: 120,
    windowMs: 60_000
  });

  if (!allowed) {
    const response = jsonError('Too many requests.', 429);
    response.headers.set('Retry-After', retryAfter.toString());
    return response;
  }

  const rawBody = await request.text();
  const headerList = await headers();
  const signature = headerList.get('x-razorpay-signature');

  if (!signature) {
    return jsonError('Missing signature.', 401);
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    return jsonError('Invalid signature.', 401);
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return jsonError('Invalid webhook payload.', 400);
  }

  const eventType = payload.event || 'unknown';
  const eventId = payload.id || buildEventId(payload);

  const admin = createAdminSupabaseClient();
  const { data: existingEvent } = await admin
    .from('payment_events')
    .select('id, processing_status')
    .eq('provider', 'razorpay')
    .eq('event_id', eventId)
    .maybeSingle();

  if (existingEvent?.processing_status === 'processed') {
    return jsonOk({ received: true });
  }

  if (!existingEvent) {
    await admin.from('payment_events').insert({
      provider: 'razorpay',
      event_id: eventId,
      event_type: eventType,
      payload
    });
  }

  const providerOrderId =
    payload.payload?.payment?.entity?.order_id ||
    payload.payload?.order?.entity?.id ||
    null;
  const providerPaymentId = payload.payload?.payment?.entity?.id || null;

  let orderId: string | null = null;
  let handled = false;
  try {
    let paymentLookup = null;
    if (providerOrderId) {
      const { data } = await admin
        .from('payments')
        .select('id, order_id, status')
        .eq('provider', 'razorpay')
        .eq('provider_order_id', providerOrderId)
        .maybeSingle();
      paymentLookup = data;
    } else if (providerPaymentId) {
      const { data } = await admin
        .from('payments')
        .select('id, order_id, status')
        .eq('provider', 'razorpay')
        .eq('provider_payment_id', providerPaymentId)
        .maybeSingle();
      paymentLookup = data;
    }

    orderId = paymentLookup?.order_id || null;

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      handled = true;
      if (!paymentLookup?.id) {
        throw new Error('Payment record not found for capture event.');
      }

      await admin
        .from('payments')
        .update({
          status: 'captured',
          provider_payment_id: providerPaymentId ?? undefined,
          raw: payload
        })
        .eq('id', paymentLookup.id);

      if (orderId) {
        await admin
          .from('orders')
          .update({
            payment_status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .neq('payment_status', 'paid');

        await admin
          .from('orders')
          .update({
            status: 'confirmed'
          })
          .eq('id', orderId)
          .eq('status', 'pending');
      }
    } else if (eventType === 'payment.failed') {
      handled = true;
      if (!paymentLookup?.id) {
        throw new Error('Payment record not found for failure event.');
      }

      await admin
        .from('payments')
        .update({
          status: 'failed',
          provider_payment_id: providerPaymentId ?? undefined,
          raw: payload
        })
        .eq('id', paymentLookup.id);

      if (orderId) {
        await admin
          .from('orders')
          .update({
            payment_status: 'failed'
          })
          .eq('id', orderId)
          .neq('payment_status', 'paid');
      }
    }

    await admin
      .from('payment_events')
      .update({
        processing_status: handled ? 'processed' : 'ignored',
        processed_at: new Date().toISOString(),
        order_id: orderId
      })
      .eq('provider', 'razorpay')
      .eq('event_id', eventId);

    return jsonOk({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Webhook processing failed.';
    console.error('webhooks:razorpay error', message);

    await admin
      .from('payment_events')
      .update({
        processing_status: 'failed',
        processed_at: new Date().toISOString(),
        order_id: orderId,
        error: message
      })
      .eq('provider', 'razorpay')
      .eq('event_id', eventId);

    return jsonError('Webhook processing failed.', 500);
  }
}
