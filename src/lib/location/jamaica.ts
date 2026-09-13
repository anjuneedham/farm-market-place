import type { Community, Region } from '@/lib/types';

type RegionSeed = {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  communities: string[];
};

/**
 * All 14 Jamaican parishes with representative agricultural communities.
 *
 * Coordinates are approximate parish centroids, used as the map fallback when a
 * farm has not published precise coordinates (docs/SECURITY.md §9).
 */
const PARISHES: RegionSeed[] = [
  {
    slug: 'kingston',
    name: 'Kingston',
    latitude: 17.9771,
    longitude: -76.7674,
    communities: ['Downtown Kingston', 'Allman Town', 'Rae Town', 'Fletchers Land'],
  },
  {
    slug: 'st-andrew',
    name: 'St. Andrew',
    latitude: 18.0431,
    longitude: -76.7899,
    communities: ['Half Way Tree', 'Papine', 'Gordon Town', 'Mavis Bank', 'Red Hills', 'Constant Spring'],
  },
  {
    slug: 'st-thomas',
    name: 'St. Thomas',
    latitude: 17.9,
    longitude: -76.35,
    communities: ['Morant Bay', 'Yallahs', 'Golden Grove', 'Seaforth', 'Bath'],
  },
  {
    slug: 'portland',
    name: 'Portland',
    latitude: 18.1745,
    longitude: -76.4498,
    communities: ['Port Antonio', 'Buff Bay', 'Hope Bay', 'Manchioneal', 'Fellowship'],
  },
  {
    slug: 'st-mary',
    name: 'St. Mary',
    latitude: 18.3,
    longitude: -76.9,
    communities: ['Port Maria', 'Highgate', 'Annotto Bay', 'Richmond', 'Gayle'],
  },
  {
    slug: 'st-ann',
    name: 'St. Ann',
    latitude: 18.4333,
    longitude: -77.2,
    communities: ["Ocho Rios", "St. Ann's Bay", 'Brown’s Town', 'Claremont', 'Moneague', 'Alexandria'],
  },
  {
    slug: 'trelawny',
    name: 'Trelawny',
    latitude: 18.35,
    longitude: -77.65,
    communities: ['Falmouth', 'Clarks Town', 'Duncans', 'Albert Town', 'Wakefield'],
  },
  {
    slug: 'st-james',
    name: 'St. James',
    latitude: 18.4667,
    longitude: -77.9167,
    communities: ['Montego Bay', 'Cambridge', 'Adelphi', 'Anchovy', 'Somerton'],
  },
  {
    slug: 'hanover',
    name: 'Hanover',
    latitude: 18.4,
    longitude: -78.1333,
    communities: ['Lucea', 'Green Island', 'Sandy Bay', 'Ramble', 'Cascade'],
  },
  {
    slug: 'westmoreland',
    name: 'Westmoreland',
    latitude: 18.2167,
    longitude: -78.1333,
    communities: ['Savanna-la-Mar', 'Negril', 'Grange Hill', 'Darliston', 'Little London'],
  },
  {
    slug: 'st-elizabeth',
    name: 'St. Elizabeth',
    latitude: 18.05,
    longitude: -77.75,
    communities: ['Black River', 'Santa Cruz', 'Junction', 'Malvern', 'Nain', 'Bull Savannah', 'Southfield'],
  },
  {
    slug: 'manchester',
    name: 'Manchester',
    latitude: 18.0417,
    longitude: -77.5069,
    communities: ['Mandeville', 'Christiana', 'Porus', 'Spaldings', 'Newport', 'Williamsfield'],
  },
  {
    slug: 'clarendon',
    name: 'Clarendon',
    latitude: 17.9667,
    longitude: -77.2333,
    communities: ['May Pen', 'Chapelton', 'Frankfield', 'Lionel Town', 'Rock River', 'Mocho'],
  },
  {
    slug: 'st-catherine',
    name: 'St. Catherine',
    latitude: 18.0,
    longitude: -77.0,
    communities: ['Spanish Town', 'Portmore', 'Old Harbour', 'Linstead', 'Bog Walk', 'Ewarton'],
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[‘’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function jamaicaRegions(): Region[] {
  return PARISHES.map((parish, index) => ({
    id: `region_jm_${parish.slug}`,
    countryCode: 'JM',
    name: parish.name,
    slug: parish.slug,
    latitude: parish.latitude,
    longitude: parish.longitude,
    sortOrder: index,
    isActive: true,
  }));
}

export function jamaicaCommunities(): Community[] {
  return PARISHES.flatMap((parish) =>
    parish.communities.map((name) => ({
      id: `community_jm_${parish.slug}_${slugify(name)}`,
      regionId: `region_jm_${parish.slug}`,
      name,
      slug: slugify(name),
      isActive: true,
    })),
  );
}
