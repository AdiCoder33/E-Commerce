'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProduct, toggleProductActive } from '@/lib/actions/admin-products';

export default function ProductActions({
  productId,
  isActive
}: {
  productId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleProductActive(productId, !isActive);
      router.refresh();
    });
  };

  const handleDelete = () => {
    const confirmed = window.confirm('Delete this product? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      await deleteProduct(productId);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className="rounded-full border border-black/10 px-3 py-1 text-xs"
      >
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600"
      >
        Delete
      </button>
    </div>
  );
}
