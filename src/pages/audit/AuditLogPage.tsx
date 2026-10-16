import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useAuditEvents } from '../../hooks/useAudit';
import {
  AUDIT_ACTION_OPTIONS,
  type AuditAction,
  type AuditActorType,
} from '../../services/AdminAuditService';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { TextInput } from '../../components/ui/Field';
import { TABLE_PAGE_SIZE, TablePagination } from '../../components/ui/TablePagination';
import { Button } from '../../components/common/Button';
import { AdminPage } from '../../components/layout/AdminPage';

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function formatPersonName(actor: {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}) {
  const name = [actor.firstName, actor.lastName].filter(Boolean).join(' ').trim();
  return name || actor.email || 'Unknown';
}

function actionLabel(action: string) {
  return AUDIT_ACTION_OPTIONS.find((opt) => opt.value === action)?.label ?? action;
}

function actorTypeTone(actorType: AuditActorType): 'warning' | 'muted' {
  return actorType === 'PLATFORM_ADMIN' ? 'warning' : 'muted';
}

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [submittedQ, setSubmittedQ] = useState('');
  const [action, setAction] = useState<AuditAction | ''>('');
  const [actorType, setActorType] = useState<AuditActorType | ''>('');
  const [offset, setOffset] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setOffset(0);
  }, [submittedQ, action, actorType]);

  const filters = useMemo(
    () => ({
      q: submittedQ || undefined,
      action: action || undefined,
      actorType: actorType || undefined,
      limit: TABLE_PAGE_SIZE,
      offset,
    }),
    [submittedQ, action, actorType, offset],
  );

  const eventsQuery = useAuditEvents(filters);
  const items = eventsQuery.data?.items ?? [];
  const total = eventsQuery.data?.total ?? 0;
  const hasFilters = !!(submittedQ || action || actorType);

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
              aria-label="Search audit events"
              placeholder="Summary, actor email, or target id"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-1.5 pl-8 text-[13px]"
            />
          </div>
          <Select
            aria-label="Filter by action"
            className="w-48"
            value={action}
            onChange={(e) => {
              setAction((e.target.value || '') as AuditAction | '');
              setOffset(0);
            }}
          >
            <option value="">All actions</option>
            {AUDIT_ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by actor type"
            className="w-40"
            value={actorType}
            onChange={(e) => {
              setActorType((e.target.value || '') as AuditActorType | '');
              setOffset(0);
            }}
          >
            <option value="">All actors</option>
            <option value="PLATFORM_ADMIN">Platform admin</option>
            <option value="USER">User</option>
          </Select>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-[13px]">
            <thead className="text-xs text-neutral-500 dark:text-neutral-400">
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  When
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Actor
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Action
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Target
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {eventsQuery.isPending &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                    </td>
                  </tr>
                ))}

              {eventsQuery.isError && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-accent">Couldn&apos;t load audit events</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => void eventsQuery.refetch()}
                    >
                      Try again
                    </Button>
                  </td>
                </tr>
              )}

              {eventsQuery.isSuccess && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-neutral-500">
                    {hasFilters ? 'No events match your filters.' : 'No audit events yet.'}
                  </td>
                </tr>
              )}

              {items.map((event) => {
                const expanded = expandedId === event.id;
                return (
                  <tr
                    key={event.id}
                    className="text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-top text-neutral-400">
                      {dateFormat.format(new Date(event.createdAt))}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone={actorTypeTone(event.actorType)}>
                          {event.actorType === 'PLATFORM_ADMIN' ? 'Admin' : 'User'}
                        </Badge>
                      </div>
                      {event.actor ? (
                        <Link
                          to={`/users/${event.actor.id}`}
                          className="mt-1 block text-accent underline-offset-2 hover:underline"
                        >
                          {formatPersonName(event.actor)}
                        </Link>
                      ) : (
                        <div className="mt-1 text-neutral-400">—</div>
                      )}
                      {event.actor?.email && (
                        <div className="text-[12px] text-neutral-400">{event.actor.email}</div>
                      )}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <Badge tone="neutral">{actionLabel(event.action)}</Badge>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="text-[12px] uppercase tracking-wide text-neutral-400">
                        {event.targetType}
                      </div>
                      {event.organizationId ? (
                        <Link
                          to={`/organizations/${event.organizationId}`}
                          className="font-mono text-[12px] text-accent underline-offset-2 hover:underline"
                        >
                          {event.targetId ?? event.organizationId}
                        </Link>
                      ) : event.targetId ? (
                        <span className="font-mono text-[12px] text-neutral-500">{event.targetId}</span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p>{event.summary}</p>
                      {event.metadata != null && (
                        <button
                          type="button"
                          className="mt-1 text-[12px] text-neutral-400 underline-offset-2 hover:text-accent hover:underline"
                          onClick={() => setExpandedId(expanded ? null : event.id)}
                        >
                          {expanded ? 'Hide details' : 'Show details'}
                        </button>
                      )}
                      {expanded && event.metadata != null && (
                        <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-neutral-50 p-2 text-[11px] text-neutral-600 dark:bg-neutral-950 dark:text-neutral-300">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {eventsQuery.isSuccess && (
          <TablePagination
            total={total}
            limit={TABLE_PAGE_SIZE}
            offset={offset}
            onOffsetChange={setOffset}
            disabled={eventsQuery.isFetching}
          />
        )}
      </div>
    </AdminPage>
  );
}
