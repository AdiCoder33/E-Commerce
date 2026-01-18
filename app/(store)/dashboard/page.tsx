import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/sign-out-button';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth?redirect=/dashboard');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, role, created_at, updated_at')
    .eq('id', user.id)
    .single();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Dashboard</p>
          <h1 className="font-display text-3xl font-semibold">Your profile</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded-full border border-black/20 px-4 py-2 text-sm"
          >
            Admin area
          </Link>
          <SignOutButton />
        </div>
      </div>

      {error || !profile ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Unable to load your profile. If this is your first login, refresh the
          page after a moment.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
            <h2 className="font-display text-lg font-semibold">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-black/50">Email</dt>
                <dd className="font-medium text-black">{user.email}</dd>
              </div>
              <div>
                <dt className="text-black/50">Name</dt>
                <dd className="font-medium text-black">{profile.name || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-black/50">Role</dt>
                <dd className="font-medium text-black">{profile.role}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
            <h2 className="font-display text-lg font-semibold">Profile metadata</h2>
            <dl className="mt-4 space-y-3 text-sm text-black/70">
              <div>
                <dt className="text-black/50">Created</dt>
                <dd>{new Date(profile.created_at).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-black/50">Updated</dt>
                <dd>{new Date(profile.updated_at).toLocaleString()}</dd>
              </div>
            </dl>
            <p className="mt-6 text-xs text-black/50">
              Roles are protected by Row Level Security. Only admins can update the
              role field.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
