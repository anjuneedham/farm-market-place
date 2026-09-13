import { db } from '@/lib/db/repositories';
import { getDefaultCountry } from '@/lib/location';
import { Hero } from '@/components/home/Hero';
import { WhatIsAgriLoop } from '@/components/home/WhatIsAgriLoop';
import { MarketplacePreview } from '@/components/home/MarketplacePreview';
import { DiscoverFarmers } from '@/components/home/DiscoverFarmers';
import { BuyerRequestsPreview } from '@/components/home/BuyerRequestsPreview';
import { CommunityPreview } from '@/components/home/CommunityPreview';
import { AcademyPreview } from '@/components/home/AcademyPreview';
import { PremiumPreview } from '@/components/home/PremiumPreview';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ExpansionSection } from '@/components/home/ExpansionSection';
import { FinalCta } from '@/components/home/FinalCta';

export const revalidate = 60;

export default async function HomePage() {
  const country = getDefaultCountry();

  const listings = db.listings.recent(country.code, 8);
  const farms = db.profiles.listFarms({ countryCode: country.code, verifiedOnly: true, perPage: 4 }).items;
  const requests = db.buyerRequests.search({ countryCode: country.code, perPage: 3 }).items;
  const posts = db.community.posts({ perPage: 3 }).items;
  const courses = db.academy.courses().slice(0, 3);

  return (
    <>
      <Hero />
      <WhatIsAgriLoop />
      <MarketplacePreview listings={listings} />
      <DiscoverFarmers farms={farms} />
      <BuyerRequestsPreview requests={requests} />
      <CommunityPreview posts={posts} />
      <AcademyPreview courses={courses} />
      <PremiumPreview />
      <HowItWorks />
      <ExpansionSection />
      <FinalCta />
    </>
  );
}
