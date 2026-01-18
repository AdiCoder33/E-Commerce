import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/guard';
import AdminTable from '@/components/admin/admin-table';
import OrderStatusBadge from '@/components/order-status-badge';
import { formatCurrency, formatDateTime } from '@/lib/format';

type OrdersPageProps = {
  searchParams?: Promise<{
    status?: string;
    payment?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 12;

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const status = params?.status ?? 'all';
  const payment = params?.payment ?? 'all';
  const page = Number(params?.page ?? '1');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { supabase } = await requireAdmin('/admin/orders');

  let ordersQuery = supabase
    .from('orders')
    .select('id, status, payment_status, total_amount, currency, created_at, user_id', {
      count: 'exact'
    })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status !== 'all') {
    ordersQuery = ordersQuery.eq('status', status);
  }

  if (payment !== 'all') {
    ordersQuery = ordersQuery.eq('payment_status', payment);
  }

  const { data: orders, count } = await ordersQuery;
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/50">Admin</p>
        <h1 className="font-display text-3xl font-semibold">Orders</h1>
      </div>

      <form className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white/90 p-4 md:flex-row md:items-end">
        <label className="text-sm">
          <span className="text-black/70">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-black/70">Payment</span>
          <select
            name="payment"
            defaultValue={payment}
            className="mt-1 w-full rounded-2xl border border-black/10 px-4 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
        <button type="submit" className="rounded-full border border-black/15 px-4 py-2 text-sm">
          Apply
        </button>
      </form>

      {orders && orders.length > 0 ? (
        <AdminTable>
          <thead className="bg-black/5 text-xs uppercase tracking-[0.2em] text-black/50">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium">
                  {order.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-xs text-black/60">
                  {order.user_id.slice(0, 8)}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 capitalize">{order.payment_status}</td>
                <td className="px-4 py-3">
                  {formatCurrency(order.total_amount, order.currency)}
                </td>
                <td className="px-4 py-3 text-xs text-black/60">
                  {formatDateTime(order.created_at)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        <div className="rounded-3xl border border-dashed border-black/20 bg-white/80 p-8 text-center text-sm text-black/60">
          No orders match this filter.
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center gap-2 text-sm">
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            const href = `?status=${status}&payment=${payment}&page=${pageNumber}`;
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
