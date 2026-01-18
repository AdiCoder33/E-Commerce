'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/lib/actions/admin-orders';
import { type OrderStatus } from '@/lib/validators/order';

const options: OrderStatus[] = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled'
];

type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export default function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status);
      if (!result.ok) {
        setMessage(result.error || 'Update failed.');
        return;
      }
      setMessage('Status updated.');
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.2em] text-black/50">Status</label>
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-full border border-black/10 px-4 py-2 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
        >
          {options.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={isPending}
          className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper disabled:bg-black/40"
        >
          {isPending ? 'Saving...' : 'Update'}
        </button>
      </div>
      {message ? <p className="text-xs text-amber-700">{message}</p> : null}
    </div>
  );
}
