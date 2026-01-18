import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-black/10 bg-white/90 shadow-soft',
        className
      )}
      {...props}
    />
  );
}
