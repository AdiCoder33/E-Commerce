-- Phase 7 RLS: site settings

alter table public.site_settings enable row level security;

create policy "Public can read site settings"
  on public.site_settings
  for select
  using (true);

create policy "Admins can insert site settings"
  on public.site_settings
  for insert
  with check (public.is_admin());

create policy "Admins can update site settings"
  on public.site_settings
  for update
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
