"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Input from '@/components/ui/input';
import Skeleton from '@/components/ui/skeleton';
import { useSearchSuggestions } from '@/lib/search/useSearchSuggestions';
import { addRecentSearch, clearRecentSearches, getRecentSearches } from '@/lib/search/recent';
import { getPublicImageUrl } from '@/lib/storage/productImageUrls';
import { cn } from '@/lib/utils/cn';

type SearchBarProps = {
  placeholder?: string;
  className?: string;
};

export default function SearchBar({ placeholder, className }: SearchBarProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const { suggestions, loading } = useSearchSuggestions(query);

  const items = useMemo(() => {
    const list: Array<{ label: string; href: string; type: 'product' | 'category' | 'recent'; image?: string }> = [];
    if (query.trim()) {
      suggestions.categories.forEach((category) => {
        list.push({
          label: category.name,
          href: `/products?category=${category.slug}&q=${encodeURIComponent(query)}`,
          type: 'category'
        });
      });
      suggestions.products.forEach((product) => {
        list.push({
          label: product.title,
          href: `/products/${product.id}`,
          type: 'product',
          image: product.image_urls?.[0]
        });
      });
    } else {
      recent.forEach((value) => {
        list.push({
          label: value,
          href: `/products?q=${encodeURIComponent(value)}`,
          type: 'recent'
        });
      });
    }
    return list;
  }, [query, suggestions, recent]);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }
    addRecentSearch(trimmed);
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      setOpen(true);
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        const selected = items[activeIndex];
        addRecentSearch(selected.label);
        router.push(selected.href);
      } else {
        handleSubmit();
      }
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <Input
        value={query}
        placeholder={placeholder || 'Search for products'}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          setOpen(true);
          setRecent(getRecentSearches());
        }}
        onKeyDown={handleKeyDown}
        aria-label="Search products"
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper"
      >
        Search
      </button>

      <div
        className={cn(
          'absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-[var(--radius-lg)] border border-black/10 bg-white shadow-card transition',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-black/50">
          <span>{query.trim() ? 'Suggestions' : 'Recent searches'}</span>
          {recent.length > 0 && !query.trim() ? (
            <button
              type="button"
              onClick={() => {
                clearRecentSearches();
                setRecent([]);
              }}
              className="text-[10px] font-semibold text-black/40"
            >
              Clear
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : items.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            {items.map((item, index) => (
              <button
                key={`${item.type}-${item.label}-${index}`}
                type="button"
                onClick={() => {
                  addRecentSearch(item.label);
                  router.push(item.href);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition',
                  activeIndex === index ? 'bg-black/5' : 'hover:bg-black/5'
                )}
              >
                {item.image ? (
                  <span className="relative h-9 w-9 overflow-hidden rounded-[var(--radius-md)] bg-clay">
                    <Image
                      src={getPublicImageUrl(item.image)}
                      alt={item.label}
                      fill
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-ember" />
                )}
                <div>
                  <p className="font-medium text-ink">{item.label}</p>
                  <p className="text-xs text-black/50 capitalize">{item.type}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2 p-4 text-sm text-black/60">
            <p>No results. Try a different search.</p>
            <div className="flex flex-wrap gap-2">
              {['Best sellers', 'New arrivals', 'Ethnic edit'].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setQuery(label);
                    addRecentSearch(label);
                    router.push(`/products?q=${encodeURIComponent(label)}`);
                    setOpen(false);
                  }}
                  className="rounded-full border border-black/10 px-3 py-1 text-xs"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
