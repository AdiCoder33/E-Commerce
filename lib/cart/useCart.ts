'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  productId: string;
  qty: number;
};

const STORAGE_KEY = 'cart:v1';

function readCart(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => ({
        productId: String(item.productId || ''),
        qty: Number(item.qty || 0)
      }))
      .filter((item) => item.productId && Number.isFinite(item.qty) && item.qty > 0);
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    writeCart(items);
  }, [items, ready]);

  const addItem = useCallback((productId: string, qty: number = 1) => {
    if (!productId || qty <= 0) {
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [...prev, { productId, qty }];
    });
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (!productId) {
      return;
    }

    setItems((prev) => {
      if (qty <= 0) {
        return prev.filter((item) => item.productId !== productId);
      }
      return prev.map((item) =>
        item.productId === productId ? { ...item, qty } : item
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  return {
    items,
    ready,
    totalItems,
    addItem,
    updateQty,
    removeItem,
    clear
  };
}
