'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { productSchema, type ProductInput } from '@/lib/validators/product';
import { uploadProductImage, deleteProductImage } from '@/lib/storage/productImages';
import { extractStoragePath } from '@/lib/storage/productImageUrls';

type ActionResult = {
  ok: boolean;
  error?: string;
  productId?: string;
};

function toPaise(value: number) {
  return Math.round(value * 100);
}

function normalizeCategory(value?: string | null) {
  if (!value) {
    return null;
  }
  return value === 'none' ? null : value;
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const { supabase } = await requireAdmin('/admin/products/new');
  const data = parsed.data;

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      title: data.title,
      description: data.description || null,
      price_amount: toPaise(data.priceRupees),
      currency: 'INR',
      stock: data.stock,
      is_active: data.isActive,
      category_id: normalizeCategory(data.categoryId),
      image_urls: []
    })
    .select('id')
    .single();

  if (error || !product) {
    return { ok: false, error: error?.message || 'Unable to create product.' };
  }

  revalidatePath('/admin/products');
  revalidatePath('/');

  return { ok: true, productId: product.id };
}

export async function updateProduct(
  productId: string,
  input: ProductInput
): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const { supabase } = await requireAdmin(`/admin/products/${productId}`);
  const data = parsed.data;

  const { error } = await supabase
    .from('products')
    .update({
      title: data.title,
      description: data.description || null,
      price_amount: toPaise(data.priceRupees),
      stock: data.stock,
      is_active: data.isActive,
      category_id: normalizeCategory(data.categoryId)
    })
    .eq('id', productId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/');
  revalidatePath(`/products/${productId}`);

  return { ok: true, productId };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin('/admin/products');

  const { data: product } = await supabase
    .from('products')
    .select('image_urls')
    .eq('id', productId)
    .single();

  const imageUrls = (product?.image_urls as string[] | null) || [];
  for (const image of imageUrls) {
    try {
      await deleteProductImage(image);
    } catch {
      // Continue even if storage cleanup fails.
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', productId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath('/');

  return { ok: true };
}

export async function toggleProductActive(
  productId: string,
  nextActive: boolean
): Promise<ActionResult> {
  const { supabase } = await requireAdmin('/admin/products');
  const { error } = await supabase
    .from('products')
    .update({ is_active: nextActive })
    .eq('id', productId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath('/');

  return { ok: true };
}

export async function addProductImage(formData: FormData): Promise<ActionResult> {
  const productId = String(formData.get('productId') || '');
  const file = formData.get('file');

  if (!productId || !file || !(file instanceof File)) {
    return { ok: false, error: 'Product image is required.' };
  }

  const { supabase } = await requireAdmin(`/admin/products/${productId}`);

  try {
    const path = await uploadProductImage(productId, file);

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('image_urls')
      .eq('id', productId)
      .single();

    if (fetchError) {
      return { ok: false, error: fetchError.message };
    }

    const images = (product?.image_urls as string[] | null) || [];
    const nextImages = images.concat(path);

    const { error } = await supabase
      .from('products')
      .update({ image_urls: nextImages })
      .eq('id', productId);

    if (error) {
      return { ok: false, error: error.message };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Upload failed.'
    };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/');
  revalidatePath(`/products/${productId}`);

  return { ok: true };
}

export async function removeProductImage(
  productId: string,
  imagePath: string
): Promise<ActionResult> {
  const { supabase } = await requireAdmin(`/admin/products/${productId}`);

  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('image_urls')
    .eq('id', productId)
    .single();

  if (fetchError || !product) {
    return { ok: false, error: fetchError?.message || 'Product not found.' };
  }

  const normalized = extractStoragePath(imagePath);
  const images = (product.image_urls as string[] | null) || [];
  const nextImages = images.filter(
    (item) => extractStoragePath(item) !== normalized
  );

  const { error } = await supabase
    .from('products')
    .update({ image_urls: nextImages })
    .eq('id', productId);

  if (error) {
    return { ok: false, error: error.message };
  }

  try {
    await deleteProductImage(imagePath);
  } catch {
    // Ignore storage cleanup failures.
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/');
  revalidatePath(`/products/${productId}`);

  return { ok: true };
}
