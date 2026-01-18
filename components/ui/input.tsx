import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-full border border-black/10 bg-white px-4 py-2 text-sm transition focus:border-black/30 focus:outline-none',
        className
      )}
      {...props}
    />
  );
}
