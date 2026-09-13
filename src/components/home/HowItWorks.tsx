const STEPS = [
  { title: 'Learn', body: 'Free Academy courses build the foundation, whether you are starting out or scaling up.' },
  { title: 'Connect', body: 'Create a farm, buyer or business profile and find the people you need to trade with.' },
  { title: 'Buy / Sell', body: 'List products or post what you need. Message directly, negotiate, and agree terms.' },
  { title: 'Build Trust', body: 'Complete transactions, leave reviews, and earn verification badges.' },
  { title: 'Grow', body: 'Use dashboards, analytics and Premium tools to grow sales and find new buyers.' },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-micro text-brand-600">How it works</p>
        <h2 className="text-h1 mt-3">The AgriLoop cycle</h2>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-5">
        {STEPS.map((step, index) => (
          <div key={step.title} className="relative rounded-lg border border-line bg-surface p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {index + 1}
            </span>
            <h3 className="mt-3 font-semibold text-ink-900">{step.title}</h3>
            <p className="mt-1.5 text-sm text-ink-600">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
