import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/guard';
import OrderStatusBadge from '@/components/order-status-badge';
import { formatCurrency, formatDateTime } from '@/lib/format';

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin('/admin');

  const [{ count: totalProducts }, { count: activeProducts }] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
  ]);

  const [{ count: totalOrders }, { count: pendingOrders }] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
  ]);

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, status, total_amount, currency, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/50">Admin</p>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-4">
          <p className="text-xs text-black/50">Total products</p>
          <p className="mt-2 text-2xl font-semibold">{totalProducts ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white/90 p-4">
          <p className="text-xs text-black/50">Active products</p>
          <p className="mt-2 text-2xl font-semibold">{activeProducts ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white/90 p-4">
          <p className="text-xs text-black/50">Total orders</p>
          <p className="mt-2 text-2xl font-semibold">{totalOrders ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white/90 p-4">
          <p className="text-xs text-black/50">Pending orders</p>
          <p className="mt-2 text-2xl font-semibold">{pendingOrders ?? 0}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-black/60 hover:text-black">
            View all
          </Link>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-xs text-black/50">{formatDateTime(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <OrderStatusBadge status={order.status} />
                  <p className="mt-1 text-sm font-medium">
                    {formatCurrency(order.total_amount, order.currency)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-black/60">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
