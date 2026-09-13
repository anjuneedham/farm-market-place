import { GraduationCap, MessageSquareText, ShoppingBasket, Users } from 'lucide-react';

const PILLARS = [
  {
    icon: ShoppingBasket,
    title: 'Marketplace',
    body: 'Buy and sell fresh produce, livestock, farm products, supplies, equipment and services — with real pricing, wholesale tiers and verified sellers.',
  },
  {
    icon: MessageSquareText,
    title: 'Buyer Requests',
    body: 'Buyers post what they need instead of waiting for the right listing. Farmers respond directly — demand-driven, not supply-and-hope.',
  },
  {
    icon: Users,
    title: 'Community',
    body: 'Ask questions, share what works, and find your parish\'s farmers, buyers and businesses. Free for everyone, always.',
  },
  {
    icon: GraduationCap,
    title: 'Academy',
    body: 'Practical courses on crops, livestock and farm business — written for Jamaican conditions, free at the core.',
  },
];

export function WhatIsAgriLoop() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-micro text-brand-600">What is AgriLoop?</p>
        <h2 className="text-h1 mx-auto mt-3 max-w-2xl">
          More than a marketplace — the digital layer for Caribbean agriculture
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-ink-600">
          Farmers use AgriLoop to find buyers, learn, and grow. Buyers use it to source supply,
          compare farmers, and save. Every part of the platform points back to the next useful
          step.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-lg border border-line bg-surface p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 font-semibold text-ink-900">{title}</h3>
            <p className="mt-1.5 text-sm text-ink-600">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
