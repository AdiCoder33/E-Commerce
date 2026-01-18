'use client';

import { useEffect, useState } from 'react';

type SuggestionProduct = {
  id: string;
  title: string;
  image_urls: string[] | null;
};

type SuggestionCategory = {
  id: string;
  name: string;
  slug: string;
};

type Suggestions = {
  products: SuggestionProduct[];
  categories: SuggestionCategory[];
};

const emptySuggestions: Suggestions = { products: [], categories: [] };

export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<Suggestions>(emptySuggestions);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions(emptySuggestions);
      setLoading(false);
      return;
    }

    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        const data = (await response.json()) as Suggestions;
        if (active) {
          setSuggestions({
            products: data.products || [],
            categories: data.categories || []
          });
        }
      } catch {
        if (active) {
          setSuggestions(emptySuggestions);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  return { suggestions, loading };
}
