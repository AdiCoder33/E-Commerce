import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'accent' | 'outline';
};

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-black/10 text-ink',
  accent: 'bg-ember/15 text-ember',
  outline: 'border border-black/10 text-ink'
};

export default function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
