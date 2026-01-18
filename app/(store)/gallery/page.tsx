import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPublicImageUrl } from '@/lib/storage/productImageUrls';
import Breadcrumbs from '@/components/store/breadcrumbs';

export const revalidate = 120;

type GalleryPageProps = {
  searchParams?: Promise<{
    tag?: string;
  }>;
};

const styleFilters = [
  { label: 'All', tag: '' },
  { label: 'Ethnic', tag: 'ethnic' },
  { label: 'Casual', tag: 'casual' },
  { label: 'Winter', tag: 'winter' },
  { label: 'Formal', tag: 'formal' }
];

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const tag = params?.tag ?? '';

  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from('products')
    .select('id, title, image_urls, tags')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(60);

  if (tag) {
    query = query.contains('tags', [tag]);
  }

  const { data: products } = await query;
  const items =
    products
      ?.map((product) => ({
        id: product.id,
        title: product.title,
        image: product.image_urls?.[0]
      }))
      .filter((item) => item.image) || [];

  return (
    <main className="container py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Gallery' }]} />
          <h1 className="mt-2 font-display text-3xl font-semibold">Lookbook gallery</h1>
          <p className="mt-1 text-sm text-black/60">
            A visual edit of our latest clothing drops.
          </p>
        </div>
        <Link href="/products" className="text-sm text-black/60 hover:text-black">
          Shop products
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        {styleFilters.map((filter) => {
          const active = filter.tag === tag;
          const href = filter.tag ? `/gallery?tag=${filter.tag}` : '/gallery';
          return (
            <Link
              key={filter.label}
              href={href}
              className={`rounded-full px-3 py-1 ${
                active ? 'bg-ink text-paper' : 'border border-black/10 text-black/60'
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-black/15 bg-white/80 p-10 text-center text-sm text-black/60">
          No images found for this style yet.
        </div>
      ) : (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="mb-4 block break-inside-avoid overflow-hidden rounded-[var(--radius-lg)] bg-clay"
            >
              <Image
                src={getPublicImageUrl(item.image || '')}
                alt={item.title}
                width={600}
                height={800}
                className="h-auto w-full object-cover transition duration-300 ease-smooth hover:scale-[1.02]"
              />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
