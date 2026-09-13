import { MapPin } from 'lucide-react';
import { CardLink } from '@/components/ui/Card';
import { PremiumBadge, VerifiedBadge } from '@/components/ui/Badge';
import { ProduceSwatch } from '@/components/ui/Avatar';
import { Rating } from '@/components/ui/Rating';
import type { FarmProfile } from '@/lib/types';

export function FarmerCard({
  farm,
  regionName,
  communityName,
  isPremium = false,
}: {
  farm: FarmProfile;
  regionName: string;
  communityName?: string;
  isPremium?: boolean;
}) {
  return (
    <CardLink href={`/farmers/${farm.slug}`} className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-brand-100">
        {farm.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={farm.coverImageUrl} alt={farm.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <ProduceSwatch seed={farm.name} className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink-900">{farm.name}</h3>
          {isPremium ? <PremiumBadge /> : null}
        </div>
        {farm.tagline ? <p className="line-clamp-2 text-sm text-ink-600">{farm.tagline}</p> : null}
        <div className="mt-auto space-y-1.5 pt-2">
          <div className="flex items-center gap-1 text-sm text-ink-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              {communityName ? `${communityName}, ` : ''}
              {regionName}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {farm.isVerified ? <VerifiedBadge kind="Farmer" /> : null}
          </div>
          {farm.ratingCount > 0 ? <Rating average={farm.ratingAverage} count={farm.ratingCount} size="sm" /> : null}
          {farm.specialties.length > 0 ? (
            <p className="line-clamp-1 text-xs text-ink-400">{farm.specialties.join(' · ')}</p>
          ) : null}
        </div>
      </div>
    </CardLink>
  );
}
