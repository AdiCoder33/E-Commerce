import { requireAdmin } from '@/lib/admin/guard';
import AdminTable from '@/components/admin/admin-table';
import CategoryForm from '@/components/admin/category-form';
import CategoryActions from '@/components/admin/category-actions';

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin('/admin/categories');

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, created_at')
    .order('name');

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/50">Admin</p>
        <h1 className="font-display text-3xl font-semibold">Categories</h1>
      </div>

      <CategoryForm />

      {categories && categories.length > 0 ? (
        <AdminTable>
          <thead className="bg-black/5 text-xs uppercase tracking-[0.2em] text-black/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-sm text-black/60">{category.slug}</td>
                <td className="px-4 py-3">
                  <CategoryActions categoryId={category.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        <div className="rounded-3xl border border-dashed border-black/20 bg-white/80 p-8 text-center text-sm text-black/60">
          No categories yet.
        </div>
      )}
    </div>
  );
}
