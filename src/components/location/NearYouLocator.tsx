'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { haversineKm } from '@/lib/location';
import type { Region } from '@/lib/types';

export function NearYouLocator({ regions }: { regions: Region[] }) {
  const router = useRouter();
  const [manual, setManual] = useState('');
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string>();

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setError('Your browser does not support location. Choose your parish below instead.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { latitude, longitude } = position.coords;
        let nearest: Region | undefined;
        let nearestDistance = Infinity;
        for (const region of regions) {
          if (region.latitude === undefined || region.longitude === undefined) continue;
          const distance = haversineKm({ latitude, longitude }, { latitude: region.latitude, longitude: region.longitude });
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = region;
          }
        }
        if (nearest) router.push(`/near-you?region=${nearest.slug}`);
        else setError('Could not match your location to a parish. Choose one below.');
      },
      () => {
        setLocating(false);
        setError('Location access was not granted. Choose your parish below instead.');
      },
      { timeout: 8000 },
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface p-5">
      <Button onClick={useMyLocation} disabled={locating} fullWidth>
        <LocateFixed className="h-4 w-4" aria-hidden />
        {locating ? 'Finding you…' : 'Use my location'}
      </Button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex items-center gap-2 text-xs text-ink-400">
        <span className="h-px flex-1 bg-line" aria-hidden />
        or choose your parish
        <span className="h-px flex-1 bg-line" aria-hidden />
      </div>
      <div className="flex gap-2">
        <Select value={manual} onChange={(e) => setManual(e.target.value)} aria-label="Choose your parish">
          <option value="">Select a parish</option>
          {regions.map((region) => (
            <option key={region.id} value={region.slug}>
              {region.name}
            </option>
          ))}
        </Select>
        <Button variant="secondary" disabled={!manual} onClick={() => router.push(`/near-you?region=${manual}`)}>
          Go
        </Button>
      </div>
    </div>
  );
}
