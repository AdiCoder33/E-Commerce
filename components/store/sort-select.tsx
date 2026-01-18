"use client";

import { usePathname, useRouter } from 'next/navigation';

type SortSelectProps = {
  current?: string;
};

const options = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' }
];

export default function SortSelect({ current }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const value = current || 'relevance';

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(window.location.search);
    const nextValue = event.target.value;
    if (nextValue === 'relevance') {
      params.delete('sort');
    } else {
      params.set('sort', nextValue);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-black/50">
      Sort
      <select
        value={value}
        onChange={handleChange}
        className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-ink"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
