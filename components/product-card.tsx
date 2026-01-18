import Link from 'next/link';
import { formatCurrency } from '@/lib/format';
import AddToCartButton from '@/components/add-to-cart-button';
import { getPublicImageUrl } from '@/lib/storage/productImageUrls';

type ProductCardProps = {
  product: {
    id: string;
    title: string;
    price_amount: number;
    currency: string;
    image_urls: string[] | null;
    stock: number;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.image_urls?.[0]
    ? getPublicImageUrl(product.image_urls[0])
    : '';

  return (
    <div className="rounded-3xl border border-black/10 bg-white/90 p-4 shadow-sm">
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-clay">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-black/40">
              No image
            </div>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="font-display text-lg font-semibold leading-tight">
            {product.title}
          </h3>
          <p className="text-sm text-black/70">
            {formatCurrency(product.price_amount, product.currency)}
          </p>
        </div>
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <span className={`text-xs ${product.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
          {product.stock > 0 ? 'In stock' : 'Out of stock'}
        </span>
        <AddToCartButton productId={product.id} disabled={product.stock <= 0} />
      </div>
    </div>
  );
}
