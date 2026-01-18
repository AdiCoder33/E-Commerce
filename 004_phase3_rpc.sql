-- Phase 3: RPC to create orders from a cart in one transaction

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
