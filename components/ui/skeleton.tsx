import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--radius-md)] bg-black/5', className)}
      {...props}
    />
  );
}
