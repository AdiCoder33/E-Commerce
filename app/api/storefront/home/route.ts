import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const revalidate = 120;

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const [{ data: settings }, { data: categories }, { data: newArrivals }, { data: featured }, { data: best }] =
    await Promise.all([
      supabase
        .from('site_settings')
        .select('store_name, tagline, announcement, about_md')
        .single(),
      supabase
        .from('categories')
        .select('id, name, slug')
        .order('name'),
      supabase
        .from('products')
        .select('id, title, price_amount, currency, image_urls, stock, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('products')
        .select('id, title, price_amount, currency, image_urls, stock, created_at')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(8),
      supabase
        .from('products')
        .select('id, title, price_amount, currency, image_urls, stock, created_at')
        .eq('is_active', true)
        .contains('tags', ['best'])
        .limit(8)
    ]);

  return NextResponse.json({
    settings,
    categories: categories || [],
    newArrivals: newArrivals || [],
    featured: featured || [],
    bestSellers: best || []
  });
}
