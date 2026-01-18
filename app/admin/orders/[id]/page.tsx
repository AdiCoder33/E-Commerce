import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/guard';
import OrderStatusBadge from '@/components/order-status-badge';
import OrderStatusSelect from '@/components/admin/order-status-select';
import type { OrderStatus } from '@/lib/validators/order';
import { formatCurrency, formatDateTime } from '@/lib/format';

export default async function AdminOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin(`/admin/orders/${id}`);

  const { data: order } = await supabase
    .from('orders')
    .select('id, status, payment_status, payment_method, total_amount, currency, shipping_address, created_at, user_id')
    .eq('id', id)
    .single();

  if (!order) {
    notFound();
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('id, title_snapshot, price_snapshot, qty, line_total')
    .eq('order_id', order.id)
    .order('created_at');

  const { data: payments } = await supabase
    .from('payments')
    .select('id, status, provider, provider_order_id, provider_payment_id, amount, currency, created_at')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false });

  const shipping = order.shipping_address || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Order</p>
          <h1 className="font-display text-3xl font-semibold">{order.id}</h1>
        </div>
        <Link href="/admin/orders" className="text-sm text-black/60 hover:text-black">
          Back to orders
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-black/60">Placed</p>
              <p className="font-medium">{formatDateTime(order.created_at)}</p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="mt-6 space-y-4">
            {(items || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{item.title_snapshot}</p>
                  <p className="text-xs text-black/50">Qty {item.qty}</p>
                </div>
                <span className="font-medium">
                  {formatCurrency(item.line_total, order.currency)}
                </span>
              </div>
            ))}
            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount, order.currency)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
            <h2 className="font-display text-lg font-semibold">Shipping</h2>
            <div className="mt-4 space-y-2 text-sm text-black/70">
              <p>{shipping.name}</p>
              <p>{shipping.phone}</p>
              <p>{shipping.addressLine1}</p>
              {shipping.addressLine2 ? <p>{shipping.addressLine2}</p> : null}
              <p>
                {shipping.city}, {shipping.state} {shipping.pincode}
              </p>
              <p>{shipping.country}</p>
            </div>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
            <OrderStatusSelect
              orderId={order.id}
              currentStatus={order.status as OrderStatus}
            />
            <div className="mt-6 text-sm">
              <p className="text-black/50">Payment status</p>
              <p className="font-medium capitalize">{order.payment_status}</p>
              <p className="mt-2 text-xs text-black/50">
                Method: {order.payment_method === 'cod' ? 'Cash on delivery' : order.payment_method}
              </p>
              <p className="mt-3 text-xs text-black/50">Customer ID: {order.user_id}</p>
            </div>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
            <h2 className="font-display text-lg font-semibold">Payment details</h2>
            {payments && payments.length > 0 ? (
              <div className="mt-4 space-y-3 text-sm">
                {payments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border border-black/5 px-4 py-3">
                    <p className="font-medium capitalize">{payment.status}</p>
                    <p className="text-xs text-black/50">
                      {payment.provider} - {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <p className="mt-2 break-all text-xs text-black/50">
                      Order: {payment.provider_order_id || 'n/a'}
                    </p>
                    <p className="mt-1 break-all text-xs text-black/50">
                      Payment: {payment.provider_payment_id || 'n/a'}
                    </p>
                    <p className="mt-2 text-xs text-black/50">
                      {formatDateTime(payment.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-black/60">No payment records yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


