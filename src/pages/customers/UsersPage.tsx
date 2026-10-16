import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useUsers } from '../../hooks/useCustomers';
import { Badge } from '../../components/ui/Badge';
import { TextInput } from '../../components/ui/Field';
import { TABLE_PAGE_SIZE, TablePagination } from '../../components/ui/TablePagination';
import { Button } from '../../components/common/Button';
import { AdminPage } from '../../components/layout/AdminPage';
import { formatPersonName } from './customersBadges';

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [submittedQ, setSubmittedQ] = useState('');
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setOffset(0);
  }, [submittedQ]);

  const filters = useMemo(
    () => ({
      q: submittedQ || undefined,
      limit: TABLE_PAGE_SIZE,
      offset,
    }),
    [submittedQ, offset],
  );

  const usersQuery = useUsers(filters);
  const items = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.total ?? 0;

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
              aria-label="Search users"
              placeholder="Email or name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-1.5 pl-8 text-[13px]"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="text-xs text-neutral-500 dark:text-neutral-400">
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Person
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Workspaces
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Role
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {usersQuery.isPending &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                    </td>
                  </tr>
                ))}

              {usersQuery.isError && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-accent">Couldn&apos;t load users</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => void usersQuery.refetch()}
                    >
                      Try again
                    </Button>
                  </td>
                </tr>
              )}

              {usersQuery.isSuccess && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-neutral-500">
                    {submittedQ ? 'No people match your search.' : 'No users yet.'}
                  </td>
                </tr>
              )}

              {items.map((user) => (
                <tr
                  key={user.id}
                  className="text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/users/${user.id}`}
                      className="font-medium text-accent underline-offset-2 hover:underline"
                    >
                      {formatPersonName(user)}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400">
                    {user.email ?? '—'}
                  </td>
                  <td className="px-3 py-3 tabular-nums">{user.membershipCount}</td>
                  <td className="px-3 py-3">
                    {user.isPlatformAdmin ? (
                      <Badge tone="warning">Platform admin</Badge>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-neutral-400">
                    {dateFormat.format(new Date(user.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usersQuery.isSuccess && (
          <TablePagination
            total={total}
            limit={TABLE_PAGE_SIZE}
            offset={offset}
            onOffsetChange={setOffset}
            disabled={usersQuery.isFetching}
          />
        )}
      </div>
    </AdminPage>
  );
}
