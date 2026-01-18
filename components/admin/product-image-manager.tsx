'use client';

import { useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { addProductImage, removeProductImage } from '@/lib/actions/admin-products';
import { getPublicImageUrl } from '@/lib/storage/productImageUrls';

type ProductImageManagerProps = {
  productId: string;
  images: string[];
};

export default function ProductImageManager({ productId, images }: ProductImageManagerProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    formData.set('productId', productId);

    startTransition(async () => {
      const result = await addProductImage(formData);
      if (!result.ok) {
        setMessage(result.error || 'Upload failed.');
        return;
      }
      setMessage('Image uploaded.');
      event.currentTarget.reset();
      router.refresh();
    });
  };

  const handleRemove = (image: string) => {
    const confirmed = window.confirm('Remove this image?');
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await removeProductImage(productId, image);
      if (!result.ok) {
        setMessage(result.error || 'Removal failed.');
        return;
      }
      setMessage('Image removed.');
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleUpload} className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white/90 p-4">
        <label className="text-sm">
          <span className="text-black/70">Upload image</span>
          <input
            name="file"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="mt-2 block w-full text-sm"
            required
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper disabled:bg-black/40"
        >
          {isPending ? 'Uploading...' : 'Upload image'}
        </button>
        {message ? (
          <p className="text-xs text-amber-700">{message}</p>
        ) : null}
      </form>

      {images.length === 0 ? (
        <p className="text-sm text-black/60">No images uploaded yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image) => (
            <div key={image} className="overflow-hidden rounded-3xl border border-black/10 bg-white/90">
              <div className="aspect-[4/3] w-full bg-clay">
                <img
                  src={getPublicImageUrl(image)}
                  alt="Product"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-xs">
                <span className="truncate text-black/50">{image}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(image)}
                  className="text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
