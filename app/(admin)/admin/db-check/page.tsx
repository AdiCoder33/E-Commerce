import Link from 'next/link';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import { getUserAndProfile } from '@/lib/db/auth';

type CheckResult = {
  label: string;
  ok: boolean;
  detail?: string;
};

export default async function DbCheckPage() {
  const { supabase, user, profile } = await getUserAndProfile();

  if (!user) {
    redirect('/auth?redirect=/admin/db-check');
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">Admin</p>
            <h1 className="font-display text-3xl font-semibold">DB check</h1>
          </div>
          <Link href="/admin" className="text-sm text-black/60 hover:text-black">
            Back to admin
          </Link>
        </div>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          403: Admin access required to run database checks.
        </div>
      </main>
    );
  }

  const results: CheckResult[] = [];
  const readTables = ['categories', 'products', 'orders', 'order_items', 'carts', 'cart_items'];

  for (const table of readTables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    results.push({
      label: `Read ${table}`,
      ok: !error,
      detail: error?.message
    });
  }

  const token = randomUUID().slice(0, 8);
  const productTitle = `DB Check Product ${token}`;
  const { data: product, error: productInsertError } = await supabase
    .from('products')
    .insert({
      title: productTitle,
      description: 'Temporary product created by db-check.',
      price_amount: 1234,
      currency: 'INR',
      stock: 1,
      is_active: false
    })
    .select('id')
    .single();

  results.push({
    label: 'Create product',
    ok: !productInsertError,
    detail: productInsertError?.message
  });

  if (product) {
    const { error: productUpdateError } = await supabase
      .from('products')
      .update({ title: `${productTitle} Updated` })
      .eq('id', product.id);

    results.push({
      label: 'Update product',
      ok: !productUpdateError,
      detail: productUpdateError?.message
    });

    const { error: productDeleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);

    results.push({
      label: 'Delete product',
      ok: !productDeleteError,
      detail: productDeleteError?.message
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Admin</p>
          <h1 className="font-display text-3xl font-semibold">DB check</h1>
        </div>
        <Link href="/admin" className="text-sm text-black/60 hover:text-black">
          Back to admin
        </Link>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
        <h2 className="font-display text-lg font-semibold">Sanity checks</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {results.map((result) => (
            <li key={result.label} className="flex flex-col gap-1">
              <span className={result.ok ? 'text-emerald-700' : 'text-red-700'}>
                {result.ok ? 'OK' : 'FAIL'} - {result.label}
              </span>
              {result.detail ? (
                <span className="text-xs text-black/60">{result.detail}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
