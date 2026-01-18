'use client';

import { formatCurrency } from '@/lib/format';
import { getPublicImageUrl } from '@/lib/storage/productImageUrls';
import { useCart } from '@/lib/cart/useCart';

type CartItemRowProps = {
  product: {
    id: string;
    title: string;
    price_amount: number;
    currency: string;
    image_urls: string[] | null;
  };
  qty: number;
};

export default function CartItemRow({ product, qty }: CartItemRowProps) {
  const { updateQty, removeItem } = useCart();
  const imageUrl = product.image_urls?.[0]
    ? getPublicImageUrl(product.image_urls[0])
    : '';

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-white/90 p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <div className="h-20 w-24 overflow-hidden rounded-2xl bg-clay">
          {imageUrl ? (
            <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-black/40">
              No image
            </div>
          )}
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">{product.title}</h3>
          <p className="text-sm text-black/70">
            {formatCurrency(product.price_amount, product.currency)}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-between gap-3 sm:justify-end">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-black/50">Qty</span>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(event) => updateQty(product.id, Number(event.target.value))}
            className="w-20 rounded-full border border-black/10 px-3 py-1 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => removeItem(product.id)}
          className="text-xs text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
