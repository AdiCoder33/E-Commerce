import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/guard';
import ProductForm from '@/components/admin/product-form';
import ProductImageManager from '@/components/admin/product-image-manager';

export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin(`/admin/products/${id}`);

  const { data: product } = await supabase
    .from('products')
    .select('id, title, description, price_amount, stock, category_id, is_active, image_urls')
    .eq('id', id)
    .single();

  if (!product) {
    notFound();
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Admin</p>
          <h1 className="font-display text-3xl font-semibold">Edit product</h1>
        </div>
        <Link href="/admin/products" className="text-sm text-black/60 hover:text-black">
          Back to products
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
          <ProductForm
            mode="edit"
            productId={product.id}
            categories={categories || []}
            initialData={product}
          />
        </div>
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
          <h2 className="font-display text-lg font-semibold">Images</h2>
          <p className="mt-1 text-sm text-black/60">
            Upload JPEG, PNG, or WebP up to 5MB.
          </p>
          <div className="mt-4">
            <ProductImageManager
              productId={product.id}
              images={(product.image_urls as string[] | null) || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
