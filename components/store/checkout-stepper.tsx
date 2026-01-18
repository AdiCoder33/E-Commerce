type StepperProps = {
  current: number;
};

const steps = ['Address', 'Payment', 'Review'];

export default function CheckoutStepper({ current }: StepperProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-black/50">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
              index <= current ? 'bg-ink text-paper' : 'border border-black/15'
            }`}
          >
            {index + 1}
          </span>
          <span className={index === current ? 'text-black' : 'text-black/50'}>
            {step}
          </span>
          {index < steps.length - 1 ? <span className="text-black/20">/</span> : null}
        </div>
      ))}
    </div>
  );
}
