-- Phase 5 RLS: payments + payment_events

alter table public.payments enable row level security;
alter table public.payment_events enable row level security;

create policy "Users can read their payments"
  on public.payments
  for select
  using (
    exists (
      select 1
      from public.orders
      where public.orders.id = public.payments.order_id
        and public.orders.user_id = auth.uid()
    )
  );

create policy "Admins can read all payments"
  on public.payments
  for select
  using (public.is_admin());

create policy "Admins can read payment events"
  on public.payment_events
  for select
  using (public.is_admin());

grant select on public.payments to authenticated;
grant select on public.payment_events to authenticated;
