import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { CardLink } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { Money } from '@/components/ui/Money';
import { humanise, timeAgo } from '@/lib/utils';
import type { BuyerRequestView } from '@/lib/types';

export function BuyerRequestsPreview({ requests }: { requests: BuyerRequestView[] }) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
      <SectionHeader
        eyebrow="Demand, not just supply"
        title="Buyer requests"
        description="Restaurants, hotels, supermarkets and households post what they need. Farmers respond directly — no waiting for the right listing."
        action={
          <ButtonLink href="/requests" variant="secondary" size="sm">
            View all requests
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        }
      />

      {requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <CardLink key={request.id} href={`/requests/${request.slug}`} className="p-5">
              <p className="text-micro text-accent-600">{humanise(request.frequency)}</p>
              <h3 className="mt-1.5 line-clamp-2 font-semibold text-ink-900">{request.title}</h3>
              <div className="mt-3 flex items-center gap-1 text-sm text-ink-500">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {request.region.name}
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="font-medium text-ink-800">
                  {request.budgetMinor ? (
                    <Money minor={request.budgetMinor} currency={request.currency} />
                  ) : (
                    'Negotiable'
                  )}
                </span>
                <span className="flex items-center gap-1 text-ink-400">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {timeAgo(request.createdAt)}
                </span>
              </div>
            </CardLink>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No requests yet. Check back soon."
          description="When a buyer posts what they need, it shows up here for farmers to answer."
          action={<ButtonLink href="/signup?role=BUYER">Post a Request</ButtonLink>}
        />
      )}
    </section>
  );
}
