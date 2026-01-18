import 'server-only';

import crypto from 'crypto';

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status?: string;
  [key: string]: unknown;
};

function getKeyId() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error('Missing RAZORPAY_KEY_ID environment variable.');
  }
  return keyId;
}

function getKeySecret() {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('Missing RAZORPAY_KEY_SECRET environment variable.');
  }
  return keySecret;
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function createRazorpayOrder(
  amount: number,
  currency: string,
  receipt: string
): Promise<RazorpayOrderResponse> {
  const keyId = getKeyId();
  const keySecret = getKeySecret();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt,
      payment_capture: 1
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Razorpay order creation failed: ${text}`);
  }

  return (await response.json()) as RazorpayOrderResponse;
}

export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const keySecret = getKeySecret();
  const payload = `${params.orderId}|${params.paymentId}`;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex');

  return timingSafeEqual(expected, params.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('Missing RAZORPAY_WEBHOOK_SECRET environment variable.');
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return timingSafeEqual(expected, signature);
}

export function getRazorpayKeyId() {
  return getKeyId();
}
