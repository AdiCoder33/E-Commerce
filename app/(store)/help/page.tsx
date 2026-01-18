import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Accordion from '@/components/ui/accordion';
import Breadcrumbs from '@/components/store/breadcrumbs';
import Card from '@/components/ui/card';

export const revalidate = 300;

export default async function HelpPage() {
  const supabase = await createServerSupabaseClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('support_email, support_phone')
    .single();

  const faqs = [
    {
      title: 'How long does shipping take?',
      content: 'Orders ship within 2-4 business days. Delivery timelines vary by city.'
    },
    {
      title: 'What is your return policy?',
      content: 'We offer a 7-day return window for unused items with tags intact.'
    },
    {
      title: 'Which payment methods are supported?',
      content: 'UPI, cards, netbanking, and cash on delivery on eligible orders.'
    },
    {
      title: 'How do I find my size?',
      content: 'Use the sizing guide below or reach out for fit assistance.'
    }
  ];

  return (
    <main className="container py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ label: 'Help' }]} />
          <h1 className="mt-2 font-display text-3xl font-semibold">Help center</h1>
          <p className="mt-1 text-sm text-black/60">
            Answers to common questions about orders, returns, and sizing.
          </p>
        </div>
        <Link href="/products" className="text-sm text-black/60 hover:text-black">
          Continue shopping
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">FAQ</p>
          <div className="mt-4">
            <Accordion items={faqs} />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">Sizing guide</p>
            <div className="mt-4 space-y-3 text-sm text-black/60">
              <p>XS: Chest 34-36 in, Waist 26-28 in</p>
              <p>S: Chest 36-38 in, Waist 28-30 in</p>
              <p>M: Chest 38-40 in, Waist 30-32 in</p>
              <p>L: Chest 40-42 in, Waist 32-34 in</p>
              <p>XL: Chest 42-44 in, Waist 34-36 in</p>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">Contact</p>
            <div className="mt-4 space-y-2 text-sm text-black/60">
              <p>Email: {settings?.support_email || 'support@aaranya.test'}</p>
              <p>Phone: {settings?.support_phone || '+91 90000 00000'}</p>
              <p>Mon-Sat, 9am-6pm IST</p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
