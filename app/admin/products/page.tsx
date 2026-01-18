import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/guard';
import AdminTable from '@/components/admin/admin-table';
import ProductActions from '@/components/admin/product-actions';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getPublicImageUrl } from '@/lib/storage/productImageUrls';

type ProductsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    category?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 10;

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const query = params?.q?.trim() ?? '';
  const status = params?.status ?? 'all';
  const category = params?.category ?? 'all';
  const page = Number(params?.page ?? '1');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { supabase } = await requireAdmin('/admin/products');

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  let productsQuery = supabase
    .from('products')
    .select('id, title, price_amount, currency, stock, is_active, category_id, image_urls, updated_at', {
      count: 'exact'
    })
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (query) {
    productsQuery = productsQuery.ilike('title', `%${query}%`);
  }

  if (status === 'active') {
    productsQuery = productsQuery.eq('is_active', true);
  }

  if (status === 'inactive') {
    productsQuery = productsQuery.eq('is_active', false);
  }

  if (category !== 'all') {
    const categoryMatch = categories?.find((item) => item.id === category || item.slug === category);
    if (categoryMatch?.id) {
      productsQuery = productsQuery.eq('category_id', categoryMatch.id);
    }
  }

  const { data: products, count } = await productsQuery;
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  const categoryMap = new Map((categories || []).map((item) => [item.id, item.name]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Admin</p>
          <h1 className="font-display text-3xl font-semibold">Products</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper"
        >
          Add product
        </Link>
      </div>

      <form className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white/90 p-4 md:flex-row md:items-end">
        <label className="flex-1 text-sm">
          <span className="text-black/70">Search</span>
          <input
            name="q"
            defaultValue={query}
            className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-2 text-sm"
            placeholder="Search title"
          />
        </label>
        <label className="text-sm">
          <span className="text-black/70">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-black/70">Category</span>
          <select
            name="category"
            defaultValue={category}
            className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-2 text-sm"
          >
            <option value="all">All</option>
            {(categories || []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full border border-black/15 px-4 py-2 text-sm"
        >
          Apply
        </button>
      </form>

      {products && products.length > 0 ? (
        <AdminTable>
          <thead className="bg-black/5 text-xs uppercase tracking-[0.2em] text-black/50">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const image = product.image_urls?.[0];
              const imageUrl = image ? getPublicImageUrl(image) : '';
              return (
                <tr key={product.id} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    <div className="h-12 w-16 overflow-hidden rounded-xl bg-clay">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-black/40">
                          No image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-black/80"
                    >
                      {product.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(product.price_amount, product.currency)}
                  </td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    {product.is_active ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-3">
                    {product.category_id ? categoryMap.get(product.category_id) : 'Uncategorized'}
                  </td>
                  <td className="px-4 py-3">
                    {formatDateTime(product.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="rounded-full border border-black/10 px-3 py-1 text-xs"
                      >
                        Edit
                      </Link>
                      <ProductActions
                        productId={product.id}
                        isActive={product.is_active}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      ) : (
        <div className="rounded-3xl border border-dashed border-black/20 bg-white/80 p-8 text-center text-sm text-black/60">
          No products match this filter.
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center gap-2 text-sm">
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            const href = `?q=${encodeURIComponent(query)}&status=${status}&category=${category}&page=${pageNumber}`;
            return (
              <Link
                key={pageNumber}
                href={href}
                className={`rounded-full px-3 py-1 ${pageNumber === page ? 'bg-ink text-paper' : 'border border-black/10 text-black/60'}`}
              >
                {pageNumber}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
