'use client';

import { useMemo, useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '@/lib/actions/admin-products';

export type ProductFormCategory = {
  id: string;
  name: string;
};

type ProductFormProps = {
  mode: 'create' | 'edit';
  productId?: string;
  initialData?: {
    title: string;
    description: string | null;
    price_amount: number;
    stock: number;
    category_id: string | null;
    is_active: boolean;
  };
  categories: ProductFormCategory[];
};

export default function ProductForm({
  mode,
  productId,
  initialData,
  categories
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const defaults = useMemo(
    () => ({
      title: initialData?.title || '',
      description: initialData?.description || '',
      priceRupees: initialData ? (initialData.price_amount / 100).toFixed(2) : '',
      stock: initialData?.stock?.toString() || '0',
      categoryId: initialData?.category_id || '',
      isActive: initialData?.is_active ?? true
    }),
    [initialData]
  );

  const [form, setForm] = useState(defaults);

  const handleChange = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const payload = {
        title: form.title,
        description: form.description,
        priceRupees: form.priceRupees,
        stock: form.stock,
        categoryId: form.categoryId || null,
        isActive: form.isActive
      };

      const result =
        mode === 'create'
          ? await createProduct(payload)
          : await updateProduct(productId || '', payload);

      if (!result.ok) {
        setMessage(result.error || 'Save failed.');
        return;
      }

      setMessage('Saved successfully.');

      if (mode === 'create' && result.productId) {
        router.push(`/admin/products/${result.productId}`);
      }
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-black/70">Title</span>
          <input
            className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
            value={form.title}
            onChange={(event) => handleChange('title', event.target.value)}
            required
          />
        </label>
        <label className="text-sm">
          <span className="text-black/70">Price (INR)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
            value={form.priceRupees}
            onChange={(event) => handleChange('priceRupees', event.target.value)}
            required
          />
        </label>
      </div>

      <label className="text-sm">
        <span className="text-black/70">Description</span>
        <textarea
          className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          rows={4}
          value={form.description}
          onChange={(event) => handleChange('description', event.target.value)}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-black/70">Stock</span>
          <input
            type="number"
            min="0"
            className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
            value={form.stock}
            onChange={(event) => handleChange('stock', event.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="text-black/70">Category</span>
          <select
            className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
            value={form.categoryId}
            onChange={(event) => handleChange('categoryId', event.target.value)}
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => handleChange('isActive', event.target.checked)}
        />
        <span>Active in storefront</span>
      </label>

      {message ? (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-paper disabled:bg-black/40"
      >
        {isPending ? 'Saving...' : mode === 'create' ? 'Create product' : 'Save changes'}
      </button>
    </form>
  );
}
