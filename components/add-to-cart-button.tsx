'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart/useCart';
import Button from '@/components/ui/button';
import { useStoreUI } from '@/components/layout/store-provider';

type AddToCartButtonProps = {
  productId: string;
  disabled?: boolean;
};

export default function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { pushToast, openCart } = useStoreUI();
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    addItem(productId, 1);
    setJustAdded(true);
    pushToast({
      title: 'Added to cart',
      message: 'Item added to your cart.',
      tone: 'success'
    });
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="flex items-center gap-2">
      <Button type="button" onClick={handleAdd} size="sm" disabled={disabled}>
        {justAdded ? 'Added' : 'Add to cart'}
      </Button>
      <button
        type="button"
        onClick={openCart}
        className="text-xs text-black/50 hover:text-black"
      >
        View
      </button>
    </div>
  );
}
