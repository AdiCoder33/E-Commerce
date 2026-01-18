"use client";

import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/modal';
import { getPublicImageUrl } from '@/lib/storage/productImageUrls';

type ProductGalleryProps = {
  title: string;
  images: string[];
};

export default function ProductGallery({ title, images }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const safeImages = images.length > 0 ? images : [''];
  const activeImage = safeImages[active] ? getPublicImageUrl(safeImages[active]) : '';

  return (
    <>
      <div className="space-y-4">
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-clay"
          onClick={() => setOpen(true)}
        >
          {activeImage ? (
            <Image src={activeImage} alt={title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-black/50">
              No image
            </div>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-16 w-16 overflow-hidden rounded-[var(--radius-md)] border ${
                active === index ? 'border-black/40' : 'border-black/10'
              }`}
            >
              {image ? (
                <Image
                  src={getPublicImageUrl(image)}
                  alt={`${title} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-black/40">
                  N/A
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} className="max-w-5xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{title}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-black/50"
            >
              Close
            </button>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-lg)] bg-clay">
            {activeImage ? (
              <Image src={activeImage} alt={title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-black/50">
                No image
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
