'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

type TabItem = {
  value: string;
  label: string;
  content: React.ReactNode;
};

type TabsProps = {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
};

export default function Tabs({ items, defaultValue, className }: TabsProps) {
  const initial = defaultValue || items[0]?.value || '';
  const [active, setActive] = useState(initial);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-2 rounded-full border border-black/10 bg-white/80 p-1 text-sm">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setActive(item.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em]',
              active === item.value ? 'bg-ink text-paper' : 'text-black/60'
            )}
            aria-pressed={active === item.value}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="rounded-[var(--radius-lg)] border border-black/10 bg-white/90 p-5 text-sm text-black/70">
        {items.find((item) => item.value === active)?.content}
      </div>
    </div>
  );
}
