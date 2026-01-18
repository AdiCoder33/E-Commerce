'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart/useCart';
import { formatCurrency } from '@/lib/format';
import { placeOrder } from '@/lib/actions/orders';
import { shippingSchema } from '@/lib/validators/checkout';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';

const emptyShipping = {
  name: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India'
};

type Product = {
  id: string;
  title: string;
  price_amount: number;
  currency: string;
  image_urls: string[] | null;
  stock: number;
  is_active: boolean;
};

export default function CheckoutForm() {
  const router = useRouter();
  const { items, clear, ready } = useCart();
  const [shipping, setShipping] = useState({ ...emptyShipping });
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'payu' | 'stripe' | 'cod'>(
    'razorpay'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!ready || items.length === 0) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoadingProducts(true);
      const ids = items.map((item) => item.productId);
      const { data } = await supabase
        .from('products')
        .select('id, title, price_amount, currency, image_urls, stock, is_active')
        .in('id', ids);
      setProducts((data as Product[]) || []);
      setLoadingProducts(false);
    };

    fetchProducts();
  }, [items, ready, supabase]);

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

  const handleChange = (field: keyof typeof shipping, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (items.length === 0) {
      setMessage('Your cart is empty.');
      return;
    }

    if (hasInvalidItems) {
      setMessage('Some cart items are no longer available.');
      return;
    }

    const validation = shippingSchema.safeParse(shipping);
    if (!validation.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string') {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      setMessage('Please fix the highlighted fields.');
      return;
    }

    setErrors({});
    setSubmitting(true);

    const result = await placeOrder({
      cartItems: items,
      shipping: validation.data,
      paymentMethod
    });

    setSubmitting(false);

    if (!result.ok) {
      setMessage(result.error || 'Order failed. Please try again.');
      return;
    }

    clear();
    router.push(`/orders/${result.orderId}?success=1`);
  };

  if (!ready) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white/80 p-6 text-sm">
        Loading checkout...
      </div>
    );
  }

  return (
    <form className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" onSubmit={handleSubmit}>
      <div className="space-y-6 rounded-3xl border border-black/10 bg-white/90 p-6">
        <h2 className="font-display text-xl font-semibold">Shipping address</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-black/70">Full name</span>
            <Input
              className="mt-1 rounded-2xl py-3"
              value={shipping.name}
              onChange={(event) => handleChange('name', event.target.value)}
            />
            {errors.name ? <span className="text-xs text-red-600">{errors.name}</span> : null}
          </label>
          <label className="text-sm">
            <span className="text-black/70">Phone</span>
            <Input
              className="mt-1 rounded-2xl py-3"
              value={shipping.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
            />
            {errors.phone ? <span className="text-xs text-red-600">{errors.phone}</span> : null}
          </label>
        </div>

        <label className="text-sm">
          <span className="text-black/70">Address line 1</span>
          <Input
            className="mt-1 rounded-2xl py-3"
            value={shipping.addressLine1}
            onChange={(event) => handleChange('addressLine1', event.target.value)}
          />
          {errors.addressLine1 ? (
            <span className="text-xs text-red-600">{errors.addressLine1}</span>
          ) : null}
        </label>

        <label className="text-sm">
          <span className="text-black/70">Address line 2</span>
          <Input
            className="mt-1 rounded-2xl py-3"
            value={shipping.addressLine2}
            onChange={(event) => handleChange('addressLine2', event.target.value)}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-black/70">City</span>
            <Input
              className="mt-1 rounded-2xl py-3"
              value={shipping.city}
              onChange={(event) => handleChange('city', event.target.value)}
            />
            {errors.city ? <span className="text-xs text-red-600">{errors.city}</span> : null}
          </label>
          <label className="text-sm">
            <span className="text-black/70">State</span>
            <Input
              className="mt-1 rounded-2xl py-3"
              value={shipping.state}
              onChange={(event) => handleChange('state', event.target.value)}
            />
            {errors.state ? <span className="text-xs text-red-600">{errors.state}</span> : null}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-black/70">Pincode</span>
            <Input
              className="mt-1 rounded-2xl py-3"
              value={shipping.pincode}
              onChange={(event) => handleChange('pincode', event.target.value)}
            />
            {errors.pincode ? (
              <span className="text-xs text-red-600">{errors.pincode}</span>
            ) : null}
          </label>
          <label className="text-sm">
            <span className="text-black/70">Country</span>
            <Input
              className="mt-1 rounded-2xl py-3"
              value={shipping.country}
              onChange={(event) => handleChange('country', event.target.value)}
            />
          </label>
        </div>

        {message ? (
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
        <h2 className="font-display text-xl font-semibold">Order summary</h2>
        {loadingProducts ? (
          <p className="mt-4 text-sm text-black/60">Loading items...</p>
        ) : summary.length === 0 ? (
          <p className="mt-4 text-sm text-black/60">Your cart is empty.</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            {summary.map((item) => (
              <div key={item.productId} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {item.product?.title || 'Unavailable product'}
                  </p>
                  <p className="text-xs text-black/50">Qty {item.qty}</p>
                </div>
                <span className="font-medium">
                  {formatCurrency(item.lineTotal, item.product?.currency || 'INR')}
                </span>
              </div>
            ))}
            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotal, 'INR')}</span>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold">Payment method</h3>
          <div className="space-y-2 text-sm">
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 px-3 py-2">
              <div>
                <p className="font-medium">Razorpay</p>
                <p className="text-xs text-black/50">Cards, UPI, netbanking</p>
              </div>
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 px-3 py-2">
              <div>
                <p className="font-medium">PayU</p>
                <p className="text-xs text-black/50">Payment confirmation will be added soon</p>
              </div>
              <input
                type="radio"
                name="paymentMethod"
                value="payu"
                checked={paymentMethod === 'payu'}
                onChange={() => setPaymentMethod('payu')}
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 px-3 py-2">
              <div>
                <p className="font-medium">Stripe</p>
                <p className="text-xs text-black/50">Payment confirmation will be added soon</p>
              </div>
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={() => setPaymentMethod('stripe')}
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 px-3 py-2">
              <div>
                <p className="font-medium">Cash on delivery</p>
                <p className="text-xs text-black/50">Pay when your order arrives</p>
              </div>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
              />
            </label>
          </div>
          {paymentMethod === 'payu' || paymentMethod === 'stripe' ? (
            <p className="text-xs text-amber-700">
              This payment method is selectable, but online confirmation is not live yet.
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={submitting || summary.length === 0 || hasInvalidItems}
        >
          {submitting ? 'Placing order...' : 'Place order'}
        </Button>
        <p className="mt-3 text-xs text-black/50">
          Prices and totals are validated on the server at checkout.
        </p>
      </div>
    </form>
  );
}
