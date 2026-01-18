const BUCKET = 'product-images';

export function getPublicImageUrl(pathOrUrl: string) {
  if (!pathOrUrl) {
    return '';
  }
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    return pathOrUrl;
  }

  return `${baseUrl}/storage/v1/object/public/${BUCKET}/${pathOrUrl}`;
}

export function extractStoragePath(pathOrUrl: string) {
  if (!pathOrUrl) {
    return '';
  }
  if (!pathOrUrl.startsWith('http')) {
    return pathOrUrl;
  }

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = pathOrUrl.indexOf(marker);
  if (index === -1) {
    return pathOrUrl;
  }

  return pathOrUrl.slice(index + marker.length);
}
