import type { Metadata } from 'next';
import { db } from '@/lib/db/repositories';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, humanise } from '@/lib/utils';
import { AdminActionButton } from '@/components/admin/ActionButton';
import { setUserStatusAction } from '../actions';
import type { UserRole } from '@/lib/types';

export const metadata: Metadata = { title: 'Users — Admin' };
export const dynamic = 'force-dynamic';

const ROLE_TONE: Record<UserRole, 'brand' | 'info' | 'premium' | 'neutral'> = {
  FARMER: 'brand',
  BUYER: 'info',
  BUSINESS: 'neutral',
  ADMIN: 'premium',
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string; status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const results = db.users.list({
    role: params.role as UserRole | undefined,
    status: params.status as never,
    search: params.q,
    page: params.page ? Number(params.page) : 1,
  });
  const totalPages = Math.max(1, Math.ceil(results.total / results.perPage));

  return (
    <div>
      <h1 className="text-h1 mb-6">Users ({results.total})</h1>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-canvas text-left text-ink-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Joined</th>
              <th className="px-4 py-2.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.items.map((user) => (
              <tr key={user.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name} size={28} />
                    <div>
                      <p className="font-medium text-ink-900">{user.name}</p>
                      <p className="text-xs text-ink-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={ROLE_TONE[user.role]}>{humanise(user.role)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={user.status === 'ACTIVE' ? 'positive' : 'danger'}>{humanise(user.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-ink-500">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  {user.role !== 'ADMIN' ? (
                    user.status === 'ACTIVE' ? (
                      <AdminActionButton
                        label="Suspend"
                        variant="danger"
                        confirmMessage={`Suspend ${user.name}? They will be signed out immediately.`}
                        action={setUserStatusAction}
                        args={[user.id, 'SUSPENDED']}
                      />
                    ) : (
                      <AdminActionButton
                        label="Reinstate"
                        action={setUserStatusAction}
                        args={[user.id, 'ACTIVE']}
                      />
                    )
                  ) : (
                    <span className="text-xs text-ink-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={results.page} totalPages={totalPages} basePath="/admin/users" params={params} />
    </div>
  );
}
