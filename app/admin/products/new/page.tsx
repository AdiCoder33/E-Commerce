import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/guard';
import ProductForm from '@/components/admin/product-form';

export default async function NewProductPage() {
  const { supabase } = await requireAdmin('/admin/products/new');
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Admin</p>
          <h1 className="font-display text-3xl font-semibold">New product</h1>
        </div>
        <Link href="/admin/products" className="text-sm text-black/60 hover:text-black">
          Back to products
        </Link>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
        <ProductForm mode="create" categories={categories || []} />
      </div>
    </div>
  );
}
