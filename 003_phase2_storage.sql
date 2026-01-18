-- Phase 2 storage: product images bucket and policies

-- Create bucket (public read)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- storage.objects already has RLS enabled in Supabase

-- Public read for product images
create policy "Public can read product images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'product-images');

-- Admin-only write access
create policy "Admins can upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can update product images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
