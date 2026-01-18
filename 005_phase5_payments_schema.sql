-- Phase 5 schema: payments, webhook events, and paid_at on orders

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null,
  provider_order_id text,
  provider_payment_id text,
  provider_signature text,
  status text not null default 'created'
    check (status in ('created', 'authorized', 'captured', 'failed', 'refunded')),
  amount integer not null check (amount >= 0),
  currency text not null default 'INR',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_order_id)
);

create index if not exists payments_order_id_idx on public.payments (order_id);
create index if not exists payments_provider_payment_id_idx on public.payments (provider_payment_id);
create index if not exists payments_status_idx on public.payments (status);

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  order_id uuid references public.orders (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processed', 'ignored', 'failed')),
  error text,
  unique (provider, event_id)
);

create index if not exists payment_events_order_id_idx on public.payment_events (order_id);
create index if not exists payment_events_processing_status_idx on public.payment_events (processing_status);
create index if not exists payment_events_event_type_idx on public.payment_events (event_type);

alter table public.orders
  add column if not exists paid_at timestamptz;

create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_paid_at_idx on public.orders (paid_at);
