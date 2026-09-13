import { upcomingCountries } from '@/lib/location';

export function ExpansionSection() {
  const upcoming = upcomingCountries().slice(0, 8);

  return (
    <section className="border-y border-line bg-canvas">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <p className="text-micro text-brand-600">Jamaica launch</p>
            <h2 className="text-h1 mt-3">Built for Jamaica, parish by parish</h2>
            <p className="mt-4 text-ink-600">
              All 14 parishes are live from day one — Kingston to Westmoreland, Portland to
              St. Elizabeth. Every listing, farmer profile and buyer request is located down to
              the community level, so distance and logistics are never a guessing game.
            </p>
          </div>
          <div>
            <p className="text-micro text-accent-600">Caribbean expansion vision</p>
            <h2 className="text-h1 mt-3">Architected for the region</h2>
            <p className="mt-4 text-ink-600">
              AgriLoop's location, currency and category architecture works for any Caribbean
              market — no rewrite required. These markets are modelled and ready to switch on as
              AgriLoop grows.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {upcoming.map((country) => (
                <span
                  key={country.code}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-sm text-ink-600"
                >
                  <span aria-hidden>{country.flagEmoji}</span>
                  {country.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
