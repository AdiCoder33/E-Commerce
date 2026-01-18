import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [], categories: [] });
  }

  const supabase = await createServerSupabaseClient();

  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, title, image_urls')
      .eq('is_active', true)
      .ilike('title', `%${query}%`)
      .limit(6),
    supabase
      .from('categories')
      .select('id, name, slug')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(5)
  ]);

  return NextResponse.json({
    products: productsResult.data || [],
    categories: categoriesResult.data || []
  });
}
