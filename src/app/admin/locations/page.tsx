import type { Metadata } from 'next';
import { COUNTRIES } from '@/lib/location';
import { db } from '@/lib/db/repositories';
import { Badge } from '@/components/ui/Badge';
import { AdminActionButton } from '@/components/admin/ActionButton';
import { setCountryLiveAction } from '../actions';

export const metadata: Metadata = { title: 'Locations — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminLocationsPage() {
  return (
    <div>
      <h1 className="text-h1 mb-1">Locations</h1>
      <p className="mb-6 text-ink-600">
        Jamaica&apos;s 14 parishes are seeded and active. Other Caribbean markets are modelled and can
        be switched live once seed supply and demand exist there.
      </p>

      <div className="divide-y divide-line rounded-lg border border-line bg-surface">
        {COUNTRIES.map((country) => {
          const regionCount = db.locations.regions(country.code).length;
          return (
            <div key={country.code} className="flex items-center justify-between gap-3 px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden>{country.flagEmoji}</span>
                <div>
                  <p className="font-medium text-ink-900">{country.name}</p>
                  <p className="text-xs text-ink-400">
                    {country.currency} · {regionCount} {country.regionLabel.toLowerCase()}{regionCount === 1 ? '' : 's'} configured
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={country.isLive ? 'positive' : 'neutral'}>{country.isLive ? 'Live' : 'Not live'}</Badge>
                {country.isLive ? (
                  <AdminActionButton
                    label="Take offline"
                    variant="danger"
                    confirmMessage={`Take ${country.name} offline? New signups from this market will be blocked.`}
                    action={setCountryLiveAction}
                    args={[country.code, false]}
                  />
                ) : (
                  <AdminActionButton
                    label="Go live"
                    confirmMessage={`Launch ${country.name}? Only do this once seed supply and demand exist there.`}
                    action={setCountryLiveAction}
                    args={[country.code, true]}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
