import Link from 'next/link';

type BreadcrumbsProps = {
  items: Array<{ label: string; href?: string }>;
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-black/50">
      <Link href="/" className="hover:text-black">
        Home
      </Link>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span>/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-black">
              {item.label}
            </Link>
          ) : (
            <span className="text-black/80">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
