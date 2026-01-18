'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { categorySchema, type CategoryInput } from '@/lib/validators/category';

type ActionResult = {
  ok: boolean;
  error?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const { supabase } = await requireAdmin('/admin/categories');
  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);

  const { error } = await supabase.from('categories').insert({
    name: parsed.data.name,
    slug
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/');

  return { ok: true };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin('/admin/categories');
  const { error } = await supabase.from('categories').delete().eq('id', categoryId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/');

  return { ok: true };
}
