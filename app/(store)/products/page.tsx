import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/store/product-grid';
import ProductFilters from '@/components/store/product-filters';
import FilterChips from '@/components/store/filter-chips';
import SortSelect from '@/components/store/sort-select';
import Breadcrumbs from '@/components/store/breadcrumbs';

export const revalidate = 60;

type ProductsPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    min?: string;
    max?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 12;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const query = params?.q?.trim() ?? '';
  const categorySlug = params?.category ?? '';
  const tag = params?.tag ?? '';
  const min = params?.min ?? '';
  const max = params?.max ?? '';
  const inStock = params?.inStock ?? '';
  const sort = params?.sort ?? 'relevance';
  const page = Number(params?.page ?? '1');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createServerSupabaseClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  let selectedCategoryId: string | null = null;
  let selectedCategoryName: string | null = null;
  if (categorySlug && categories) {
    const match = categories.find((category) => category.slug === categorySlug);
    selectedCategoryId = match?.id ?? null;
    selectedCategoryName = match?.name ?? null;
  }

  let productsQuery = supabase
    .from('products')
    .select('id, title, price_amount, currency, image_urls, stock, category_id, created_at', {
      count: 'exact'
    })
    .eq('is_active', true)
    .range(from, to);

  if (query) {
    productsQuery = productsQuery.ilike('title', `%${query}%`);
  }

  if (selectedCategoryId) {
    productsQuery = productsQuery.eq('category_id', selectedCategoryId);
  }

  if (tag) {
    productsQuery = productsQuery.contains('tags', [tag]);
  }

  if (min) {
    const minValue = Math.round(Number(min) * 100);
    if (!Number.isNaN(minValue)) {
      productsQuery = productsQuery.gte('price_amount', minValue);
    }
  }

  if (max) {
    const maxValue = Math.round(Number(max) * 100);
    if (!Number.isNaN(maxValue)) {
      productsQuery = productsQuery.lte('price_amount', maxValue);
    }
  }

  if (inStock === '1') {
    productsQuery = productsQuery.gt('stock', 0);
  }

  if (sort === 'price-asc') {
    productsQuery = productsQuery.order('price_amount', { ascending: true });
  } else if (sort === 'price-desc') {
    productsQuery = productsQuery.order('price_amount', { ascending: false });
  } else {
    productsQuery = productsQuery.order('created_at', { ascending: false });
  }

  const { data: products, count } = await productsQuery;
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  const filters = { q: query, category: categorySlug, tag, min, max, inStock, sort };

  return (
    <main className="container py-10">
      <section className="space-y-8">
        <div className="grid gap-6 rounded-[var(--radius-xl)] border border-black/10 bg-white/90 p-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <Breadcrumbs
              items={[
                { label: 'Products', href: '/products' },
                ...(categorySlug && selectedCategoryName
                  ? [{ label: selectedCategoryName, href: `/products?category=${categorySlug}` }]
                  : [])
              ]}
            />
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Everyday clothing curated for modern wardrobes.
            </h1>
            <p className="text-base text-black/70">
              Discover essentials, ethnic edits, and premium layering pieces.
            </p>
            <Link
              href="/gallery"
              className="inline-flex rounded-full border border-black/20 px-5 py-2.5 text-sm font-semibold"
            >
              Explore lookbook
            </Link>
          </div>
          <div className="rounded-[var(--radius-lg)] bg-fog p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">Featured</p>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              Handpicked styles for every season.
            </h2>
            <p className="mt-2 text-sm text-black/60">
              Layering staples, heritage weaves, and daily essentials.
            </p>
            <Link
              href="/products?tag=new"
              className="mt-4 inline-flex text-sm font-semibold text-ink underline"
            >
              Shop new arrivals
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <FilterChips filters={filters} />
          <SortSelect current={sort} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <ProductFilters categories={categories || []} initialFilters={filters} totalCount={count ?? 0} />
          <ProductGrid products={products || []} />
        </div>

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const params = new URLSearchParams();
              if (query) params.set('q', query);
              if (categorySlug) params.set('category', categorySlug);
              if (tag) params.set('tag', tag);
              if (min) params.set('min', min);
              if (max) params.set('max', max);
              if (inStock) params.set('inStock', inStock);
              if (sort && sort !== 'relevance') params.set('sort', sort);
              params.set('page', String(pageNumber));
              return (
                <Link
                  key={pageNumber}
                  href={`/products?${params.toString()}`}
                  className={`rounded-full px-3 py-1 text-sm ${
                    pageNumber === page ? 'bg-ink text-paper' : 'border border-black/10 text-black/60'
                  }`}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}
