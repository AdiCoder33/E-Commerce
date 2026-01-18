'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  position?: 'right' | 'left' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
};

const sizeClasses: Record<NonNullable<DrawerProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg'
};

const positionClasses: Record<NonNullable<DrawerProps['position']>, string> = {
  right: 'right-0 top-0 h-full w-full',
  left: 'left-0 top-0 h-full w-full',
  bottom: 'bottom-0 left-0 w-full'
};

export default function Drawer({
  open,
  onClose,
  position = 'right',
  size = 'md',
  children
}: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute bg-white shadow-card transition-transform duration-300 ease-smooth',
          positionClasses[position],
          position === 'bottom'
            ? 'rounded-t-[var(--radius-xl)]'
            : 'rounded-l-[var(--radius-xl)]',
          position === 'bottom'
            ? open
              ? 'translate-y-0'
              : 'translate-y-full'
            : open
              ? 'translate-x-0'
              : position === 'left'
                ? '-translate-x-full'
                : 'translate-x-full',
          position === 'bottom' ? 'h-[85vh]' : sizeClasses[size]
        )}
      >
        {children}
      </div>
    </div>
  );
}
