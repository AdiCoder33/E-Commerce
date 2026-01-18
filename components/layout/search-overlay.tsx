"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Skeleton from '@/components/ui/skeleton';
import { useStoreUI } from '@/components/layout/store-provider';
import { useSearchSuggestions } from '@/lib/search/useSearchSuggestions';
import { addRecentSearch, clearRecentSearches, getRecentSearches } from '@/lib/search/recent';
import { getPublicImageUrl } from '@/lib/storage/productImageUrls';
import { cn } from '@/lib/utils/cn';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type SearchOverlayProps = {
  categories: Category[];
};

export default function SearchOverlay({ categories }: SearchOverlayProps) {
  const router = useRouter();
  const { searchOpen, openSearch, closeSearch } = useStoreUI();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { suggestions, loading } = useSearchSuggestions(query);

  const items = useMemo(() => {
    const list: Array<{ label: string; href: string; type: string; image?: string }> = [];
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
  }, [searchOpen]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || event.key === '/') {
        const target = event.target as HTMLElement;
        const tagName = target?.tagName?.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea') {
          return;
        }
        event.preventDefault();
        setQuery('');
        openSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openSearch]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      closeSearch();
      return;
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
        closeSearch();
      } else if (query.trim()) {
        addRecentSearch(query.trim());
        router.push(`/products?q=${encodeURIComponent(query.trim())}`);
        closeSearch();
      }
    }
  };

  const trending = categories.slice(0, 4);

  return (
    <Modal open={searchOpen} onClose={closeSearch} className="max-w-4xl p-0">
      <div className="border-b border-black/10 px-6 py-5">
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search products, categories, or collections"
          autoFocus
          className="text-base"
        />
        <p className="mt-2 text-xs text-black/50">
          Tip: press Esc to close, Enter to search.
        </p>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-black/50">
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
            <div className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item, index) => (
                <button
                  key={`${item.type}-${item.label}-${index}`}
                  type="button"
                  onClick={() => {
                    addRecentSearch(item.label);
                    router.push(item.href);
                    closeSearch();
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm',
                    activeIndex === index ? 'bg-black/5' : 'hover:bg-black/5'
                  )}
                >
                  {item.image ? (
                    <span className="relative h-10 w-10 overflow-hidden rounded-[var(--radius-md)] bg-clay">
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
            <div className="space-y-2 text-sm text-black/60">
              <p>No results found. Try a different keyword.</p>
              <div className="flex flex-wrap gap-2">
                {['Ethnic edit', 'Winter layers', 'Casual staples'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setQuery(label);
                      addRecentSearch(label);
                      router.push(`/products?q=${encodeURIComponent(label)}`);
                      closeSearch();
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

        <div className="rounded-[var(--radius-lg)] bg-fog p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Trending</p>
          <div className="mt-3 space-y-2 text-sm">
            {trending.length > 0 ? (
              trending.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    router.push(`/products?category=${category.slug}`);
                    closeSearch();
                  }}
                  className="block w-full rounded-[var(--radius-md)] border border-black/10 px-3 py-2 text-left text-sm hover:border-black/30"
                >
                  {category.name}
                </button>
              ))
            ) : (
              <p className="text-sm text-black/50">Add categories to highlight trends.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
