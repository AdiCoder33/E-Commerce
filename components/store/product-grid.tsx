import ProductCard from '@/components/store/product-card';

type ProductGridProps = {
  products: Array<{
    id: string;
    title: string;
    price_amount: number;
    currency: string;
    image_urls: string[] | null;
    stock: number;
    created_at?: string | null;
  }>;
};

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-black/15 bg-white/80 p-10 text-center text-sm text-black/60">
        No products found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
