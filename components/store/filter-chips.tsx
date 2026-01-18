import Link from 'next/link';

type Filters = {
  q?: string;
  category?: string;
  tag?: string;
  min?: string;
  max?: string;
  inStock?: string;
  sort?: string;
};

type FilterChipsProps = {
  filters: Filters;
};

export default function FilterChips({ filters }: FilterChipsProps) {
  const chips: Array<{ label: string; href: string }> = [];
  const params = new URLSearchParams();

  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.min) params.set('min', filters.min);
  if (filters.max) params.set('max', filters.max);
  if (filters.inStock) params.set('inStock', filters.inStock);
  if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort);

  const base = params.toString();

  if (filters.q) {
    const next = new URLSearchParams(base);
    next.delete('q');
    chips.push({ label: `Search: ${filters.q}`, href: `/products?${next.toString()}` });
  }
  if (filters.category) {
    const next = new URLSearchParams(base);
    next.delete('category');
    chips.push({ label: `Category: ${filters.category}`, href: `/products?${next.toString()}` });
  }
  if (filters.tag) {
    const next = new URLSearchParams(base);
    next.delete('tag');
    chips.push({ label: `Style: ${filters.tag}`, href: `/products?${next.toString()}` });
  }
  if (filters.min || filters.max) {
    const next = new URLSearchParams(base);
    next.delete('min');
    next.delete('max');
    chips.push({
      label: `Price: ${filters.min || '0'}-${filters.max || 'max'}`,
      href: `/products?${next.toString()}`
    });
  }
  if (filters.inStock) {
    const next = new URLSearchParams(base);
    next.delete('inStock');
    chips.push({ label: 'In stock', href: `/products?${next.toString()}` });
  }
  if (filters.sort && filters.sort !== 'relevance') {
    const next = new URLSearchParams(base);
    next.delete('sort');
    chips.push({ label: `Sort: ${filters.sort}`, href: `/products?${next.toString()}` });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className="rounded-full border border-black/10 px-3 py-1 text-black/60 hover:border-black/30"
        >
          {chip.label} &times;
        </Link>
      ))}
      <Link
        href="/products"
        className="rounded-full border border-black/10 px-3 py-1 text-black/60 hover:border-black/30"
      >
        Clear all
      </Link>
    </div>
  );
}
