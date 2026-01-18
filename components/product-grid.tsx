import ProductCard from '@/components/product-card';

type ProductGridProps = {
  products: Array<{
    id: string;
    title: string;
    price_amount: number;
    currency: string;
    image_urls: string[] | null;
    stock: number;
  }>;
};

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-black/20 bg-white/70 p-8 text-center text-sm text-black/60">
        No products match your filters yet.
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
