import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useAdminAiRequest, useAdminAiRequests, useAdminUsage } from '../../hooks/useUsage';
import {
  currentUtcPeriod,
  type AiRequestStatus,
} from '../../services/AdminUsageService';
import { planLabel } from '../billing/billingBadges';
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

const numberFormat = new Intl.NumberFormat('en-US');

function formatNumber(n: number) {
  return numberFormat.format(n);
}

function formatCost(value: string | null | undefined) {
  if (value == null) return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  if (n === 0) return '$0';
  if (n < 0.01) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(4)}`;
}

function formatLatency(ms: number | null | undefined) {
  if (ms == null) return '—';
  return `${ms} ms`;
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'muted' | 'neutral' {
  if (status === 'SUCCESS') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'FAILED' || status === 'REJECTED') return 'danger';
  return 'muted';
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-neutral-200/80 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:px-4 sm:py-0 sm:last:border-r-0 dark:border-neutral-800">
      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className="text-lg font-semibold tabular-nums text-accent">{value}</p>
      {hint ? <p className="text-[11px] text-neutral-400">{hint}</p> : null}
    </div>
  );
}

function BreakdownTable({
  title,
  columns,
  rows,
  empty,
}: {
  title: string;
  columns: string[];
  rows: ReactNode[][];
  empty: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-neutral-200/80 text-[11px] uppercase tracking-wide text-neutral-500 dark:border-neutral-800">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-neutral-500">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((cells, i) => (
                <tr key={i} className="text-neutral-700 dark:text-neutral-200">
                  {cells.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 tabular-nums">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function UsagePage() {
  const [period, setPeriod] = useState(currentUtcPeriod);
  const [search, setSearch] = useState('');
  const [submittedQ, setSubmittedQ] = useState('');
  const [status, setStatus] = useState<AiRequestStatus | ''>('');
  const [offset, setOffset] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setOffset(0);
  }, [submittedQ, status, period]);

  const usageQuery = useAdminUsage(period);
  const overview = usageQuery.data;

  const requestFilters = useMemo(
    () => ({
      q: submittedQ || undefined,
      status: status || undefined,
      period,
      limit: TABLE_PAGE_SIZE,
      offset,
    }),
    [submittedQ, status, period, offset],
  );

  const requestsQuery = useAdminAiRequests(requestFilters);
  const items = requestsQuery.data?.items ?? [];
  const total = requestsQuery.data?.total ?? 0;
  const hasFilters = !!(submittedQ || status);

  const detailQuery = useAdminAiRequest(expandedId);
  const detail = detailQuery.data;

  return (
    <AdminPage
      actions={
        <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <span className="sr-only">Period</span>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      }
    >
      {usageQuery.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {usageQuery.error instanceof Error
            ? usageQuery.error.message
            : 'Failed to load usage'}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Platform totals
          </h2>
          <p className="text-xs text-neutral-500">UTC month {period}</p>
        </div>
        {usageQuery.isLoading && !overview ? (
          <p className="px-4 py-8 text-sm text-neutral-500">Loading…</p>
        ) : overview ? (
          <div className="grid gap-0 px-4 py-4 sm:grid-cols-2 lg:grid-cols-5">
            <Kpi
              label="Requests"
              value={formatNumber(overview.totals.requests)}
              hint={`${formatNumber(overview.totals.successfulRequests)} ok · ${formatNumber(overview.totals.failedRequests)} failed`}
            />
            <Kpi label="Tokens" value={formatNumber(overview.totals.tokensUsed)} />
            <Kpi label="Cost" value={formatCost(overview.totals.totalCost)} hint="Retail USD" />
            <Kpi
              label="Error rate"
              value={`${overview.totals.errorRate}%`}
            />
            <Kpi
              label="Avg latency"
              value={formatLatency(overview.totals.avgLatency)}
              hint={
                overview.totals.p95Latency != null
                  ? `p95 ${formatLatency(overview.totals.p95Latency)}`
                  : undefined
              }
            />
          </div>
        ) : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <BreakdownTable
          title="By workspace"
          columns={['Workspace', 'Requests', 'Tokens', 'Cost']}
          empty="No workspace traffic this month."
          rows={(overview?.byOrganization ?? []).slice(0, 10).map((row) => [
            <Link
              key={row.organizationId}
              to={`/organizations/${row.organizationId}`}
              className="text-accent underline-offset-2 hover:underline"
            >
              {row.organizationName}
            </Link>,
            formatNumber(row.requestsUsed),
            formatNumber(row.tokensUsed),
            formatCost(row.totalCost),
          ])}
        />
        <BreakdownTable
          title="By model"
          columns={['Model', 'Requests', 'Tokens', 'Cost']}
          empty="No model traffic this month."
          rows={(overview?.byModel ?? []).slice(0, 10).map((row) => [
            <span key={row.modelId} className="font-mono text-[12px]">
              {row.model}
            </span>,
            formatNumber(row.requestsUsed),
            formatNumber(row.tokensUsed),
            formatCost(row.totalCost),
          ])}
        />
        <BreakdownTable
          title="By provider"
          columns={['Provider', 'Requests', 'Tokens', 'Cost']}
          empty="No provider traffic this month."
          rows={(overview?.byProvider ?? []).slice(0, 10).map((row) => [
            row.providerName,
            formatNumber(row.requestsUsed),
            formatNumber(row.tokensUsed),
            formatCost(row.totalCost),
          ])}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Near plan limits
          </h2>
          <p className="text-xs text-neutral-500">
            Workspaces at ≥80% of request or token quota for this month (or Free lifetime tokens).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-neutral-200/80 text-[11px] uppercase tracking-wide text-neutral-500 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-2 font-medium">Workspace</th>
                <th className="px-4 py-2 font-medium">Plan</th>
                <th className="px-4 py-2 font-medium">Requests</th>
                <th className="px-4 py-2 font-medium">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {(overview?.nearLimit ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-500">
                    No workspaces near limits.
                  </td>
                </tr>
              ) : (
                (overview?.nearLimit ?? []).map((row) => (
                  <tr key={row.organizationId} className="text-neutral-700 dark:text-neutral-200">
                    <td className="px-4 py-2.5">
                      <Link
                        to={`/organizations/${row.organizationId}`}
                        className="text-accent underline-offset-2 hover:underline"
                      >
                        {row.organizationName}
                      </Link>
                      <div className="text-[12px] text-neutral-400">{row.organizationSlug}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone="neutral">{planLabel(row.planName)}</Badge>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {row.requestsPct != null ? (
                        <>
                          {formatNumber(row.requestsUsed)} / {formatNumber(row.requestLimit)}
                          <span className="ml-1 text-neutral-400">({row.requestsPct}%)</span>
                        </>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {row.tokensPct != null ? (
                        <>
                          {formatNumber(row.tokensUsed)} / {formatNumber(row.tokenLimit)}
                          <span className="ml-1 text-neutral-400">({row.tokensPct}%)</span>
                        </>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Request log
          </h2>
          <p className="text-xs text-neutral-500">
            Cross-workspace AI requests for {period}. Expand a row for payloads.
          </p>
        </div>
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
              aria-label="Search AI requests"
              placeholder="Request id, workspace, project, or model"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-1.5 pl-8 text-[13px]"
            />
          </div>
          <Select
            aria-label="Filter by status"
            className="w-40"
            value={status}
            onChange={(e) => {
              setStatus((e.target.value || '') as AiRequestStatus | '');
              setOffset(0);
            }}
          >
            <option value="">All statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
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
                  Workspace
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Project
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Model
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Tokens
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Latency
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {requestsQuery.isPending &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                    </td>
                  </tr>
                ))}

              {requestsQuery.isError && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-accent">Couldn&apos;t load requests</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => void requestsQuery.refetch()}
                    >
                      Try again
                    </Button>
                  </td>
                </tr>
              )}

              {requestsQuery.isSuccess && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-neutral-500">
                    {hasFilters ? 'No requests match your filters.' : 'No AI requests this month.'}
                  </td>
                </tr>
              )}

              {items.map((row) => {
                const expanded = expandedId === row.id;
                return (
                  <tr
                    key={row.id}
                    className="text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-top text-neutral-400">
                      {dateFormat.format(new Date(row.createdAt))}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <Link
                        to={`/organizations/${row.organizationId}`}
                        className="text-accent underline-offset-2 hover:underline"
                      >
                        {row.organizationName}
                      </Link>
                    </td>
                    <td className="px-3 py-3 align-top">{row.projectName}</td>
                    <td className="px-3 py-3 align-top font-mono text-[12px]">{row.model}</td>
                    <td className="px-3 py-3 align-top">
                      <Badge tone={statusTone(row.requestStatus)}>{row.requestStatus}</Badge>
                    </td>
                    <td className="px-3 py-3 align-top tabular-nums">
                      {row.totalTokens != null ? formatNumber(row.totalTokens) : '—'}
                    </td>
                    <td className="px-3 py-3 align-top tabular-nums">
                      {formatLatency(row.latency)}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <button
                        type="button"
                        className="text-[12px] text-neutral-400 underline-offset-2 hover:text-accent hover:underline"
                        onClick={() => setExpandedId(expanded ? null : row.id)}
                      >
                        {expanded ? 'Hide' : 'Show'}
                      </button>
                      {expanded && (
                        <div className="mt-2 max-w-md space-y-2">
                          {detailQuery.isPending && (
                            <p className="text-[12px] text-neutral-400">Loading payloads…</p>
                          )}
                          {detailQuery.isError && (
                            <p className="text-[12px] text-red-500">
                              {detailQuery.error instanceof Error
                                ? detailQuery.error.message
                                : 'Failed to load detail'}
                            </p>
                          )}
                          {detail && detail.id === row.id && (
                            <>
                              <pre className="max-h-40 overflow-auto rounded-md bg-neutral-50 p-2 text-[11px] text-neutral-600 dark:bg-neutral-950 dark:text-neutral-300">
                                {JSON.stringify(detail.requestPayload, null, 2)}
                              </pre>
                              <pre className="max-h-40 overflow-auto rounded-md bg-neutral-50 p-2 text-[11px] text-neutral-600 dark:bg-neutral-950 dark:text-neutral-300">
                                {JSON.stringify(detail.responsePayload, null, 2)}
                              </pre>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {requestsQuery.isSuccess && (
          <TablePagination
            total={total}
            limit={TABLE_PAGE_SIZE}
            offset={offset}
            onOffsetChange={setOffset}
            disabled={requestsQuery.isFetching}
          />
        )}
      </section>
    </AdminPage>
  );
}
