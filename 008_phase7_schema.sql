-- Phase 7 schema: product metadata and site settings

alter table public.products
  add column if not exists slug text unique,
  add column if not exists is_featured boolean not null default false,
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists attribution jsonb not null default '{}'::jsonb;

create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_is_featured_idx on public.products (is_featured);
create index if not exists products_tags_idx on public.products using gin (tags);

create table if not exists public.site_settings (
  id boolean primary key default true,
  store_name text not null default 'Aaranya Apparel',
  tagline text not null default 'Modern essentials rooted in Indian craft.',
  announcement text not null default 'Free shipping above INR 1999 - COD available - Easy returns',
  about_md text not null default 'Aaranya Apparel curates everyday silhouettes for modern wardrobes, balancing comfort, craft, and timeless palettes.',
  support_email text not null default 'support@aaranya.test',
  support_phone text not null default '+91 90000 00000',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

insert into public.site_settings (id)
values (true)
on conflict (id) do nothing;
