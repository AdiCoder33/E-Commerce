-- Phase 2 schema: core ecommerce tables and constraints

create extension if not exists "pgcrypto";

-- Enum types for orders
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM (
      'pending',
      'confirmed',
      'packed',
      'shipped',
      'delivered',
      'cancelled'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM (
      'unpaid',
      'paid',
      'failed',
      'refunded'
    );
  END IF;
END $$;

-- Shared updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price_amount integer not null check (price_amount >= 0),
  currency text not null default 'INR',
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  category_id uuid references public.categories (id) on delete set null,
  image_urls text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_is_active_idx on public.products (is_active);
create index if not exists products_category_id_idx on public.products (category_id);

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

-- Carts
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create trigger set_carts_updated_at
before update on public.carts
for each row
execute function public.set_updated_at();

-- Cart items
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id uuid not null references public.products (id),
  qty integer not null check (qty > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create trigger set_cart_items_updated_at
before update on public.cart_items
for each row
execute function public.set_updated_at();

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  total_amount integer not null default 0 check (total_amount >= 0),
  currency text not null default 'INR',
  shipping_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at);

create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  title_snapshot text not null,
  price_snapshot integer not null check (price_snapshot >= 0),
  qty integer not null check (qty > 0),
  line_total integer generated always as (qty * price_snapshot) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

create trigger set_order_items_updated_at
before update on public.order_items
for each row
execute function public.set_updated_at();

-- Keep order totals in sync with order items
create or replace function public.recalculate_order_total(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_order_id is null then
    return;
  end if;

  perform set_config('app.order_total_bypass', 'true', true);

  update public.orders
  set total_amount = coalesce(
    (
      select sum(qty * price_snapshot)::int
      from public.order_items
      where order_id = target_order_id
    ),
    0
  )
  where id = target_order_id;

  perform set_config('app.order_total_bypass', 'false', true);
end;
$$;

create or replace function public.on_order_item_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'DELETE') then
    perform public.recalculate_order_total(old.order_id);
    return null;
  end if;

  perform public.recalculate_order_total(new.order_id);

  if (tg_op = 'UPDATE' and new.order_id is distinct from old.order_id) then
    perform public.recalculate_order_total(old.order_id);
  end if;

  return null;
end;
$$;

create trigger order_items_after_change
after insert or update or delete on public.order_items
for each row
execute function public.on_order_item_change();
