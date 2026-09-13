import { ButtonLink } from '@/components/ui/Button';

export function FinalCta() {
  return (
    <section className="bg-brand-700">
      <div className="mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6">
        <h2 className="text-h1 text-white">Ready to connect, grow and trade?</h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-100">
          Join farmers, buyers and agricultural businesses building Jamaica&apos;s digital
          agricultural ecosystem.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/signup" size="lg" className="bg-white text-brand-800 hover:bg-brand-50">
            Join AgriLoop free
          </ButtonLink>
          <ButtonLink href="/market" variant="secondary" size="lg" className="border-white/30 bg-transparent text-white hover:bg-white/10">
            Explore the market
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
