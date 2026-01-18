import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime } from '@/lib/format';
import OrderStatusBadge from '@/components/order-status-badge';
import Breadcrumbs from '@/components/store/breadcrumbs';

export default async function OrdersPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth?next=/orders');
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total_amount, currency, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="container py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Orders' }]} />
          <h1 className="mt-2 font-display text-3xl font-semibold">Order history</h1>
          <p className="mt-1 text-sm text-black/60">Track your recent purchases.</p>
        </div>
        <Link href="/" className="text-sm text-black/60 hover:text-black">
          Back to catalog
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-black/20 bg-white/80 p-8 text-center text-sm text-black/60">
          You have no orders yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-[var(--radius-lg)] border border-black/10 bg-white/90 p-5 hover:border-black/30"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-black/50">
                  <span>Order</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="font-display text-lg font-semibold">{order.id}</p>
                <div className="flex items-center justify-between text-sm text-black/60">
                  <span>{formatDateTime(order.created_at)}</span>
                  <span className="font-semibold text-ink">
                    {formatCurrency(order.total_amount, order.currency)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
