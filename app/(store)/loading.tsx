import Skeleton from '@/components/ui/skeleton';

export default function StoreLoading() {
  return (
    <main className="container py-10">
      <div className="space-y-6">
        <Skeleton className="h-8 w-2/3" />
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/6" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3 rounded-[var(--radius-lg)] border border-black/10 bg-white/90 p-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
