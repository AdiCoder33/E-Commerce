"use client";

import { useState } from 'react';
import Input from '@/components/ui/input';

export default function TrustBlock() {
  const [pincode, setPincode] = useState('');

  const estimate =
    pincode.trim().length >= 4 ? 'Delivery in 3-5 business days' : 'Enter pincode';

  return (
    <div className="space-y-4 rounded-[var(--radius-lg)] border border-black/10 bg-white/90 p-4 text-sm">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-black/50">Delivery</p>
        <div className="flex gap-2">
          <Input
            value={pincode}
            onChange={(event) => setPincode(event.target.value)}
            placeholder="Pincode"
          />
          <button
            type="button"
            className="rounded-full border border-black/10 px-3 py-2 text-xs"
          >
            Check
          </button>
        </div>
        <p className="text-xs text-black/60">{estimate}</p>
      </div>
      <div className="grid gap-2 text-xs text-black/60">
        <p>Free returns within 7 days.</p>
        <p>Secure payments with trusted providers.</p>
        <p>COD available on eligible orders.</p>
      </div>
    </div>
  );
}
