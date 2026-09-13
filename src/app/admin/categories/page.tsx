import type { Metadata } from 'next';
import { db } from '@/lib/db/repositories';
import { Badge } from '@/components/ui/Badge';
import { AdminActionButton } from '@/components/admin/ActionButton';
import { setProductStatusAction, toggleCategoryActiveAction } from '../actions';

export const metadata: Metadata = { title: 'Categories — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = db.catalog.categories();
  const topLevel = categories.filter((c) => c.level === 0);
  const pendingProducts = db.catalog.pendingProducts();

  return (
    <div>
      <h1 className="text-h1 mb-6">Categories &amp; catalogue</h1>

      {pendingProducts.length > 0 ? (
        <section className="mb-10">
          <h2 className="text-h2 mb-4">Pending product submissions ({pendingProducts.length})</h2>
          <div className="divide-y divide-line rounded-lg border border-line bg-surface">
            {pendingProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="text-sm font-medium text-ink-900">{product.name}</p>
                <div className="flex gap-2">
                  <AdminActionButton label="Approve" action={setProductStatusAction} args={[product.id, 'ACTIVE']} />
                  <AdminActionButton label="Reject" variant="danger" action={setProductStatusAction} args={[product.id, 'REJECTED']} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-h2 mb-4">Category tree</h2>
        <div className="space-y-4">
          {topLevel.map((parent) => (
            <div key={parent.id} className="rounded-lg border border-line bg-surface">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="font-semibold text-ink-900">{parent.name}</p>
                <Badge tone={parent.isActive ? 'positive' : 'neutral'}>{parent.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div className="divide-y divide-line">
                {categories
                  .filter((c) => c.parentId === parent.id)
                  .map((child) => (
                    <div key={child.id} className="flex items-center justify-between px-4 py-2.5">
                      <p className="text-sm text-ink-700">{child.name}</p>
                      {child.isActive ? (
                        <AdminActionButton label="Deactivate" variant="ghost" action={toggleCategoryActiveAction} args={[child.id, false]} />
                      ) : (
                        <AdminActionButton label="Activate" variant="ghost" action={toggleCategoryActiveAction} args={[child.id, true]} />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
