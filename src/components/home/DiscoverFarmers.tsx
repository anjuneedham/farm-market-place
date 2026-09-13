import { ArrowRight } from 'lucide-react';
import { FarmerCard } from '@/components/marketplace/FarmerCard';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Card';
import { db } from '@/lib/db/repositories';
import type { FarmProfile } from '@/lib/types';

export function DiscoverFarmers({ farms }: { farms: FarmProfile[] }) {
  return (
    <section className="border-y border-line bg-canvas">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <SectionHeader
          eyebrow="Discover farmers"
          title="Real farms, real specialties"
          description="Every farmer profile shows what they grow, where they are, and how they're rated."
          action={
            <ButtonLink href="/farmers" variant="secondary" size="sm">
              Browse all farmers
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {farms.map((farm) => {
            const region = db.locations.region(farm.regionId);
            const community = farm.communityId ? db.locations.community(farm.communityId) : undefined;
            return (
              <FarmerCard
                key={farm.id}
                farm={farm}
                regionName={region?.name ?? ''}
                communityName={community?.name}
                isPremium={db.premium.isPremium(farm.userId)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
