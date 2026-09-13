import type { Country } from '@/lib/types';

/**
 * Caribbean market configuration.
 *
 * Adding a market is a row here plus its regions — no application code changes.
 * `regionLabel` is what makes this possible: Jamaica has parishes, Trinidad &
 * Tobago has regional corporations, Guyana has regions. The UI renders whatever
 * the country says, so no component ever contains the word "parish".
 *
 * Only Jamaica is live. Every other market is modelled and switched off.
 */
export const COUNTRIES: Country[] = [
  {
    code: 'JM',
    name: 'Jamaica',
    currency: 'JMD',
    locale: 'en-JM',
    dialCode: '+1876',
    flagEmoji: '🇯🇲',
    regionLabel: 'Parish',
    communityLabel: 'Community',
    isLive: true,
    sortOrder: 0,
  },
  {
    code: 'TT',
    name: 'Trinidad & Tobago',
    currency: 'TTD',
    locale: 'en-TT',
    dialCode: '+1868',
    flagEmoji: '🇹🇹',
    regionLabel: 'Region',
    communityLabel: 'District',
    isLive: false,
    sortOrder: 1,
  },
  {
    code: 'BB',
    name: 'Barbados',
    currency: 'BBD',
    locale: 'en-BB',
    dialCode: '+1246',
    flagEmoji: '🇧🇧',
    regionLabel: 'Parish',
    communityLabel: 'District',
    isLive: false,
    sortOrder: 2,
  },
  {
    code: 'GY',
    name: 'Guyana',
    currency: 'GYD',
    locale: 'en-GY',
    dialCode: '+592',
    flagEmoji: '🇬🇾',
    regionLabel: 'Region',
    communityLabel: 'Village',
    isLive: false,
    sortOrder: 3,
  },
  {
    code: 'GD',
    name: 'Grenada',
    currency: 'XCD',
    locale: 'en-GD',
    dialCode: '+1473',
    flagEmoji: '🇬🇩',
    regionLabel: 'Parish',
    communityLabel: 'Town',
    isLive: false,
    sortOrder: 4,
  },
  {
    code: 'DM',
    name: 'Dominica',
    currency: 'XCD',
    locale: 'en-DM',
    dialCode: '+1767',
    flagEmoji: '🇩🇲',
    regionLabel: 'Parish',
    communityLabel: 'Village',
    isLive: false,
    sortOrder: 5,
  },
  {
    code: 'LC',
    name: 'Saint Lucia',
    currency: 'XCD',
    locale: 'en-LC',
    dialCode: '+1758',
    flagEmoji: '🇱🇨',
    regionLabel: 'District',
    communityLabel: 'Community',
    isLive: false,
    sortOrder: 6,
  },
  {
    code: 'VC',
    name: 'St. Vincent & the Grenadines',
    currency: 'XCD',
    locale: 'en-VC',
    dialCode: '+1784',
    flagEmoji: '🇻🇨',
    regionLabel: 'Parish',
    communityLabel: 'Community',
    isLive: false,
    sortOrder: 7,
  },
  {
    code: 'AG',
    name: 'Antigua & Barbuda',
    currency: 'XCD',
    locale: 'en-AG',
    dialCode: '+1268',
    flagEmoji: '🇦🇬',
    regionLabel: 'Parish',
    communityLabel: 'Community',
    isLive: false,
    sortOrder: 8,
  },
  {
    code: 'KN',
    name: 'St. Kitts & Nevis',
    currency: 'XCD',
    locale: 'en-KN',
    dialCode: '+1869',
    flagEmoji: '🇰🇳',
    regionLabel: 'Parish',
    communityLabel: 'Community',
    isLive: false,
    sortOrder: 9,
  },
  {
    code: 'BS',
    name: 'Bahamas',
    currency: 'BSD',
    locale: 'en-BS',
    dialCode: '+1242',
    flagEmoji: '🇧🇸',
    regionLabel: 'Island',
    communityLabel: 'Settlement',
    isLive: false,
    sortOrder: 10,
  },
  {
    code: 'HT',
    name: 'Haiti',
    currency: 'HTG',
    locale: 'fr-HT',
    dialCode: '+509',
    flagEmoji: '🇭🇹',
    regionLabel: 'Department',
    communityLabel: 'Commune',
    isLive: false,
    sortOrder: 11,
  },
  {
    code: 'DO',
    name: 'Dominican Republic',
    currency: 'DOP',
    locale: 'es-DO',
    dialCode: '+1809',
    flagEmoji: '🇩🇴',
    regionLabel: 'Province',
    communityLabel: 'Municipality',
    isLive: false,
    sortOrder: 12,
  },
];

export const DEFAULT_COUNTRY_CODE =
  process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toUpperCase() ?? 'JM';

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}

export function getDefaultCountry(): Country {
  const country = getCountry(DEFAULT_COUNTRY_CODE) ?? COUNTRIES[0];
  if (!country) throw new Error('No countries configured');
  return country;
}

export function liveCountries(): Country[] {
  return COUNTRIES.filter((c) => c.isLive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function upcomingCountries(): Country[] {
  return COUNTRIES.filter((c) => !c.isLive).sort((a, b) => a.sortOrder - b.sortOrder);
}
