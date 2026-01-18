import Card from '@/components/ui/card';

export default function ReviewsPlaceholder() {
  return (
    <Card className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Reviews</p>
          <h3 className="font-display text-xl font-semibold">4.6 out of 5</h3>
          <p className="text-sm text-black/60">Based on verified purchases</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-black/10 px-4 py-2 text-xs text-black/40"
          disabled
        >
          Write a review
        </button>
      </div>
      <div className="space-y-2 text-sm">
        {[
          { label: '5 star', value: '68%' },
          { label: '4 star', value: '22%' },
          { label: '3 star', value: '7%' },
          { label: '2 star', value: '2%' },
          { label: '1 star', value: '1%' }
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-14 text-xs text-black/50">{row.label}</span>
            <div className="h-2 flex-1 rounded-full bg-black/5">
              <div
                className="h-2 rounded-full bg-ember"
                style={{ width: row.value }}
              />
            </div>
            <span className="text-xs text-black/50">{row.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
