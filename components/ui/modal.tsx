'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export default function Modal({ open, onClose, children, className }: ModalProps) {
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
        'fixed inset-0 z-[60] transition',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute left-1/2 top-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)] bg-white p-4 shadow-card transition duration-300 ease-smooth',
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
