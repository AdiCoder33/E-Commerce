import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime } from '@/lib/format';
import OrderStatusBadge from '@/components/order-status-badge';
import PaymentButton from '@/components/payment-button';
import Breadcrumbs from '@/components/store/breadcrumbs';
import OrderTimeline from '@/components/store/order-timeline';
import Card from '@/components/ui/card';

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    success?: string;
  }>;
};

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?next=/orders/${id}`);
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, status, payment_status, payment_method, total_amount, currency, shipping_address, created_at')
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

  const paramsData = searchParams ? await searchParams : undefined;
  const showSuccess = paramsData?.success === '1';

  const shipping = order.shipping_address || {};

  return (
    <main className="container py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Orders', href: '/orders' }, { label: order.id }]} />
          <h1 className="mt-2 font-display text-3xl font-semibold">Order {order.id}</h1>
          <p className="mt-1 text-sm text-black/60">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <Link href="/orders" className="text-sm text-black/60 hover:text-black">
          Back to orders
        </Link>
      </div>

      {showSuccess ? (
        <Card className="mb-6 border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-700">
          Order placed successfully. You will receive updates as your items ship.
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <OrderStatusBadge status={order.status} />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">
              {order.payment_status}
            </span>
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
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
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
          </Card>

          <Card className="p-6">
            <div className="space-y-3 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Payment</p>
              <p className="font-medium capitalize">{order.payment_status}</p>
              {order.payment_status === 'failed' ? (
                <p className="text-xs text-red-600">
                  Payment failed. You can try again.
                </p>
              ) : null}
              <p className="text-xs text-black/50">
                Method: {order.payment_method === 'cod' ? 'Cash on delivery' : order.payment_method}
              </p>
            </div>
            {order.payment_status !== 'paid' && order.payment_method === 'razorpay' ? (
              <div className="mt-4">
                <PaymentButton
                  orderId={order.id}
                  paymentStatus={order.payment_status}
                  paymentMethod={order.payment_method}
                />
              </div>
            ) : null}
            {order.payment_method === 'cod' ? (
              <p className="mt-4 text-xs text-black/60">
                You chose cash on delivery. Payment will be collected on delivery.
              </p>
            ) : null}
            {order.payment_method !== 'razorpay' && order.payment_method !== 'cod' ? (
              <p className="mt-4 text-xs text-black/60">
                Online payment for this method is coming soon.
              </p>
            ) : null}
          </Card>

          <Card className="p-6">
            <OrderTimeline status={order.status} />
          </Card>
        </div>
      </div>
    </main>
  );
}
