-- Phase 2 RLS and security policies

-- Ensure admin helper exists (reuses profiles table from Phase 1)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

grant execute on function public.is_admin() to authenticated;

-- Enum usage for authenticated roles
grant usage on type public.order_status to authenticated;
grant usage on type public.payment_status to authenticated;

-- Enable RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Categories policies
create policy "Public can read categories"
  on public.categories
  for select
  to public
  using (true);

create policy "Admins can insert categories"
  on public.categories
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update categories"
  on public.categories
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete categories"
  on public.categories
  for delete
  to authenticated
  using (public.is_admin());

-- Products policies
create policy "Public can read active products"
  on public.products
  for select
  to public
  using (is_active = true);

create policy "Admins can read all products"
  on public.products
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert products"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

-- Carts policies
create policy "Users can read own cart"
  on public.carts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create own cart"
  on public.carts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own cart"
  on public.carts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cart"
  on public.carts
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can read all carts"
  on public.carts
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update all carts"
  on public.carts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete all carts"
  on public.carts
  for delete
  to authenticated
  using (public.is_admin());

-- Cart items policies
create policy "Users can read own cart items"
  on public.cart_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.carts
      where public.carts.id = cart_items.cart_id
        and public.carts.user_id = auth.uid()
    )
  );

create policy "Users can insert own cart items"
  on public.cart_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.carts
      where public.carts.id = cart_items.cart_id
        and public.carts.user_id = auth.uid()
    )
  );

create policy "Users can update own cart items"
  on public.cart_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.carts
      where public.carts.id = cart_items.cart_id
        and public.carts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.carts
      where public.carts.id = cart_items.cart_id
        and public.carts.user_id = auth.uid()
    )
  );

create policy "Users can delete own cart items"
  on public.cart_items
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.carts
      where public.carts.id = cart_items.cart_id
        and public.carts.user_id = auth.uid()
    )
  );

create policy "Admins can read all cart items"
  on public.cart_items
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update all cart items"
  on public.cart_items
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete all cart items"
  on public.cart_items
  for delete
  to authenticated
  using (public.is_admin());

-- Orders policies
create policy "Users can read own orders"
  on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create own orders"
  on public.orders
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on public.orders
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can read all orders"
  on public.orders
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update all orders"
  on public.orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete all orders"
  on public.orders
  for delete
  to authenticated
  using (public.is_admin());

-- Order items policies
create policy "Users can read own order items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      where public.orders.id = order_items.order_id
        and public.orders.user_id = auth.uid()
    )
  );

create policy "Users can insert own order items while pending"
  on public.order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.orders
      where public.orders.id = order_items.order_id
        and public.orders.user_id = auth.uid()
        and public.orders.status = 'pending'
    )
  );

create policy "Users can update own order items while pending"
  on public.order_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      where public.orders.id = order_items.order_id
        and public.orders.user_id = auth.uid()
        and public.orders.status = 'pending'
    )
  )
  with check (
    exists (
      select 1
      from public.orders
      where public.orders.id = order_items.order_id
        and public.orders.user_id = auth.uid()
        and public.orders.status = 'pending'
    )
  );

create policy "Users can delete own order items while pending"
  on public.order_items
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      where public.orders.id = order_items.order_id
        and public.orders.user_id = auth.uid()
        and public.orders.status = 'pending'
    )
  );

create policy "Admins can read all order items"
  on public.order_items
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update all order items"
  on public.order_items
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete all order items"
  on public.order_items
  for delete
  to authenticated
  using (public.is_admin());

-- Prevent non-admins from changing order status or payment fields
create or replace function public.prevent_non_admin_order_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if new.status is distinct from old.status then
    raise exception 'Only admins can change order status';
  end if;

  if new.payment_status is distinct from old.payment_status then
    raise exception 'Only admins can change payment status';
  end if;

  if new.user_id is distinct from old.user_id then
    raise exception 'Order owner cannot be changed';
  end if;

  if new.currency is distinct from old.currency then
    raise exception 'Order currency cannot be changed';
  end if;

  if new.total_amount is distinct from old.total_amount then
    if current_setting('app.order_total_bypass', true) <> 'true' then
      raise exception 'Order total is managed by the system';
    end if;
  end if;

  if old.status <> 'pending' and new.shipping_address is distinct from old.shipping_address then
    raise exception 'Shipping address can only be changed while pending';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_non_admin_order_update on public.orders;
create trigger prevent_non_admin_order_update
before update on public.orders
for each row
execute function public.prevent_non_admin_order_update();

-- Grants
grant select on public.categories to anon;
grant select on public.products to anon;

grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.carts to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
