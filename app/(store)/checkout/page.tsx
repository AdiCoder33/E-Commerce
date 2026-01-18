import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import CheckoutForm from '@/components/checkout-form';
import CheckoutStepper from '@/components/store/checkout-stepper';
import Card from '@/components/ui/card';

export default async function CheckoutPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth?next=/checkout');
  }

  return (
    <main className="container py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Checkout</p>
          <h1 className="font-display text-3xl font-semibold">Finalize your order</h1>
          <p className="mt-2 text-sm text-black/60">
            Secure checkout with verified pricing and trusted payment options.
          </p>
        </div>
        <Link href="/cart" className="text-sm text-black/60 hover:text-black">
          Back to cart
        </Link>
      </div>

      <div className="mb-6">
        <CheckoutStepper current={1} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <CheckoutForm />
        <Card className="h-fit space-y-4 p-6 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Why shop with us</p>
          <div className="grid gap-3 text-black/60">
            <p>SSL-secured checkout with verified providers.</p>
            <p>Cash on delivery and flexible payment methods.</p>
            <p>Fast delivery with real-time tracking.</p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-black/10 bg-fog px-4 py-3 text-xs text-black/60">
            Need help? Reach us at help@oakandstone.test
          </div>
        </Card>
      </div>
    </main>
  );
}
