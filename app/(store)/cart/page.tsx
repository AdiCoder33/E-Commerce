import Link from 'next/link';
import CartView from '@/components/cart-view';
import Breadcrumbs from '@/components/store/breadcrumbs';

export default function CartPage() {
  return (
    <main className="container py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Cart' }]} />
          <h1 className="mt-2 font-display text-3xl font-semibold">Your cart</h1>
          <p className="mt-1 text-sm text-black/60">
            Review your items and proceed to checkout when ready.
          </p>
        </div>
        <Link href="/products" className="text-sm text-black/60 hover:text-black">
          Continue shopping
        </Link>
      </div>
      <CartView />
    </main>
  );
}
