import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPage } from '../../components/layout/AdminPage';
import { DashboardSkeleton } from '../../components/dashboard/DashboardSkeleton';
import { HealthDial } from '../../components/dashboard/HealthDial';
import { MetricRail } from '../../components/dashboard/MetricRail';
import { NearLimitPanel } from '../../components/dashboard/NearLimitPanel';
import { PnLChart } from '../../components/dashboard/PnLChart';
import { ShareBars } from '../../components/dashboard/ShareBars';
import {
  formatCompact,
  formatCostUsd,
  formatLatency,
  formatNumber,
  formatPhp,
  planLabel,
  successRate,
} from '../../components/dashboard/dashboardFormat';
import { SystemPulseChart } from '../../components/dashboard/SystemPulseChart';
import { useAdminDashboard } from '../../hooks/useDashboard';
import { currentUtcPeriod } from '../../services/AdminDashboardService';

const FINANCE_MONTHS = 6;

export default function DashboardPage() {
  const [period, setPeriod] = useState(currentUtcPeriod);
  const query = useAdminDashboard(period, FINANCE_MONTHS);
  const data = query.data;
  const isRefreshing = query.isFetching && !!data;

  const rate = useMemo(() => {
    if (!data) return null;
    return successRate(
      data.usage.totals.successfulRequests,
      data.usage.totals.failedRequests,
    );
  }, [data]);

  const providerItems = useMemo(
    () =>
      (data?.usage.byProvider ?? []).map((row) => ({
        id: String(row.providerId),
        name: row.providerName,
        value: row.requestsUsed,
        meta: formatCostUsd(row.totalCost),
      })),
    [data?.usage.byProvider],
  );

  const marginItems = useMemo(
    () =>
      (data?.finance.marginByPlan ?? []).map((row) => ({
        id: row.planName,
        name: planLabel(row.planName),
        value: Number(row.cashCollectedPhp),
        meta: `gross ${formatPhp(row.grossMarginPhp)} · ${formatNumber(row.requestCount)} req`,
      })),
    [data?.finance.marginByPlan],
  );

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
      {query.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {query.error instanceof Error ? query.error.message : 'Failed to load dashboard'}
        </p>
      ) : null}

      {query.isLoading && !data ? (
        <DashboardSkeleton />
      ) : data ? (
        <div
          className={[
            'flex flex-col gap-4 transition-opacity',
            isRefreshing ? 'opacity-60' : '',
          ].join(' ')}
          aria-busy={isRefreshing}
        >
          <MetricRail
            items={[
              {
                label: 'API status',
                value: data.apiStatus === 'ok' ? 'Healthy' : 'Down',
                hint: 'Serving admin API',
              },
              {
                label: 'Success rate',
                value: rate == null ? '—' : `${rate}%`,
                hint: `${formatNumber(data.usage.totals.failedRequests)} failed`,
              },
              {
                label: 'p95 latency',
                value: formatLatency(data.usage.totals.p95Latency),
                hint:
                  data.usage.totals.avgLatency != null
                    ? `avg ${formatLatency(data.usage.totals.avgLatency)}`
                    : undefined,
              },
              {
                label: 'Failed requests',
                value: formatCompact(data.usage.totals.failedRequests),
                hint: `${formatCompact(data.usage.totals.requests)} total`,
              },
              {
                label: 'Net profit',
                value: formatPhp(data.finance.overview.netProfitPhp),
                hint: `UTC ${period}`,
              },
            ]}
          />

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SystemPulseChart daily={data.usage.daily} />
            </div>
            <HealthDial
              percent={rate}
              detail={
                data.usage.totals.requests > 0
                  ? `${formatNumber(data.usage.totals.successfulRequests)} ok · ${formatNumber(data.usage.totals.failedRequests)} failed`
                  : 'No decided requests this month'
              }
            />
          </div>

          <PnLChart monthly={data.finance.monthly} />

          <div className="grid gap-3 lg:grid-cols-2">
            <ShareBars
              title="Cash collected by plan"
              items={marginItems}
              formatValue={(v) => formatPhp(v)}
              emptyDescription="No plan cash activity this month."
              footer={
                <Link
                  to="/finance/overview"
                  className="text-[12px] text-neutral-500 underline-offset-2 hover:text-accent hover:underline"
                >
                  Open finance overview
                </Link>
              }
            />
            <ShareBars
              title="Provider traffic mix"
              items={providerItems}
              formatValue={formatCompact}
              emptyDescription="No provider traffic this month."
              footer={
                <div className="flex items-center justify-between gap-2 text-[12px] text-neutral-500">
                  <span>
                    Retail {formatCostUsd(data.usage.totals.totalCost)} · FX ₱
                    {data.finance.usdToPhpRate}/USD
                  </span>
                  <Link
                    to="/usage"
                    className="underline-offset-2 hover:text-accent hover:underline"
                  >
                    Open usage
                  </Link>
                </div>
              }
            />
          </div>

          <NearLimitPanel rows={data.usage.nearLimit} />
        </div>
      ) : null}
    </AdminPage>
  );
}
