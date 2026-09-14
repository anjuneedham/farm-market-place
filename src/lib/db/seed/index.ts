import { COUNTRIES, jamaicaCommunities, jamaicaRegions } from '@/lib/location';
import { type DataSet, emptyDataSet } from '../dataset';
import { seedAcademy } from './academy';
import { seedActivity } from './activity';
import { seedCategories, seedProducts } from './catalog';
import { seedCommunity } from './community';
import { seedFarmUpdates } from './farmUpdates';
import { seedListings } from './listings';
import { seedPeople } from './people';
import { seedBenefits, seedDiscounts, seedPlans } from './premium';
import { seedBuyerRequests } from './requests';

export { DEMO_PASSWORD } from './people';

/**
 * Reference data that is not demo content: geography and the category tree are
 * real configuration and ship in every environment, production included.
 */
export function buildReferenceDataSet(): DataSet {
  const data = emptyDataSet();
  data.countries = COUNTRIES;
  data.regions = jamaicaRegions();
  data.communities = jamaicaCommunities();
  data.categories = seedCategories();
  data.products = seedProducts();
  data.subscriptionPlans = seedPlans();
  data.premiumBenefits = seedBenefits();
  return data;
}

/**
 * Reference data plus demo content. Every demo record carries isDemoData: true
 * and is badged in the UI, so seeded farms, prices and reviews are never
 * presented as real. See docs/DATABASE_SCHEMA.md § Migration path.
 */
export function buildSeedDataSet(): DataSet {
  const data = buildReferenceDataSet();

  const people = seedPeople();
  data.users = people.users;
  data.farms = people.farms;
  data.businesses = people.businesses;
  data.buyers = people.buyers;

  const { listings, priceTiers } = seedListings();
  data.listings = listings;
  data.priceTiers = priceTiers;
  data.farmUpdates = seedFarmUpdates(data.farms, listings);

  const { buyerRequests, requestResponses } = seedBuyerRequests();
  data.buyerRequests = buyerRequests;
  data.requestResponses = requestResponses;

  const community = seedCommunity();
  data.communityCategories = community.communityCategories;
  data.posts = community.posts;
  data.comments = community.comments;
  data.postLikes = community.postLikes;

  const academy = seedAcademy();
  data.academyTracks = academy.tracks;
  data.academyCourses = academy.courses;
  data.lessons = academy.lessons;

  data.discounts = seedDiscounts();

  const activity = seedActivity();
  data.orders = activity.orders;
  data.orderItems = activity.orderItems;
  data.reviews = activity.reviews;
  data.conversations = activity.conversations;
  data.messages = activity.messages;
  data.favorites = activity.favorites;
  data.shoppingLists = activity.shoppingLists;
  data.shoppingListItems = activity.shoppingListItems;
  data.notifications = activity.notifications;
  data.verifications = activity.verifications;
  data.subscriptions = activity.subscriptions;

  return data;
}
