import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

/**
 * The hero visually communicates FARMER → AGRILOOP → BUYER via the three-node
 * diagram below the headline, per the product brief §5.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(23,143,96,0.35),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(232,163,23,0.18),transparent_40%)]" />
      <div className="relative mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-micro text-brand-300">Jamaica → the Caribbean</p>
        <h1 className="text-display mt-4 max-w-3xl text-white">
          Connect. Grow. Trade.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-brand-100">
          AgriLoop connects Caribbean farmers, buyers and agricultural communities in one
          digital ecosystem.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/market" size="lg" className="bg-white text-brand-800 hover:bg-brand-50">
            Explore the Market
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/community" variant="secondary" size="lg" className="border-white/30 bg-transparent text-white hover:bg-white/10">
            Join the Community
          </ButtonLink>
          <ButtonLink href="/signup?role=FARMER" variant="ghost" size="lg" className="text-brand-100 hover:bg-white/10">
            I&apos;m a Farmer
          </ButtonLink>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <EcosystemNode label="Farmer" detail="Lists produce" />
          <Connector />
          <EcosystemNode label="AgriLoop" detail="Marketplace · Community · Academy" emphasis />
          <Connector />
          <EcosystemNode label="Buyer" detail="Sources supply" />
        </div>
      </div>
    </section>
  );
}

function EcosystemNode({
  label,
  detail,
  emphasis,
}: {
  label: string;
  detail: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-5 py-4 text-center ${
        emphasis ? 'border-sun-400 bg-sun-500/10' : 'border-white/20 bg-white/5'
      }`}
    >
      <p className={`font-semibold ${emphasis ? 'text-sun-300' : 'text-white'}`}>{label}</p>
      <p className="mt-1 text-xs text-brand-200">{detail}</p>
    </div>
  );
}

function Connector() {
  return <div className="hidden h-px w-8 bg-white/20 sm:block" aria-hidden />;
}
