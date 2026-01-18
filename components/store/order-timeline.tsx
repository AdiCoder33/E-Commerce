type OrderTimelineProps = {
  status: string;
};

const steps = [
  { key: 'pending', label: 'Order placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' }
];

export default function OrderTimeline({ status }: OrderTimelineProps) {
  const activeIndex = steps.findIndex((step) => step.key === status);
  const index = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-black/50">Order timeline</p>
      <div className="space-y-3">
        {steps.map((step, stepIndex) => {
          const isActive = stepIndex <= index;
          return (
            <div key={step.key} className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  isActive ? 'bg-ink text-paper' : 'border border-black/10 text-black/40'
                }`}
              >
                {stepIndex + 1}
              </span>
              <span className={isActive ? 'text-black' : 'text-black/50'}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
