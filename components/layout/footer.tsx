import Link from 'next/link';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type FooterProps = {
  categories: Category[];
  settings?: {
    store_name?: string | null;
    about_md?: string | null;
    support_email?: string | null;
    support_phone?: string | null;
  } | null;
};

export default function Footer({ categories, settings }: FooterProps) {
  const highlight = categories.slice(0, 5);
  const about =
    settings?.about_md?.split('\n').find((line) => line.trim().length > 0) ||
    'A modern clothing studio focused on comfort, craftsmanship, and everyday style.';
  const storeName = settings?.store_name || 'Aaranya Apparel';

  return (
    <footer className="border-t border-black/10 bg-paper">
      <div className="container grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">{storeName}</p>
          <h3 className="font-display text-2xl font-semibold">
            Contemporary clothing for every day.
          </h3>
          <p className="text-sm text-black/60">{about}</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Shop</p>
          <div className="grid gap-2">
            <Link href="/products" className="text-black/70 hover:text-ink">
              All products
            </Link>
            {highlight.length > 0 ? (
              highlight.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="text-black/70 hover:text-ink"
                >
                  {category.name}
                </Link>
              ))
            ) : (
              <p className="text-black/50">Add categories to highlight here.</p>
            )}
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Support</p>
          <div className="grid gap-2 text-black/70">
            <Link href="/help" className="hover:text-ink">
              Help center
            </Link>
            <Link href="/orders" className="hover:text-ink">
              Track your order
            </Link>
            <Link href="/dashboard" className="hover:text-ink">
              Account & profile
            </Link>
            <span className="text-black/50">{settings?.support_email || 'support@aaranya.test'}</span>
            <span className="text-black/50">{settings?.support_phone || '+91 90000 00000'}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-black/10">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4 text-xs text-black/50">
          <span>2026 Aaranya Apparel. All rights reserved.</span>
          <span>Secure payments - Fast shipping - Easy returns</span>
        </div>
      </div>
    </footer>
  );
}



