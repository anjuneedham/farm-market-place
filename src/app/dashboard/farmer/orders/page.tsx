import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { farmerNav } from '@/components/dashboard/FarmerNav';
import { Badge } from '@/components/ui/Badge';
import { Money } from '@/components/ui/Money';
import { EmptyState } from '@/components/ui/States';
import { formatDate, humanise } from '@/lib/utils';
import { OrderStatusControl } from '@/components/dashboard/OrderStatusControl';

export const metadata: Metadata = { title: 'Orders' };
export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'neutral' | 'brand' | 'positive' | 'warning' | 'danger' | 'info'> = {
  REQUESTED: 'info',
  CONFIRMED: 'brand',
  PROCESSING: 'warning',
  READY: 'warning',
  COMPLETED: 'positive',
  CANCELLED: 'neutral',
  DISPUTED: 'danger',
};

export default async function FarmerOrdersPage() {
  const { user } = await requireRole(['FARMER', 'BUSINESS'], '/dashboard/farmer/orders');
  const orders = db.orders.forUser(user.id, 'seller', { perPage: 60 });

  return (
    <DashboardShell title="Orders" nav={farmerNav()} activeHref="/dashboard/farmer/orders">
      {orders.items.length > 0 ? (
        <div className="space-y-3">
          {orders.items.map((order) => (
            <div key={order.id} className="rounded-lg border border-line bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-ink-900">
                    {order.reference} · {order.buyerName}
                  </p>
                  <p className="text-xs text-ink-400">{formatDate(order.createdAt)}</p>
                </div>
                <Badge tone={STATUS_TONE[order.status] ?? 'neutral'}>{humanise(order.status)}</Badge>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-ink-600">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} {item.unit} × {item.titleSnapshot} —{' '}
                    <Money minor={item.lineTotalMinor} currency={order.currency} />
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between">
                <p className="font-semibold">
                  Total <Money minor={order.totalMinor} currency={order.currency} />
                </p>
                <OrderStatusControl orderId={order.id} status={order.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No orders yet." description="Orders you record against your listings will appear here." />
      )}
    </DashboardShell>
  );
}
