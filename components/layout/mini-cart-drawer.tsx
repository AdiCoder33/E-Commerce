"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Drawer from '@/components/ui/drawer';
import Button from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart/useCart';
import { getPublicImageUrl } from '@/lib/storage/productImageUrls';
import { useStoreUI } from '@/components/layout/store-provider';

type Product = {
  id: string;
  title: string;
  price_amount: number;
  currency: string;
  image_urls: string[] | null;
  stock: number;
  is_active: boolean;
};

export default function MiniCartDrawer() {
  const { cartOpen, closeCart } = useStoreUI();
  const { items, updateQty, removeItem, clear, totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!cartOpen || items.length === 0) {
      setProducts([]);
      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
      const ids = items.map((item) => item.productId);
      const { data } = await supabase
        .from('products')
        .select('id, title, price_amount, currency, image_urls, stock, is_active')
        .in('id', ids);
      setProducts((data as Product[]) || []);
      setLoading(false);
    };
    fetchProducts();
  }, [cartOpen, items, supabase]);

  const productMap = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const summary = useMemo(() => {
    return items.map((item) => {
      const product = productMap.get(item.productId);
      return {
        ...item,
        product,
        lineTotal: product ? product.price_amount * item.qty : 0
      };
    });
  }, [items, productMap]);

  const subtotal = summary.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <Drawer open={cartOpen} onClose={closeCart} position="right" size="md">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">Cart</p>
            <h2 className="font-display text-lg font-semibold">
              {totalItems} item{totalItems === 1 ? '' : 's'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full border border-black/10 px-3 py-1 text-xs"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {loading ? (
            <p className="text-sm text-black/60">Loading cart...</p>
          ) : summary.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-black/15 bg-white/80 p-6 text-center text-sm text-black/60">
              Your cart is empty.
            </div>
          ) : (
            summary.map((item) => {
              const product = item.product;
              const imageUrl = product?.image_urls?.[0]
                ? getPublicImageUrl(product.image_urls[0])
                : '';
              return (
                <div key={item.productId} className="flex items-start gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-[var(--radius-md)] bg-clay">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={product?.title || 'Product'} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{product?.title || 'Unavailable'}</p>
                        <p className="text-xs text-black/50">
                          {product
                            ? formatCurrency(product.price_amount, product.currency)
                            : 'Unavailable'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-xs text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="rounded-full border border-black/10 px-2 py-1"
                      >
                        -
                      </button>
                      <span className="min-w-[24px] text-center">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="rounded-full border border-black/10 px-2 py-1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-black/10 px-6 py-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-black/60">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal, 'INR')}</span>
          </div>
          <div className="mt-4 grid gap-2">
            <Link href="/cart" onClick={closeCart}>
              <Button variant="outline" className="w-full">
                View cart
              </Button>
            </Link>
            <Link href="/checkout" onClick={closeCart}>
              <Button className="w-full">Checkout</Button>
            </Link>
            {summary.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  clear();
                  closeCart();
                }}
                className="text-xs text-black/50 underline"
              >
                Clear cart
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
