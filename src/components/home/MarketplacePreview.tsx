import { ArrowRight } from 'lucide-react';
import { ListingCardGrid } from '@/components/marketplace/ListingCard';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import type { ListingView } from '@/lib/types';

export function MarketplacePreview({ listings }: { listings: ListingView[] }) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
      <SectionHeader
        eyebrow="Explore the marketplace"
        title="Fresh from farms across Jamaica"
        description="Vegetables, livestock, farm products, supplies, equipment and services — priced fairly, sold directly."
        action={
          <ButtonLink href="/market" variant="secondary" size="sm">
            View all listings
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        }
      />
      {listings.length > 0 ? (
        <ListingCardGrid listings={listings} />
      ) : (
        <EmptyState
          title="Be one of the first farmers in this category."
          description="Listings you publish appear here for every buyer to see."
          action={<ButtonLink href="/signup?role=FARMER">List Your Product</ButtonLink>}
        />
      )}
    </section>
  );
}
