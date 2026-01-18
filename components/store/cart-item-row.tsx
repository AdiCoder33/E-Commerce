"use client";

import Image from 'next/image';
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
    <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-black/10 bg-white/90 p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-[var(--radius-md)] bg-clay">
          {imageUrl ? (
            <Image src={imageUrl} alt={product.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-black/40">
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
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => updateQty(product.id, qty - 1)}
            className="rounded-full border border-black/10 px-3 py-1"
          >
            -
          </button>
          <span className="min-w-[24px] text-center">{qty}</span>
          <button
            type="button"
            onClick={() => updateQty(product.id, qty + 1)}
            className="rounded-full border border-black/10 px-3 py-1"
          >
            +
          </button>
        </div>
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
