'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

type Mode = 'sign-in' | 'sign-up';

type AuthFormProps = {
  redirectTo?: string;
};

function normalizeRedirect(value?: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/dashboard';
  }

  return value;
}

export default function AuthForm({ redirectTo }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [supabase] = useState(() => createBrowserSupabaseClient());

  const resolvedRedirect = normalizeRedirect(redirectTo);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    if (mode === 'sign-up' && !name.trim()) {
      setError('Name is required for sign up.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'sign-up') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name.trim()
            }
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.session) {
          router.push(resolvedRedirect);
          router.refresh();
          return;
        }

        setMessage('Check your email to confirm your account before signing in.');
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(resolvedRedirect);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.5)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Access</p>
          <h1 className="font-display text-2xl font-semibold">Your storefront profile</h1>
        </div>
        <div className="flex rounded-full border border-black/10 p-1 text-xs">
          <button
            type="button"
            className={`rounded-full px-3 py-1 ${mode === 'sign-in' ? 'bg-ink text-paper' : 'text-black/60'}`}
            onClick={() => setMode('sign-in')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 ${mode === 'sign-up' ? 'bg-ink text-paper' : 'text-black/60'}`}
            onClick={() => setMode('sign-up')}
          >
            Sign up
          </button>
        </div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {mode === 'sign-up' ? (
          <label className="block text-sm">
            <span className="mb-1 block text-black/70">Name</span>
            <input
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alex Morgan"
            />
          </label>
        ) : null}

        <label className="block text-sm">
          <span className="mb-1 block text-black/70">Email</span>
          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-black/70">Password</span>
          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
            type="password"
            autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            required
          />
        </label>

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</p> : null}

        <button
          type="submit"
          className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-black"
          disabled={loading}
        >
          {loading ? 'Working...' : mode === 'sign-up' ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
