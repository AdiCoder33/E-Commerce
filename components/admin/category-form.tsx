'use client';

import { useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory } from '@/lib/actions/admin-categories';

type CategoryFormProps = {
  onCreated?: () => void;
};

export default function CategoryForm({ onCreated }: CategoryFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await createCategory({ name, slug: slug || null });
      if (!result.ok) {
        setMessage(result.error || 'Unable to create category.');
        return;
      }
      setMessage('Category created.');
      setName('');
      setSlug('');
      onCreated?.();
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white/90 p-4">
      <label className="text-sm">
        <span className="text-black/70">Name</span>
        <input
          className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>
      <label className="text-sm">
        <span className="text-black/70">Slug (optional)</span>
        <input
          className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
      </label>
      {message ? <p className="text-xs text-amber-700">{message}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper disabled:bg-black/40"
      >
        {isPending ? 'Saving...' : 'Add category'}
      </button>
    </form>
  );
}
