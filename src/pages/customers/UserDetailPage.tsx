import { Link, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { useUser } from '../../hooks/useCustomers';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/common/Button';
import { AdminPage } from '../../components/layout/AdminPage';
import { formatPersonName, orgStatusLabel, orgStatusTone } from './customersBadges';

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const userQuery = useUser(userId);
  const user = userQuery.data;

  return (
    <AdminPage>
      <div className="mb-3">
        <Link
          to="/users"
          className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 underline-offset-2 hover:text-accent hover:underline dark:text-neutral-400"
        >
          <HiOutlineArrowLeft className="size-3.5" aria-hidden />
          All users
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {userQuery.isPending && (
          <div className="space-y-3 p-5">
            <div className="h-5 w-48 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-4 w-72 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
          </div>
        )}

        {userQuery.isError && (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-accent">Couldn&apos;t load this user</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => void userQuery.refetch()}>
              Try again
            </Button>
          </div>
        )}

        {user && (
          <>
            <div className="border-b border-neutral-200/80 p-5 dark:border-neutral-800">
              <div className="flex flex-wrap items-start gap-4">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt=""
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid size-12 place-content-center rounded-full bg-neutral-100 text-sm font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
                    {(formatPersonName(user)[0] ?? '?').toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight text-accent">
                      {formatPersonName(user)}
                    </h2>
                    {user.isPlatformAdmin && <Badge tone="warning">Platform admin</Badge>}
                  </div>
                  <p className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-400">
                    {user.email ?? 'No email on file'}
                  </p>
                  <p className="mt-1 font-mono text-[12px] text-neutral-400 break-all">{user.id}</p>
                </div>
              </div>

              <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-[12px] text-neutral-400">Joined</dt>
                  <dd className="mt-0.5 text-[13px] text-neutral-600 dark:text-neutral-300">
                    {dateFormat.format(new Date(user.createdAt))}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] text-neutral-400">Free quota</dt>
                  <dd className="mt-0.5 text-[13px] tabular-nums text-accent">
                    {user.freeQuotaUnitsUsed.toLocaleString()} / {user.freeQuotaUnitsLimit.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] text-neutral-400">Theme</dt>
                  <dd className="mt-0.5 text-[13px] text-neutral-600 dark:text-neutral-300">
                    {user.themePreference}
                  </dd>
                </div>
              </dl>
            </div>

            <section>
              <h3 className="px-5 pt-4 text-sm font-semibold text-accent">Workspaces</h3>
              {user.memberships.length === 0 ? (
                <p className="px-5 py-4 text-[13px] text-neutral-500">Not a member of any workspace.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-[13px]">
                    <thead className="text-xs text-neutral-500 dark:text-neutral-400">
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <th className="px-5 py-2 font-medium">Workspace</th>
                        <th className="px-3 py-2 font-medium">Role</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {user.memberships.map((m) => (
                        <tr key={m.id} className="text-neutral-700 dark:text-neutral-200">
                          <td className="px-5 py-2.5">
                            <Link
                              to={`/organizations/${m.organization.id}`}
                              className="font-medium text-accent underline-offset-2 hover:underline"
                            >
                              {m.organization.name}
                            </Link>
                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                              <span className="font-mono text-[12px] text-neutral-400">
                                {m.organization.slug}
                              </span>
                              {m.organization.isPersonal && <Badge tone="muted">Personal</Badge>}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge tone="neutral">{m.role}</Badge>
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge tone={orgStatusTone[m.organization.status]}>
                              {orgStatusLabel[m.organization.status]}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-neutral-400">
                            {dateFormat.format(new Date(m.createdAt))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AdminPage>
  );
}
