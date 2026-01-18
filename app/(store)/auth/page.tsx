import Link from 'next/link';
import AuthForm from '@/components/auth-form';

type AuthPageProps = {
  searchParams?: Promise<{
    redirect?: string;
    next?: string;
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const redirectTo = params?.next ?? params?.redirect ?? '/dashboard';

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between text-sm">
        <Link href="/" className="text-black/60 hover:text-black">
          Back to home
        </Link>
        <span className="rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-black/50">
          Secure access
        </span>
      </div>
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-4">
          <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
          <p className="text-black/70">
            Sign in or create your account to access the dashboard and personalize
            your profile.
          </p>
        </div>
        <AuthForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
