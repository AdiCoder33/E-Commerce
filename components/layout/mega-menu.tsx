"use client";

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type MegaMenuProps = {
  categories: Category[];
  label?: string;
  active?: boolean;
};

const collections = [
  { label: 'Ethnic Edit', tag: 'ethnic' },
  { label: 'Casual Staples', tag: 'casual' },
  { label: 'Winter Layering', tag: 'winter' },
  { label: 'Formal Dressing', tag: 'formal' }
];

export default function MegaMenu({ categories, label = 'Products', active }: MegaMenuProps) {
  const [open, setOpen] = useState(false);
  const hasCategories = categories.length > 0;

  return (
    <div
      className="relative"
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/products"
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        className={cn(
          'text-sm font-medium text-black/70 transition',
          open || active ? 'text-ink' : 'hover:text-ink'
        )}
      >
        {label}
      </Link>

      <div
        className={cn(
          'absolute left-1/2 top-full mt-4 w-[720px] -translate-x-1/2 rounded-[var(--radius-xl)] border border-black/10 bg-white/95 p-6 shadow-card backdrop-blur-sm transition',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">
              Shop categories
            </p>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <Link
                href="/products"
                className="rounded-[var(--radius-md)] border border-black/10 px-4 py-3 font-medium text-ink hover:border-black/30"
              >
                All products
              </Link>
              {hasCategories ? (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="rounded-[var(--radius-md)] border border-black/5 px-4 py-3 text-black/70 hover:border-black/20"
                  >
                    {category.name}
                  </Link>
                ))
              ) : (
                <span className="text-sm text-black/60">No categories yet.</span>
              )}
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] bg-fog p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">
              Shop by style
            </p>
            <div className="mt-4 space-y-2 text-sm">
              {collections.map((collection) => (
                <Link
                  key={collection.tag}
                  href={`/products?tag=${collection.tag}`}
                  className="block rounded-[var(--radius-md)] border border-black/10 px-4 py-2 text-black/70 hover:border-black/30"
                >
                  {collection.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
