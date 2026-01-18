import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/format';
import AddToCartButton from '@/components/add-to-cart-button';
import ProductGallery from '@/components/store/product-gallery';
import TrustBlock from '@/components/store/trust-block';
import Tabs from '@/components/ui/tabs';
import Accordion from '@/components/ui/accordion';
import Breadcrumbs from '@/components/store/breadcrumbs';
import ProductGrid from '@/components/store/product-grid';
import ReviewsPlaceholder from '@/components/store/reviews-placeholder';
import PhotoCredits from '@/components/store/photo-credits';

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: product } = await supabase
    .from('products')
    .select('id, title, description, price_amount, currency, image_urls, stock, is_active, category_id, attribution')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (!product) {
    notFound();
  }

  const { data: category } = product.category_id
    ? await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('id', product.category_id)
        .single()
    : { data: null };

  const relatedQuery = supabase
    .from('products')
    .select('id, title, price_amount, currency, image_urls, stock, created_at')
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)
    .order('created_at', { ascending: false });

  const { data: related } = product.category_id
    ? await relatedQuery.eq('category_id', product.category_id)
    : await relatedQuery;

  const tabs = [
    {
      value: 'description',
      label: 'Description',
      content: product.description || 'No description provided yet.'
    },
    {
      value: 'specs',
      label: 'Specs',
      content:
        'Material: Natural blend. Dimensions: 40x30cm. Care: Wipe clean with soft cloth.'
    },
    {
      value: 'shipping',
      label: 'Shipping & Returns',
      content:
        'Ships in 2-3 days. Free returns within 7 days of delivery. COD available where applicable.'
    }
  ];

  return (
    <main className="container py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Breadcrumbs
          items={[
            category?.name
              ? {
                  label: category.name,
                  href: `/products?category=${category.slug}`
                }
              : { label: 'Catalog' },
            { label: product.title }
          ]}
        />
        <Link href="/cart" className="text-black/60 hover:text-black">
          View cart
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery title={product.title} images={product.image_urls || []} />

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">Product</p>
            <h1 className="font-display text-3xl font-semibold">{product.title}</h1>
            <p className="mt-2 text-sm text-black/60">Modern essentials by Aaranya Apparel.</p>
          </div>
          <p className="text-lg font-semibold">
            {formatCurrency(product.price_amount, product.currency)}
          </p>
          <div className="flex items-center gap-4">
            <span className={`text-xs ${product.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {product.stock > 0 ? 'In stock' : 'Out of stock'}
            </span>
            <span className="text-xs text-black/40">Free delivery above 1999</span>
          </div>
          <AddToCartButton productId={product.id} disabled={product.stock <= 0} />
          <TrustBlock />

          <div className="hidden md:block">
            <Tabs items={tabs} />
          </div>
          <div className="md:hidden">
            <Accordion items={tabs.map((item) => ({ title: item.label, content: item.content }))} />
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="font-display text-2xl font-semibold">You may also like</h2>
        <ProductGrid products={related || []} />
      </div>

      <div className="mt-12">
        <ReviewsPlaceholder />
        <PhotoCredits attribution={product.attribution as { photos?: Array<{ name?: string; profile?: string }> } | null} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/10 bg-white/95 p-4 shadow-soft md:hidden">
        <div className="container flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{formatCurrency(product.price_amount, product.currency)}</p>
            <p className="text-xs text-black/50">Tap to add to cart</p>
          </div>
          <AddToCartButton productId={product.id} disabled={product.stock <= 0} />
        </div>
      </div>
    </main>
  );
}
