'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCategory } from '@/lib/actions/admin-categories';

type CategoryActionsProps = {
  categoryId: string;
};

export default function CategoryActions({ categoryId }: CategoryActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    const confirmed = window.confirm('Delete this category?');
    if (!confirmed) {
      return;
    }
    startTransition(async () => {
      await deleteCategory(categoryId);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600"
    >
      Delete
    </button>
  );
}
