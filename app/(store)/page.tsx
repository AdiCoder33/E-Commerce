import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/store/product-grid';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';

export const revalidate = 120;

const collections = [
  { label: 'Ethnic Edit', tag: 'ethnic', description: 'Handloom, drapes, and festive essentials.' },
  { label: 'Casual Staples', tag: 'casual', description: 'Daily tees, denim, and easy fits.' },
  { label: 'Winter Layering', tag: 'winter', description: 'Cozy hoodies and warm textures.' },
  { label: 'Formal Dressing', tag: 'formal', description: 'Tailored shirts and smart silhouettes.' }
];

const testimonials = [
  {
    name: 'Meera S.',
    quote: 'The fabric quality is exceptional and the fit is perfect for daily wear.'
  },
  {
    name: 'Aman K.',
    quote: 'Fast delivery, premium packaging, and the colors look even better in person.'
  },
  {
    name: 'Priya R.',
    quote: 'Love the mix of ethnic and modern designs. The kurta set is my favorite.'
  }
];

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: settings } = await supabase
    .from('site_settings')
    .select('store_name, tagline, about_md')
    .single();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  const { data: newArrivals } = await supabase
    .from('products')
    .select('id, title, price_amount, currency, image_urls, stock, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  const { data: featured } = await supabase
    .from('products')
    .select('id, title, price_amount, currency, image_urls, stock, created_at')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(8);

  const { data: bestSellers } = await supabase
    .from('products')
    .select('id, title, price_amount, currency, image_urls, stock, created_at')
    .eq('is_active', true)
    .contains('tags', ['best'])
    .limit(8);

  const collectionProducts = await Promise.all(
    collections.map(async (collection) => {
      const { data } = await supabase
        .from('products')
        .select('id, title, image_urls')
        .eq('is_active', true)
        .contains('tags', [collection.tag])
        .order('created_at', { ascending: false })
        .limit(1);
      return { ...collection, product: data?.[0] };
    })
  );

  const aboutLines =
    settings?.about_md?.split('\n').filter((line) => line.trim().length > 0) || [];

  return (
    <main className="container py-10">
      <section className="space-y-16">
        <div className="grid gap-10 rounded-[var(--radius-xl)] border border-black/10 bg-white/90 p-10 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">New season</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
              {settings?.store_name || "Adi's Brand"}
            </h1>
            <p className="text-lg text-black/70">
              {settings?.tagline || 'Modern essentials rooted in Indian craft.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button>Shop now</Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline">View lookbook</Button>
              </Link>
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] bg-fog p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">Style notes</p>
            <div className="mt-4 space-y-3 text-sm text-black/70">
              <p>Crafted for day-to-night dressing, with breathable fabrics.</p>
              <p>Curated palettes inspired by modern Indian cities.</p>
              <p>Easy returns and COD on eligible orders.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-[var(--radius-xl)] border border-black/10 bg-white/90 p-6 text-sm md:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] bg-paper px-5 py-4">
            <p className="font-semibold">Free shipping</p>
            <p className="text-black/60">On orders above INR 1999</p>
          </div>
          <div className="rounded-[var(--radius-lg)] bg-paper px-5 py-4">
            <p className="font-semibold">Easy returns</p>
            <p className="text-black/60">7-day hassle-free pickup</p>
          </div>
          <div className="rounded-[var(--radius-lg)] bg-paper px-5 py-4">
            <p className="font-semibold">Secure payments</p>
            <p className="text-black/60">UPI, cards, and COD</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Categories</p>
              <h2 className="font-display text-2xl font-semibold">Shop by category</h2>
            </div>
            <Link href="/products" className="text-sm text-black/60 hover:text-black">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(categories || []).slice(0, 8).map((category) => (
              <Card key={category.id} className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-black/50">Category</p>
                <h3 className="mt-2 font-display text-lg font-semibold">{category.name}</h3>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="mt-3 inline-flex text-sm font-semibold text-ink underline"
                >
                  Explore
                </Link>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">New arrivals</p>
              <h2 className="font-display text-2xl font-semibold">Fresh drops for the season</h2>
            </div>
            <Link href="/products?tag=new" className="text-sm text-black/60 hover:text-black">
              Shop new
            </Link>
          </div>
          <ProductGrid products={newArrivals || []} />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">Collections</p>
            <h2 className="font-display text-2xl font-semibold">Shop by style</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {collectionProducts.map((collection) => (
              <Card key={collection.tag} className="flex flex-col justify-between p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                    {collection.label}
                  </p>
                  <p className="mt-3 text-sm text-black/60">{collection.description}</p>
                </div>
                <Link
                  href={`/products?tag=${collection.tag}`}
                  className="mt-4 inline-flex text-sm font-semibold text-ink underline"
                >
                  Explore {collection.label}
                </Link>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Best sellers</p>
              <h2 className="font-display text-2xl font-semibold">Loved by our community</h2>
            </div>
            <Link href="/products?tag=best" className="text-sm text-black/60 hover:text-black">
              Shop best sellers
            </Link>
          </div>
          <ProductGrid products={bestSellers && bestSellers.length > 0 ? bestSellers : featured || []} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">About</p>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              Designed for everyday rituals.
            </h2>
            <div className="mt-4 space-y-3 text-sm text-black/60">
              {aboutLines.length > 0 ? (
                aboutLines.map((line) => <p key={line}>{line}</p>)
              ) : (
                <p>
                  Adi's Brand blends contemporary silhouettes with heritage textiles,
                  creating versatile pieces that move with you.
                </p>
              )}
            </div>
          </Card>
          <Card className="p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">Testimonials</p>
            <div className="mt-4 space-y-4 text-sm text-black/70">
              {testimonials.map((item) => (
                <div key={item.name} className="rounded-[var(--radius-md)] border border-black/5 bg-white px-4 py-3">
                  <p>"{item.quote}"</p>
                  <p className="mt-2 text-xs text-black/50">{item.name}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
