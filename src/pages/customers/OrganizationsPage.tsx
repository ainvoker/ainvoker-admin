import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useOrganizations } from '../../hooks/useCustomers';
import type { OrganizationStatus } from '../../services/AdminCustomersService';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { TextInput } from '../../components/ui/Field';
import { Button } from '../../components/common/Button';
import { AdminPage } from '../../components/layout/AdminPage';
import { formatPersonName, orgStatusLabel, orgStatusTone, subscriptionStatusTone } from './customersBadges';

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function OrganizationsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrganizationStatus | ''>('');
  const [submittedQ, setSubmittedQ] = useState('');

  const filters = useMemo(
    () => ({
      q: submittedQ || undefined,
      status: status || undefined,
      limit: 50,
      offset: 0,
    }),
    [submittedQ, status],
  );

  const orgsQuery = useOrganizations(filters);
  const items = orgsQuery.data?.items ?? [];
  const hasFilters = !!(submittedQ || status);

  return (
    <AdminPage>
      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <form
          className="flex flex-wrap items-center gap-2 border-b border-neutral-200/80 p-3 dark:border-neutral-800"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedQ(search.trim());
          }}
        >
          <div className="relative w-full sm:w-72">
            <HiOutlineMagnifyingGlass
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
            />
            <TextInput
              aria-label="Search organizations"
              placeholder="Name, slug, or owner email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-1.5 pl-8 text-[13px]"
            />
          </div>
          <Select
            aria-label="Filter by status"
            className="w-36"
            value={status}
            onChange={(e) => setStatus((e.target.value || '') as OrganizationStatus | '')}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DELETED">Deleted</option>
          </Select>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-[13px]">
            <thead className="text-xs text-neutral-500 dark:text-neutral-400">
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Workspace
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Owner
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Members
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Plan
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {orgsQuery.isPending &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                    </td>
                  </tr>
                ))}

              {orgsQuery.isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-accent">Couldn&apos;t load organizations</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => void orgsQuery.refetch()}
                    >
                      Try again
                    </Button>
                  </td>
                </tr>
              )}

              {orgsQuery.isSuccess && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-500">
                    {hasFilters ? 'No workspaces match your search.' : 'No organizations yet.'}
                  </td>
                </tr>
              )}

              {items.map((org) => (
                <tr
                  key={org.id}
                  className="text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/organizations/${org.id}`}
                      className="font-medium text-accent underline-offset-2 hover:underline"
                    >
                      {org.name}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[12px] text-neutral-400">{org.slug}</span>
                      {org.isPersonal && <Badge tone="muted">Personal</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {org.owner ? (
                      <Link
                        to={`/users/${org.owner.id}`}
                        className="text-accent underline-offset-2 hover:underline"
                      >
                        {formatPersonName(org.owner)}
                      </Link>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                    {org.owner?.email && (
                      <div className="text-[12px] text-neutral-400">{org.owner.email}</div>
                    )}
                  </td>
                  <td className="px-3 py-3 tabular-nums">{org.memberCount}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone="neutral">{org.planName ?? '—'}</Badge>
                      {org.subscriptionStatus && (
                        <Badge tone={subscriptionStatusTone(org.subscriptionStatus)}>
                          {org.subscriptionStatus}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={orgStatusTone[org.status]}>{orgStatusLabel[org.status]}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-neutral-400">
                    {dateFormat.format(new Date(org.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}
