import { academy } from './academy';
import { catalog } from './catalog';
import { community } from './community';
import { farmUpdates } from './farmUpdates';
import { listings } from './listings';
import { locations } from './locations';
import { premium } from './premium';
import { buyerRequests } from './requests';
import {
  analytics,
  conversations,
  favorites,
  moderation,
  notifications,
  orders,
  reviews,
  shoppingLists,
  verification,
} from './social';
import { profiles, users } from './users';

/**
 * The repository layer — the only place that knows about the data source.
 *
 * Nothing above this layer imports `datasource` directly. Services call these
 * methods; pages and components call services. A page that imports a repository
 * directly, or a component that imports the data source, is a bug
 * (docs/API_ARCHITECTURE.md §1).
 */
export const db = {
  locations,
  users,
  profiles,
  catalog,
  listings,
  farmUpdates,
  buyerRequests,
  orders,
  reviews,
  conversations,
  favorites,
  shoppingLists,
  community,
  academy,
  premium,
  notifications,
  moderation,
  verification,
  analytics,
};

/**
 * The contract a production data source must satisfy. `PrismaDataSource` will
 * implement these same method signatures, one module per repository, so nothing
 * above this layer changes when the store does.
 */
export type Repositories = typeof db;

export { toListingView } from './listings';
export { toRequestView } from './requests';
export { toPublicUser } from './users';
export type { ListingFilters } from './listings';
export type { RequestFilters } from './requests';
