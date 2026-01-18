import { createServerSupabaseClient } from '@/lib/supabase/server';
import { extractStoragePath } from '@/lib/storage/productImageUrls';

const BUCKET = 'product-images';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxFileSize = 5 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export async function uploadProductImage(productId: string, file: File) {
  if (!allowedMimeTypes.has(file.type)) {
    throw new Error('Unsupported image format. Use JPEG, PNG, or WebP.');
  }

  if (file.size > maxFileSize) {
    throw new Error('Image is too large. Max size is 5MB.');
  }

  const supabase = await createServerSupabaseClient();
  const timestamp = Date.now();
  const fileName = sanitizeFileName(file.name || 'image');
  const path = `products/${productId}/${timestamp}_${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function deleteProductImage(pathOrUrl: string) {
  const supabase = await createServerSupabaseClient();
  const path = extractStoragePath(pathOrUrl);

  if (!path) {
    return;
  }

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    throw new Error(error.message);
  }
}
