"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MegaMenu from '@/components/layout/mega-menu';
import SearchBar from '@/components/layout/search-bar';
import { useCart } from '@/lib/cart/useCart';
import { useStoreUI } from '@/components/layout/store-provider';
import { cn } from '@/lib/utils/cn';
import Drawer from '@/components/ui/drawer';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type HeaderProps = {
  categories: Category[];
  userEmail?: string | null;
  storeName?: string | null;
};

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M13.5 12.5L18 17M9 15A6 6 0 1 0 9 3a6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M4 16.5c1.4-2.5 3.4-3.7 6-3.7s4.6 1.2 6 3.7"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 17s-6-3.4-7.5-7.2A4.5 4.5 0 0 1 10 4.7a4.5 4.5 0 0 1 7.5 5.1C16 13.6 10 17 10 17Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M3 4h2l2 10h8l2-7H6"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="17" r="1" fill="currentColor" />
      <circle cx="14" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Help', href: '/help' }
];

export default function Header({ categories, userEmail, storeName }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { openCart, openSearch, pushToast } = useStoreUI();
  const [compact, setCompact] = useState(false);
  const [bump, setBump] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const handler = () => setCompact(window.scrollY > 12);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (totalItems === 0) {
      return;
    }
    setBump(true);
    const timeout = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(timeout);
  }, [totalItems]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-black/10 bg-paper/90 backdrop-blur',
        compact ? 'py-3' : 'py-5'
      )}
    >
      <div className="container flex items-center gap-6">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="rounded-full border border-black/10 p-2 text-black/70 hover:border-black/30 lg:hidden"
          aria-label="Open menu"
        >
          <IconMenu />
        </button>

        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          {storeName || "Adi's Brand"}
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition',
                  active ? 'text-ink' : 'text-black/60 hover:text-ink'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <MegaMenu categories={categories} label="Products" active={pathname.startsWith('/products')} />
        </div>

        <div className="hidden w-[420px] xl:block">
          <SearchBar placeholder="Search tees, kurtas, dresses..." />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => openSearch()}
            className="rounded-full border border-black/10 p-2 text-black/70 hover:border-black/30 xl:hidden"
            aria-label="Open search"
          >
            <IconSearch />
          </button>
          <button
            type="button"
            onClick={() => router.push(userEmail ? '/dashboard' : '/auth')}
            className="rounded-full border border-black/10 p-2 text-black/70 hover:border-black/30"
            aria-label="Account"
          >
            <IconUser />
          </button>
          <button
            type="button"
            onClick={() =>
              pushToast({
                title: 'Wishlist',
                message: 'Wishlist syncing arrives in the next release.',
                tone: 'info'
              })
            }
            className="rounded-full border border-black/10 p-2 text-black/70 hover:border-black/30"
            aria-label="Wishlist"
          >
            <IconHeart />
          </button>
          <button
            type="button"
            onClick={() => openCart()}
            className="relative rounded-full border border-black/10 p-2 text-black/70 hover:border-black/30"
            aria-label="Cart"
          >
            <IconCart />
            {totalItems > 0 ? (
              <span
                className={cn(
                  'absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ember text-[10px] font-semibold text-white transition',
                  bump && 'scale-110'
                )}
              >
                {totalItems}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <Drawer open={navOpen} onClose={() => setNavOpen(false)} position="left" size="md">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
            <p className="font-display text-lg font-semibold">
              {storeName || "Adi's Brand"}
            </p>
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              className="rounded-full border border-black/10 px-3 py-1 text-xs"
            >
              Close
            </button>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 text-sm">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Navigate</p>
              <div className="grid gap-2">
                <Link href="/" onClick={() => setNavOpen(false)} className="text-black/70">
                  Home
                </Link>
                <Link href="/products" onClick={() => setNavOpen(false)} className="text-black/70">
                  Products
                </Link>
                <Link href="/gallery" onClick={() => setNavOpen(false)} className="text-black/70">
                  Gallery
                </Link>
                <Link href="/help" onClick={() => setNavOpen(false)} className="text-black/70">
                  Help
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Categories</p>
              <div className="grid gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    onClick={() => setNavOpen(false)}
                    className="text-black/60"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </header>
  );
}
