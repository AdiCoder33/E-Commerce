"use client";

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Drawer from '@/components/ui/drawer';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Filters = {
  q?: string;
  category?: string;
  tag?: string;
  min?: string;
  max?: string;
  inStock?: string;
  sort?: string;
};

type ProductFiltersProps = {
  categories: Category[];
  initialFilters: Filters;
  totalCount?: number;
};

export default function ProductFilters({
  categories,
  initialFilters,
  totalCount
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    q: initialFilters.q || '',
    category: initialFilters.category || '',
    tag: initialFilters.tag || '',
    min: initialFilters.min || '',
    max: initialFilters.max || '',
    inStock: initialFilters.inStock || '',
    sort: initialFilters.sort || 'relevance'
  });

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.category) params.set('category', filters.category);
    if (filters.tag) params.set('tag', filters.tag);
    if (filters.min) params.set('min', filters.min);
    if (filters.max) params.set('max', filters.max);
    if (filters.inStock) params.set('inStock', filters.inStock);
    if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      category: '',
      tag: '',
      min: '',
      max: '',
      inStock: '',
      sort: 'relevance'
    });
    router.push(pathname);
    setOpen(false);
  };

  const categoryOptions = useMemo(() => categories, [categories]);

  const content = (
    <div className="space-y-6 text-sm">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-black/50">Category</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="category"
              checked={!filters.category}
              onChange={() => setFilters((prev) => ({ ...prev, category: '' }))}
            />
            <span>All categories</span>
          </label>
          {categoryOptions.map((category) => (
            <label key={category.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="category"
                checked={filters.category === category.slug}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, category: category.slug }))
                }
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-black/50">Price</p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.min || ''}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, min: event.target.value }))
            }
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.max || ''}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, max: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-black/50">Availability</p>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.inStock === '1'}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, inStock: event.target.checked ? '1' : '' }))
            }
          />
          <span>In stock only</span>
        </label>
      </div>

      <div className="space-y-2 text-black/50">
        <p className="text-xs uppercase tracking-[0.2em]">Rating</p>
        <div className="rounded-[var(--radius-md)] border border-dashed border-black/15 px-3 py-2 text-xs">
          Ratings coming soon
        </div>
      </div>

      <div className="grid gap-2">
        <Button onClick={applyFilters}>Apply filters</Button>
        <Button variant="outline" onClick={clearFilters}>
          Clear all
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-black/10 bg-white/90 p-4 lg:hidden">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Filters</p>
          <p className="text-sm text-black/60">
            {totalCount ?? 0} products
          </p>
        </div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open filters
        </Button>
      </div>

      <div className="hidden space-y-4 rounded-[var(--radius-lg)] border border-black/10 bg-white/90 p-5 lg:block">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Filters</p>
          <p className="text-sm text-black/60">{totalCount ?? 0} products</p>
        </div>
        {content}
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} position="bottom">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <p className="text-sm font-semibold">Filters</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-black/50"
            >
              Close
            </button>
          </div>
          <div className={cn('flex-1 overflow-y-auto px-5 py-6')}>{content}</div>
        </div>
      </Drawer>
    </>
  );
}
