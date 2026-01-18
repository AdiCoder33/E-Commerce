import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/add-to-cart-button';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { getPublicImageUrl } from '@/lib/storage/productImageUrls';

type ProductCardProps = {
  product: {
    id: string;
    title: string;
    price_amount: number;
    currency: string;
    image_urls: string[] | null;
    stock: number;
    created_at?: string | null;
  };
};

function isNew(createdAt?: string | null) {
  if (!createdAt) {
    return false;
  }
  const created = new Date(createdAt).getTime();
  return Date.now() - created < 1000 * 60 * 60 * 24 * 14;
}

function isBestSeller(productId: string) {
  const last = productId.slice(-1).toLowerCase();
  return ['a', 'b', 'c', '1', '2'].includes(last);
}

export default function ProductCard({ product }: ProductCardProps) {
  const images = product.image_urls || [];
  const primary = images[0] ? getPublicImageUrl(images[0]) : '';
  const secondary = images[1] ? getPublicImageUrl(images[1]) : '';
  const limited = product.stock > 0 && product.stock <= 5;

  return (
    <Card className="group relative overflow-hidden p-4 transition hover:-translate-y-1 hover:shadow-card">
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
        {isNew(product.created_at) ? <Badge>New</Badge> : null}
        {limited ? <Badge variant="accent">Limited</Badge> : null}
        {!limited && isBestSeller(product.id) ? (
          <Badge variant="outline">Best seller</Badge>
        ) : null}
      </div>

      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-clay">
          {primary ? (
            <>
              <Image
                src={primary}
                alt={product.title}
                fill
                className="object-cover transition duration-300 ease-smooth group-hover:opacity-0"
              />
              {secondary ? (
                <Image
                  src={secondary}
                  alt={product.title}
                  fill
                  className="object-cover opacity-0 transition duration-300 ease-smooth group-hover:opacity-100"
                />
              ) : null}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-black/40">
              No image
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="font-display text-lg font-semibold leading-tight">
            {product.title}
          </h3>
          <p className="text-sm text-black/70">
            {formatCurrency(product.price_amount, product.currency)}
          </p>
          <p className="text-xs text-black/50">
            {product.stock > 0 ? `${product.stock} left in stock` : 'Out of stock'}
          </p>
        </div>
      </Link>

      <div className="mt-4 flex items-center justify-between gap-3">
        <AddToCartButton productId={product.id} disabled={product.stock <= 0} />
        <Link href={`/products/${product.id}`} className="text-xs font-semibold text-ink">
          View details
        </Link>
      </div>
    </Card>
  );
}
