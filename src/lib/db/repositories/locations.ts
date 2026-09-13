import { data, mutate } from '../datasource';
import type { Community, Country, Region } from '@/lib/types';

export const locations = {
  countries(): Country[] {
    return [...data().countries].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  liveCountries(): Country[] {
    return this.countries().filter((c) => c.isLive);
  },

  country(code: string): Country | undefined {
    return data().countries.find((c) => c.code === code.toUpperCase());
  },

  regions(countryCode: string): Region[] {
    return data()
      .regions.filter((r) => r.countryCode === countryCode.toUpperCase() && r.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  region(id: string): Region | undefined {
    return data().regions.find((r) => r.id === id);
  },

  regionBySlug(countryCode: string, slug: string): Region | undefined {
    return data().regions.find(
      (r) => r.countryCode === countryCode.toUpperCase() && r.slug === slug,
    );
  },

  communities(regionId: string): Community[] {
    return data()
      .communities.filter((c) => c.regionId === regionId && c.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  community(id: string): Community | undefined {
    return data().communities.find((c) => c.id === id);
  },

  setLive(code: string, isLive: boolean): void {
    mutate((db) => {
      const country = db.countries.find((c) => c.code === code.toUpperCase());
      if (country) country.isLive = isLive;
    });
  },

  /** True when the region belongs to the claimed country. Used for validation. */
  regionBelongsToCountry(regionId: string, countryCode: string): boolean {
    const region = this.region(regionId);
    return Boolean(region && region.countryCode === countryCode.toUpperCase());
  },

  communityBelongsToRegion(communityId: string, regionId: string): boolean {
    const community = this.community(communityId);
    return Boolean(community && community.regionId === regionId);
  },
};
