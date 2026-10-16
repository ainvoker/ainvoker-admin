import { useState } from 'react';
import { useFinanceMarginByPlan, useFinanceOverview } from '../../hooks/useFinance';
import { currentUtcPeriod } from '../../services/AdminFinanceService';
import { AdminPage } from '../../components/layout/AdminPage';
import { formatPhp, formatUsd, planLabel } from './financeFormat';

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

export default function FinanceOverviewPage() {
  const [period, setPeriod] = useState(currentUtcPeriod);
  const overviewQuery = useFinanceOverview(period);
  const marginQuery = useFinanceMarginByPlan(period);

  const overview = overviewQuery.data;
  const marginItems = marginQuery.data?.items ?? [];
  const loading = overviewQuery.isLoading || marginQuery.isLoading;
  const error = overviewQuery.error ?? marginQuery.error;

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
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error instanceof Error ? error.message : 'Failed to load overview'}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Period P&L
          </h2>
          <p className="text-xs text-neutral-500">
            UTC month {period}
            {overview ? ` · FX ₱${overview.usdToPhpRate} / USD` : ''}
          </p>
        </div>
        {loading && !overview ? (
          <p className="px-4 py-8 text-sm text-neutral-500">Loading…</p>
        ) : overview ? (
          <div className="grid gap-0 px-4 py-4 sm:grid-cols-2 lg:grid-cols-5">
            <Kpi label="Cash collected" value={formatPhp(overview.cashCollectedPhp)} />
            <Kpi
              label="Provider COGS"
              value={formatPhp(overview.providerCogsPhp)}
              hint={formatUsd(overview.providerCogsUsd)}
            />
            <Kpi label="Gross margin" value={formatPhp(overview.grossMarginPhp)} />
            <Kpi label="Expenses" value={formatPhp(overview.expensesPhp)} />
            <Kpi label="Net profit" value={formatPhp(overview.netProfitPhp)} />
          </div>
        ) : null}
        {overview ? (
          <p className="border-t border-neutral-200/80 px-4 py-2 text-xs text-neutral-500 dark:border-neutral-800">
            Usage retail (customer-facing): {formatPhp(overview.usageRetailPhp)} (
            {formatUsd(overview.usageRetailUsd)}) · {overview.requestCount} successful requests
          </p>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Margin by plan
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-200/80 text-[11px] uppercase tracking-wide text-neutral-500 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-2 font-medium">Plan</th>
                <th className="px-4 py-2 font-medium">Cash</th>
                <th className="px-4 py-2 font-medium">COGS</th>
                <th className="px-4 py-2 font-medium">Gross</th>
                <th className="px-4 py-2 font-medium">Requests</th>
              </tr>
            </thead>
            <tbody>
              {marginItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-neutral-500">
                    {marginQuery.isLoading ? 'Loading…' : 'No activity for this period.'}
                  </td>
                </tr>
              ) : (
                marginItems.map((row) => (
                  <tr
                    key={row.planName}
                    className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/80"
                  >
                    <td className="px-4 py-2.5 font-medium">{planLabel(row.planName)}</td>
                    <td className="px-4 py-2.5 tabular-nums">{formatPhp(row.cashCollectedPhp)}</td>
                    <td className="px-4 py-2.5 tabular-nums">
                      <div>{formatPhp(row.providerCogsPhp)}</div>
                      <div className="text-[11px] text-neutral-400">
                        {formatUsd(row.providerCogsUsd)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{formatPhp(row.grossMarginPhp)}</td>
                    <td className="px-4 py-2.5 tabular-nums">{row.requestCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPage>
  );
}
