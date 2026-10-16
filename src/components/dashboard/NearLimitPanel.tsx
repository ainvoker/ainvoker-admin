import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import type { AdminDashboardNearLimitRow } from '../../services/AdminDashboardService';
import { formatNumber, planLabel } from './dashboardFormat';

export function NearLimitPanel({ rows }: { rows: AdminDashboardNearLimitRow[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
        <div>
          <h2 className="text-[15px] font-medium text-accent">Quota attention</h2>
          <p className="text-xs text-neutral-400">
            Workspaces at ≥80% of request or token quota this month
          </p>
        </div>
        <Link
          to="/usage"
          className="shrink-0 text-[12px] text-neutral-500 underline-offset-2 hover:text-accent hover:underline"
        >
          Open usage
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-neutral-200/80 text-[11px] text-neutral-500 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-2 font-medium">Workspace</th>
              <th className="px-4 py-2 font-medium">Plan</th>
              <th className="px-4 py-2 font-medium">Requests</th>
              <th className="px-4 py-2 font-medium">Tokens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-500">
                  No workspaces near limits.
                </td>
              </tr>
            ) : (
              rows.slice(0, 8).map((row) => {
                const hot =
                  Math.max(row.requestsPct ?? 0, row.tokensPct ?? 0) >= 90;
                return (
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
                      <Badge tone={hot ? 'warning' : 'neutral'}>{planLabel(row.planName)}</Badge>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
