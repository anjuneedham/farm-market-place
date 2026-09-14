import type { Region } from '@/lib/types';

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two points, in kilometres. */
export function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Distance in km from `origin` to every region that has coordinates, keyed by
 * region id. Regions without coordinates (none currently, but the type is
 * optional) are simply left out rather than guessed at.
 */
export function distanceIndex(origin: Region, regions: Region[]): Map<string, number> {
  const index = new Map<string, number>();
  if (origin.latitude === undefined || origin.longitude === undefined) return index;

  for (const region of regions) {
    if (region.latitude === undefined || region.longitude === undefined) continue;
    index.set(
      region.id,
      haversineKm(
        { latitude: origin.latitude, longitude: origin.longitude },
        { latitude: region.latitude, longitude: region.longitude },
      ),
    );
  }
  return index;
}

/** Sorts anything with a `regionId` by proximity to `originId` — same parish first, then nearest outward. */
export function sortByRegionProximity<T extends { regionId: string }>(
  items: T[],
  originId: string,
  distances: Map<string, number>,
): T[] {
  const distanceFor = (regionId: string) => (regionId === originId ? 0 : (distances.get(regionId) ?? Infinity));
  return [...items].sort((a, b) => distanceFor(a.regionId) - distanceFor(b.regionId));
}

/** Nearest-first region list, origin first, for a "choose a nearby parish" fallback. */
export function nearestRegions(origin: Region, regions: Region[], limit = 5): Region[] {
  const distances = distanceIndex(origin, regions);
  return regions
    .filter((r) => r.id !== origin.id && distances.has(r.id))
    .sort((a, b) => (distances.get(a.id) ?? Infinity) - (distances.get(b.id) ?? Infinity))
    .slice(0, limit);
}
