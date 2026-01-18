import { cn } from '@/lib/utils/cn';

type AccordionItem = {
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

export default function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => (
        <details
          key={item.title}
          className="group rounded-[var(--radius-lg)] border border-black/10 bg-white/90 p-4"
          open={item.defaultOpen}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
            {item.title}
            <span className="text-xs text-black/40 group-open:rotate-180">+</span>
          </summary>
          <div className="mt-3 text-sm text-black/70">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
