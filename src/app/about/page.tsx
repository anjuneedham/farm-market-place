import type { Metadata } from 'next';
import { GraduationCap, MessageSquareText, ShoppingBasket, Users } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'About',
  description: 'AgriLoop is the digital layer for Caribbean agriculture — built for Jamaica, architected for the region.',
};

const PILLARS = [
  {
    icon: ShoppingBasket,
    title: 'Marketplace',
    body: 'Farmers and agricultural businesses list what they grow, raise or supply. Buyers browse by category, parish and price — with real listings, not stock photography.',
  },
  {
    icon: MessageSquareText,
    title: 'Buyer Requests',
    body: 'Demand does not have to wait on supply. A buyer posts what they need, and farmers respond directly — useful even with zero listings in a category.',
  },
  {
    icon: Users,
    title: 'Community',
    body: 'Free for everyone, forever. Farmers, buyers and businesses ask questions and share what actually works on Jamaican farms.',
  },
  {
    icon: GraduationCap,
    title: 'Academy',
    body: 'Practical courses on crops, livestock and farm business, written for Jamaican conditions. The core library never sits behind a paywall.',
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-micro text-brand-600">About AgriLoop</p>
      <h1 className="text-h1 mt-3">Connect. Grow. Trade.</h1>
      <p className="mt-4 text-lg text-ink-600">
        AgriLoop is a digital ecosystem for Caribbean agriculture — not just a listings site.
        It launches in Jamaica and is built so that supply, demand, knowledge and trust for the
        region&apos;s food system can live in one place.
      </p>

      <div className="prose-agriloop mt-8 space-y-4 text-ink-700">
        <p>
          A pure marketplace does not work for agriculture in a market this size: a listings site
          alone would show empty categories for months. So AgriLoop is four things working
          together — a marketplace, buyer requests, community and an academy — and the last two
          are useful from the very first day, with or without a single listing.
        </p>
        <p>
          Every verification badge on AgriLoop means a specific thing: an admin reviewed evidence
          and approved it. It is not a government certification, and AgriLoop says so plainly
          wherever a badge appears. Reviews can only be written against a completed order, which
          is what keeps them from being spam. Reporting and blocking are available on every
          profile and listing.
        </p>
        <p>
          What AgriLoop does not do yet, it says so honestly: there is no in-app payment for
          marketplace transactions, no AI assistant, no market-intelligence dashboard. Each has an
          architected interface and an honest &quot;not available yet&quot; state rather than a
          button that pretends to work.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-lg border border-line bg-surface p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-semibold text-ink-900">{title}</h2>
            <p className="mt-1.5 text-sm text-ink-600">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/signup">Join AgriLoop</ButtonLink>
        <ButtonLink href="/guidelines" variant="secondary">
          Read the community guidelines
        </ButtonLink>
      </div>
    </div>
  );
}
