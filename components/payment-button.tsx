'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type PaymentButtonProps = {
  orderId: string;
  paymentStatus: string;
  paymentMethod: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript() {
  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Razorpay can only load in the browser.'));
      return;
    }

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay.'));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export default function PaymentButton({
  orderId,
  paymentStatus,
  paymentMethod
}: PaymentButtonProps) {
  if (paymentMethod !== 'razorpay') {
    return null;
  }
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [awaiting, setAwaiting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paymentStatus === 'paid' && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
      setAwaiting(false);
    }
  }, [paymentStatus]);

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const startPolling = () => {
    if (pollRef.current) {
      return;
    }
    let attempts = 0;
    pollRef.current = setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= 6) {
        clearInterval(pollRef.current as ReturnType<typeof setInterval>);
        pollRef.current = null;
      }
    }, 3000);
  };

  const handlePay = () => {
    setMessage(null);

    startTransition(async () => {
      try {
        const createResponse = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });

        const createData = (await createResponse.json()) as {
          ok: boolean;
          error?: string;
          providerOrderId?: string;
          amount?: number;
          currency?: string;
          keyId?: string;
        };

        if (!createResponse.ok || !createData.providerOrderId || !createData.keyId) {
          setMessage(createData.error || 'Unable to start payment.');
          return;
        }

        await loadRazorpayScript();

        if (!window.Razorpay) {
          setMessage('Razorpay script did not load.');
          return;
        }

        const options = {
          key: createData.keyId,
          amount: createData.amount,
          currency: createData.currency,
          order_id: createData.providerOrderId,
          name: 'Aaranya Apparel',
          description: `Order ${orderId}`,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = (await verifyResponse.json()) as {
              ok: boolean;
              error?: string;
              message?: string;
            };

            if (!verifyResponse.ok) {
              setMessage(verifyData.error || 'Payment verification failed.');
              return;
            }

            setMessage(verifyData.message || 'Payment received. Awaiting confirmation.');
            setAwaiting(true);
            router.refresh();
            startPolling();
          },
          modal: {
            ondismiss: () => {
              setMessage('Payment cancelled.');
            }
          }
        };

        const checkout = new window.Razorpay(options);
        checkout.open();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : 'Unable to initiate payment.'
        );
      }
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handlePay}
        disabled={isPending || paymentStatus === 'paid'}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper disabled:bg-black/40"
      >
        {isPending ? 'Starting payment...' : 'Pay now'}
      </button>
      {awaiting ? (
        <p className="text-xs text-black/60">Awaiting payment confirmation...</p>
      ) : null}
      {message ? <p className="text-xs text-amber-700">{message}</p> : null}
    </div>
  );
}
