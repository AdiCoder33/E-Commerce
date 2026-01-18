'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart/useCart';
import { formatCurrency } from '@/lib/format';
import CartItemRow from '@/components/store/cart-item-row';
import ProductCard from '@/components/store/product-card';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';

type Product = {
  id: string;
  title: string;
  price_amount: number;
  currency: string;
  image_urls: string[] | null;
  stock: number;
  is_active: boolean;
};

export default function CartView() {
  const { items, ready, clear } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!ready || items.length === 0) {
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
  }, [items, ready, supabase]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, title, price_amount, currency, image_urls, stock, is_active, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      setFeatured((data as Product[]) || []);
    };
    fetchFeatured();
  }, [supabase]);

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
  const hasInvalidItems = summary.some((item) => !item.product || !item.product.is_active);

  if (!ready) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-black/10 bg-white/80 p-6 text-sm">
        Loading cart...
      </div>
    );
  }

  if (summary.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-black/60">
        <p>Your cart is empty.</p>
        <Link href="/products" className="mt-3 inline-flex text-sm font-semibold text-ink underline">
          Browse products
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-black/60">Loading product details...</p>
        ) : null}
        {summary.map((item) =>
          item.product ? (
            <CartItemRow key={item.productId} product={item.product} qty={item.qty} />
          ) : (
            <div key={item.productId} className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              This product is no longer available. Remove it to continue.
            </div>
          )
        )}
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-black/60">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal, 'INR')}</span>
          </div>
          <div className="mt-3 text-xs text-black/50">
            Shipping and taxes calculated at checkout.
          </div>
          {hasInvalidItems ? (
            <p className="mt-3 text-xs text-red-600">
              Remove unavailable items before checkout.
            </p>
          ) : null}
          <div className="mt-4 grid gap-3">
            <Link href="/checkout">
              <Button className={`w-full ${hasInvalidItems ? 'pointer-events-none opacity-50' : ''}`}>
                Proceed to checkout
              </Button>
            </Link>
            <Button variant="outline" onClick={clear} className="w-full">
              Clear cart
            </Button>
          </div>
        </Card>

        {featured.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">You may also like</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
