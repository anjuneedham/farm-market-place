import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { premiumService } from '@/lib/services/premium';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { buyerNav } from '@/components/dashboard/BuyerNav';
import { EmptyState } from '@/components/ui/States';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import { NewListForm } from './NewListForm';
import { ShoppingListCard } from './ShoppingListCard';

export const metadata: Metadata = { title: 'Shopping Lists' };
export const dynamic = 'force-dynamic';

export default async function ShoppingListsPage() {
  const { user } = await requireRole('BUYER', '/dashboard/buyer/lists');
  const lists = db.shoppingLists.forUser(user.id);
  const canCreateMore = premiumService.canCreateShoppingList(user);

  return (
    <DashboardShell title="Shopping Lists" nav={buyerNav()} activeHref="/dashboard/buyer/lists">
      <p className="mb-6 text-ink-600">
        Reusable lists for recurring orders — build one for your weekly restaurant supply or
        household shop.
      </p>

      {lists.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {lists.map((list) => (
            <ShoppingListCard key={list.id} list={list} />
          ))}
        </div>
      ) : (
        <EmptyState title="No shopping lists yet." description="Create your first list below." />
      )}

      <div className="mt-8 max-w-sm">
        {canCreateMore ? (
          <NewListForm />
        ) : (
          <UpgradePrompt
            title="You've reached the free plan's list limit"
            description="Free accounts get one shopping list. Upgrade to Premium for unlimited lists."
          />
        )}
      </div>
    </DashboardShell>
  );
}
