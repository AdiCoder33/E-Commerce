'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils/cn';

type Toast = {
  id: string;
  title?: string;
  message: string;
  tone?: 'success' | 'error' | 'info';
};

type StoreUIContextValue = {
  cartOpen: boolean;
  searchOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
};

const StoreUIContext = createContext<StoreUIContextValue | null>(null);

export function useStoreUI() {
  const value = useContext(StoreUIContext);
  if (!value) {
    throw new Error('useStoreUI must be used within StoreProvider.');
  }
  return value;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next = { id, ...toast };
    setToasts((prev) => [...prev, next]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2400);
  }, []);

  const value = useMemo(
    () => ({
      cartOpen,
      searchOpen,
      openCart,
      closeCart,
      openSearch,
      closeSearch,
      pushToast
    }),
    [cartOpen, searchOpen, openCart, closeCart, openSearch, closeSearch, pushToast]
  );

  return (
    <StoreUIContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[70] flex w-[min(90vw,320px)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={cn(
              'rounded-[var(--radius-lg)] border border-black/10 bg-white/90 px-4 py-3 text-sm shadow-card',
              toast.tone === 'success' && 'border-emerald-200 text-emerald-800',
              toast.tone === 'error' && 'border-red-200 text-red-700'
            )}
          >
            {toast.title ? (
              <p className="font-semibold">{toast.title}</p>
            ) : null}
            <p className="text-black/70">{toast.message}</p>
          </div>
        ))}
      </div>
    </StoreUIContext.Provider>
  );
}
