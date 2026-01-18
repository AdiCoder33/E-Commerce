'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [supabase] = useState(() => createBrowserSupabaseClient());

  const onSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={onSignOut}
      className="rounded-full border border-black/20 px-4 py-2 text-sm hover:border-black/40"
      disabled={loading}
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
