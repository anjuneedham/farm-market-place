import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'How trust, verification, reviews and moderation work on AgriLoop.',
};

const SECTIONS = [
  {
    title: 'Be who you say you are',
    body: 'List real products, real prices and real availability. AgriLoop does not tolerate fake listings, fake farms or fake reviews, and seeded demonstration content is always labelled as such — never presented as a real user.',
  },
  {
    title: 'What a Verified badge means',
    body: 'A Verified Farmer, Business or Buyer badge means an AgriLoop administrator reviewed evidence submitted for that account and approved it. It is a platform trust signal, not a government certification, and it can be revoked if evidence turns out to be false.',
  },
  {
    title: 'Reviews are earned, not given',
    body: 'You can only review a farmer, buyer or business after a completed order between you. This is deliberate — it is what keeps reviews from being spam, favours or retaliation, and it is enforced by the platform, not by convention.',
  },
  {
    title: 'Payment happens off-platform',
    body: 'AgriLoop does not process payment for marketplace transactions between a buyer and a seller. Agree on price, quantity and delivery through messages, then arrange payment directly. The one exception is AgriLoop Premium, which is billed through AgriLoop.',
  },
  {
    title: 'Report what is wrong',
    body: 'Every listing, profile, post and review has a Report action. Reports go to an administrator queue and are reviewed — not automatically actioned, and not ignored.',
  },
  {
    title: 'Block anyone you do not want contacting you',
    body: 'Blocking is mutual: once you block someone, neither of you can message the other, respond to each other\'s buyer requests, or see each other\'s contact details through AgriLoop.',
  },
  {
    title: 'Community stays useful',
    body: 'AgriLoop Community is for real questions, real answers and real experience — not for reposting listings as advertisements. A post may reference a specific listing, farm, business or buyer request when it is genuinely relevant to the discussion.',
  },
  {
    title: 'Respect, always',
    body: 'Harassment, discrimination, threats and deliberately misleading agronomic advice are not welcome here. Disagreement is fine; disrespect is not.',
  },
];

export default function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-micro text-brand-600">Community Guidelines</p>
      <h1 className="text-h1 mt-3">How trust works on AgriLoop</h1>
      <p className="mt-4 text-ink-600">
        AgriLoop connects strangers who are about to do business, often for real money and real
        produce. These guidelines describe what AgriLoop actually enforces in the product, not
        just what it asks of you.
      </p>

      <div className="mt-8 space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-h3 font-semibold text-ink-900">{section.title}</h2>
            <p className="mt-1.5 text-ink-700">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-ink-500">
        Guidelines change as the platform grows. If you believe someone has broken them, use the
        Report action where you saw the issue — that is what actually reaches AgriLoop&apos;s
        moderation queue.
      </p>
    </div>
  );
}
