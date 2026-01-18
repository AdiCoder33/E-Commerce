-- Phase 5: payment methods and order creation updates

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE public.payment_method AS ENUM (
      'razorpay',
      'payu',
      'stripe',
      'cod'
    );
  END IF;
END $$;

alter table public.orders
  add column if not exists payment_method public.payment_method not null default 'razorpay';

create index if not exists orders_payment_method_idx on public.orders (payment_method);

grant usage on type public.payment_method to authenticated;

-- Update non-admin order update guard to prevent payment method changes
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

  if new.payment_method is distinct from old.payment_method then
    raise exception 'Payment method cannot be changed';
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

drop function if exists public.create_order_from_cart(jsonb, jsonb);

create or replace function public.create_order_from_cart(
  cart_items jsonb,
  shipping jsonb,
  payment_method public.payment_method default 'razorpay'
)
returns table (order_id uuid, total_amount integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid;
  item record;
  product_row record;
  computed_total integer := 0;
  new_order_id uuid;
  shipping_payload jsonb;
begin
  user_id := auth.uid();
  if user_id is null then
    raise exception 'Authentication required';
  end if;

  if cart_items is null or jsonb_typeof(cart_items) <> 'array' or jsonb_array_length(cart_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  if shipping is null then
    shipping_payload := '{}'::jsonb;
  elsif jsonb_typeof(shipping) <> 'object' then
    raise exception 'Invalid shipping payload';
  else
    shipping_payload := shipping;
  end if;

  insert into public.orders (user_id, shipping_address, payment_method)
  values (user_id, shipping_payload, coalesce(payment_method, 'razorpay'::public.payment_method))
  returning id into new_order_id;

  for item in
    select product_id, sum(qty)::int as qty
    from (
      select
        nullif(value->>'productId', '')::uuid as product_id,
        (value->>'qty')::int as qty
      from jsonb_array_elements(cart_items) as value
    ) rows
    group by product_id
  loop
    if item.product_id is null or item.qty is null or item.qty <= 0 then
      raise exception 'Invalid cart item';
    end if;

    select * into product_row
    from public.products
    where id = item.product_id
      and is_active = true
    for update;

    if not found then
      raise exception 'Product not available';
    end if;

    if product_row.stock < item.qty then
      raise exception 'Out of stock for product %', product_row.title;
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      title_snapshot,
      price_snapshot,
      qty
    ) values (
      new_order_id,
      product_row.id,
      product_row.title,
      product_row.price_amount,
      item.qty
    );

    update public.products
    set stock = stock - item.qty
    where id = product_row.id;

    computed_total := computed_total + (product_row.price_amount * item.qty);
  end loop;

  perform set_config('app.order_total_bypass', 'true', true);

  update public.orders
  set total_amount = computed_total
  where id = new_order_id;

  perform set_config('app.order_total_bypass', 'false', true);

  return query
  select new_order_id, computed_total;
end;
$$;

grant execute on function public.create_order_from_cart(jsonb, jsonb, public.payment_method) to authenticated;
