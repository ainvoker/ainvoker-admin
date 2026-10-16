import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import {
  usePatchSubscription,
  usePlans,
  useSubscriptions,
  useTransactions,
} from '../../hooks/useBilling';
import type {
  AdminSubscriptionItem,
  PaymentStatus,
  PlanName,
  SubscriptionStatus,
} from '../../services/AdminBillingService';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { TextInput } from '../../components/ui/Field';
import { TABLE_PAGE_SIZE, TablePagination } from '../../components/ui/TablePagination';
import { Button } from '../../components/common/Button';
import { AdminPage } from '../../components/layout/AdminPage';
import { paymentStatusTone, planLabel, subscriptionStatusTone } from './billingBadges';

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const moneyFormat = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

type SupportAction = 'cancel' | 'grant_pro' | 'extend_pro';

function formatAmount(amount: string) {
  const n = Number(amount);
  if (Number.isNaN(n)) return amount;
  return moneyFormat.format(n);
}

/** Already entitled Pro — use Extend instead of Grant. */
function isActivePro(row: AdminSubscriptionItem) {
  return row.planName === 'pro' && (row.status === 'ACTIVE' || row.status === 'PAST_DUE');
}

/**
 * Comp Free (or a stuck non-Pro row) onto Pro.
 * Skip PENDING — that is an unpaid checkout; Cancel it or leave it, don't "grant" over it.
 * Skip entitled Pro — use Extend.
 */
function canGrantPro(row: AdminSubscriptionItem) {
  if (row.status === 'PENDING' || row.status === 'CANCELED' || row.status === 'EXPIRED') {
    return false;
  }
  return !isActivePro(row);
}

function canExtendPro(row: AdminSubscriptionItem) {
  return isActivePro(row);
}

function canCancel(row: AdminSubscriptionItem) {
  return row.status !== 'CANCELED' && row.status !== 'EXPIRED';
}

export default function BillingPage() {
  const [subSearch, setSubSearch] = useState('');
  const [subSubmittedQ, setSubSubmittedQ] = useState('');
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | ''>('');
  const [subPlan, setSubPlan] = useState<PlanName | ''>('');
  const [subOffset, setSubOffset] = useState(0);

  const [txSearch, setTxSearch] = useState('');
  const [txSubmittedQ, setTxSubmittedQ] = useState('');
  const [txStatus, setTxStatus] = useState<PaymentStatus | ''>('');
  const [txOffset, setTxOffset] = useState(0);

  const [selected, setSelected] = useState<AdminSubscriptionItem | null>(null);
  const [action, setAction] = useState<SupportAction>('cancel');
  const [atPeriodEnd, setAtPeriodEnd] = useState(true);
  const [extendDays, setExtendDays] = useState('30');
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setSubOffset(0);
  }, [subSubmittedQ, subStatus, subPlan]);

  useEffect(() => {
    setTxOffset(0);
  }, [txSubmittedQ, txStatus]);

  const subFilters = useMemo(
    () => ({
      q: subSubmittedQ || undefined,
      status: subStatus || undefined,
      plan: subPlan || undefined,
      limit: TABLE_PAGE_SIZE,
      offset: subOffset,
    }),
    [subSubmittedQ, subStatus, subPlan, subOffset],
  );

  const txFilters = useMemo(
    () => ({
      q: txSubmittedQ || undefined,
      paymentStatus: txStatus || undefined,
      limit: TABLE_PAGE_SIZE,
      offset: txOffset,
    }),
    [txSubmittedQ, txStatus, txOffset],
  );

  const subsQuery = useSubscriptions(subFilters);
  const txsQuery = useTransactions(txFilters);
  const plansQuery = usePlans();
  const patchSub = usePatchSubscription();

  const subs = subsQuery.data?.items ?? [];
  const subsTotal = subsQuery.data?.total ?? 0;
  const txs = txsQuery.data?.items ?? [];
  const txsTotal = txsQuery.data?.total ?? 0;
  const plans = plansQuery.data ?? [];

  const openAction = (row: AdminSubscriptionItem, next: SupportAction) => {
    setSelected(row);
    setAction(next);
    setAtPeriodEnd(true);
    setExtendDays('30');
    setActionError(null);
  };

  const closeDialog = () => {
    if (patchSub.isPending) return;
    setSelected(null);
    setActionError(null);
  };

  const confirmAction = async () => {
    if (!selected) return;
    setActionError(null);

    const body =
      action === 'cancel'
        ? ({ action: 'cancel' as const, atPeriodEnd })
        : action === 'grant_pro'
          ? ({ action: 'grant_pro' as const })
          : ({
              action: 'extend_pro' as const,
              days: Math.min(365, Math.max(1, Number.parseInt(extendDays, 10) || 1)),
            });

    try {
      await patchSub.mutateAsync({ subscriptionId: selected.id, body });
      setSelected(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const dialogTitle =
    action === 'cancel'
      ? 'Cancel subscription'
      : action === 'grant_pro'
        ? 'Grant Pro'
        : 'Extend Pro';

  return (
    <AdminPage>
      {/* Subscriptions */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-accent">Subscriptions</h2>
          <p className="mt-0.5 text-[12px] text-neutral-400">
            Support tools: <span className="text-neutral-500">Grant Pro</span> comps a workspace onto
            Pro (no charge); <span className="text-neutral-500">Extend</span> adds days to an active
            Pro; <span className="text-neutral-500">Cancel</span> stops the plan. Nothing runs until
            you confirm in the dialog.
          </p>
        </div>
        <form
          className="flex flex-wrap items-center gap-2 border-b border-neutral-200/80 p-3 dark:border-neutral-800"
          onSubmit={(e) => {
            e.preventDefault();
            setSubSubmittedQ(subSearch.trim());
          }}
        >
          <div className="relative w-full sm:w-64">
            <HiOutlineMagnifyingGlass
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
            />
            <TextInput
              aria-label="Search subscriptions"
              placeholder="Org name, slug, or id"
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              className="py-1.5 pl-8 text-[13px]"
            />
          </div>
          <Select
            aria-label="Filter by status"
            className="w-36"
            value={subStatus}
            onChange={(e) => {
              setSubStatus((e.target.value || '') as SubscriptionStatus | '');
              setSubOffset(0);
            }}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="PAST_DUE">Past due</option>
            <option value="CANCELED">Canceled</option>
            <option value="EXPIRED">Expired</option>
          </Select>
          <Select
            aria-label="Filter by plan"
            className="w-32"
            value={subPlan}
            onChange={(e) => {
              setSubPlan((e.target.value || '') as PlanName | '');
              setSubOffset(0);
            }}
          >
            <option value="">All plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="scale">Scale</option>
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
                  Workspace
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Plan
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Period end
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Updated
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {subsQuery.isPending &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                    </td>
                  </tr>
                ))}

              {subsQuery.isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-accent">Couldn&apos;t load subscriptions</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => void subsQuery.refetch()}
                    >
                      Try again
                    </Button>
                  </td>
                </tr>
              )}

              {subsQuery.isSuccess && subs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-500">
                    No subscriptions match your filters.
                  </td>
                </tr>
              )}

              {subs.map((row) => (
                <tr
                  key={row.id}
                  className="text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/organizations/${row.organization.id}`}
                      className="font-medium text-accent underline-offset-2 hover:underline"
                    >
                      {row.organization.name}
                    </Link>
                    <div className="mt-0.5 font-mono text-[12px] text-neutral-400">
                      {row.organization.slug}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone="neutral">{planLabel(row.planName)}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={subscriptionStatusTone(row.status)}>{row.status}</Badge>
                      {row.cancelAtPeriodEnd && <Badge tone="warning">Ends period</Badge>}
                      {row.xenditRecurringPlanId && <Badge tone="muted">Xendit</Badge>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-neutral-400">
                    {row.expiresAt ? dateFormat.format(new Date(row.expiresAt)) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-neutral-400">
                    {dateFormat.format(new Date(row.updatedAt))}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!canGrantPro(row)}
                        title={
                          row.status === 'PENDING'
                            ? 'Pending checkout — Cancel it if needed; Grant Pro is for Free (or stuck) rows'
                            : isActivePro(row)
                              ? 'Already on Pro — use Extend to add days'
                              : !canGrantPro(row)
                                ? 'Cannot grant Pro on a canceled or expired row'
                                : 'Comp this workspace onto Pro for free (opens a confirm dialog)'
                        }
                        onClick={() => openAction(row, 'grant_pro')}
                      >
                        Grant Pro
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!canExtendPro(row)}
                        title={
                          canExtendPro(row)
                            ? 'Add days to this Pro period (opens a confirm dialog)'
                            : 'Extend only works on an active Pro subscription'
                        }
                        onClick={() => openAction(row, 'extend_pro')}
                      >
                        Extend
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!canCancel(row)}
                        title={
                          canCancel(row)
                            ? 'Stop this subscription (opens a confirm dialog)'
                            : 'Already canceled or expired'
                        }
                        onClick={() => openAction(row, 'cancel')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subsQuery.isSuccess && (
          <TablePagination
            total={subsTotal}
            limit={TABLE_PAGE_SIZE}
            offset={subOffset}
            onOffsetChange={setSubOffset}
            disabled={subsQuery.isFetching}
          />
        )}
      </section>

      {/* Transactions */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-accent">Transactions</h2>
          <p className="mt-0.5 text-[12px] text-neutral-400">
            Xendit payments and receipts tied to subscriptions.
          </p>
        </div>
        <form
          className="flex flex-wrap items-center gap-2 border-b border-neutral-200/80 p-3 dark:border-neutral-800"
          onSubmit={(e) => {
            e.preventDefault();
            setTxSubmittedQ(txSearch.trim());
          }}
        >
          <div className="relative w-full sm:w-64">
            <HiOutlineMagnifyingGlass
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
            />
            <TextInput
              aria-label="Search transactions"
              placeholder="Reference, org name, or id"
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              className="py-1.5 pl-8 text-[13px]"
            />
          </div>
          <Select
            aria-label="Filter by payment status"
            className="w-40"
            value={txStatus}
            onChange={(e) => {
              setTxStatus((e.target.value || '') as PaymentStatus | '');
              setTxOffset(0);
            }}
          >
            <option value="">All statuses</option>
            <option value="SUCCEEDED">Succeeded</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
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
                  Date
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Workspace
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Plan
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {txsQuery.isPending &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                    </td>
                  </tr>
                ))}

              {txsQuery.isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-accent">Couldn&apos;t load transactions</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => void txsQuery.refetch()}
                    >
                      Try again
                    </Button>
                  </td>
                </tr>
              )}

              {txsQuery.isSuccess && txs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-500">
                    No transactions yet.
                  </td>
                </tr>
              )}

              {txs.map((row) => (
                <tr
                  key={row.id}
                  className="text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800/50"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-400">
                    {dateFormat.format(new Date(row.createdAt))}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      to={`/organizations/${row.organization.id}`}
                      className="font-medium text-accent underline-offset-2 hover:underline"
                    >
                      {row.organization.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone="neutral">{planLabel(row.planName)}</Badge>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{formatAmount(row.amount)}</td>
                  <td className="px-3 py-3">
                    <Badge tone={paymentStatusTone(row.paymentStatus)}>{row.paymentStatus}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-mono text-[12px] text-neutral-400">{row.referenceNumber}</div>
                    {row.receiptUrl && (
                      <a
                        href={row.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 inline-block text-[12px] text-accent underline-offset-2 hover:underline"
                      >
                        Receipt
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {txsQuery.isSuccess && (
          <TablePagination
            total={txsTotal}
            limit={TABLE_PAGE_SIZE}
            offset={txOffset}
            onOffsetChange={setTxOffset}
            disabled={txsQuery.isFetching}
          />
        )}
      </section>

      {/* Plans */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-accent">Plans</h2>
          <p className="mt-0.5 text-[12px] text-neutral-400">
            Read-only catalog. Pro list price is ₱499 / month; Scale shows the wallet advance.
            Limits are seeded in code.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="text-xs text-neutral-500 dark:text-neutral-400">
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Plan
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Price
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Mode
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Token limit
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Request limit
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {plansQuery.isPending &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                    </td>
                  </tr>
                ))}

              {plansQuery.isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-accent">Couldn&apos;t load plans</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => void plansQuery.refetch()}
                    >
                      Try again
                    </Button>
                  </td>
                </tr>
              )}

              {plans.map((plan) => (
                <tr
                  key={plan.id}
                  className="text-neutral-700 dark:text-neutral-200"
                >
                  <td className="px-4 py-3 font-medium text-accent">{planLabel(plan.name)}</td>
                  <td className="px-3 py-3 tabular-nums">
                    {formatAmount(plan.monthlyPrice)}
                    {plan.priceNote && (
                      <span className="ml-1 text-[12px] text-neutral-400">{plan.priceNote}</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone="muted">{plan.billingMode}</Badge>
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    {plan.tokenLimit > 0 ? plan.tokenLimit.toLocaleString() : '—'}
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    {plan.requestLimit > 0 ? plan.requestLimit.toLocaleString() : '—'}
                  </td>
                  <td className="max-w-xs px-3 py-3 text-neutral-400">
                    {plan.description ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={!!selected}
        onClose={closeDialog}
        title={dialogTitle}
        description={
          selected
            ? `${selected.organization.name} · ${planLabel(selected.planName)} · ${selected.status}`
            : undefined
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            {action === 'cancel' && (
              <>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {atPeriodEnd
                    ? 'Stops auto-renewal. Access continues until the current period end.'
                    : 'Ends access immediately. Use only when support needs a hard cutoff.'}
                </p>
                {selected.xenditRecurringPlanId && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    This subscription has a Xendit recurring plan. Cancel will deactivate it.
                  </p>
                )}
                <label className="flex items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={atPeriodEnd}
                    onChange={(e) => setAtPeriodEnd(e.target.checked)}
                    className="size-4 rounded border-neutral-300"
                  />
                  Cancel at period end
                </label>
              </>
            )}

            {action === 'grant_pro' && (
              <>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Give this workspace Pro <strong className="font-medium text-accent">for free</strong>{' '}
                  (support comp). No card charge and no Xendit auto-renewal.
                </p>
                <ul className="list-disc space-y-1 pl-5 text-[13px] text-neutral-500 dark:text-neutral-400">
                  <li>
                    This row becomes <strong className="font-medium text-accent">active Pro</strong>{' '}
                    for about one month (or until you Extend).
                  </li>
                  <li>Any other active plan on the same workspace is canceled.</li>
                </ul>
                {selected.xenditRecurringPlanId && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    This row still has a Xendit recurring id. Prefer Cancel first so external billing
                    does not continue.
                  </p>
                )}
              </>
            )}

            {action === 'extend_pro' && (
              <>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Keep their current Pro, and push the period end out by the days you choose. No
                  charge.
                </p>
                <label className="flex flex-col gap-1.5 text-[13px]">
                  <span className="text-neutral-500">Days to add (1–365)</span>
                  <TextInput
                    type="number"
                    min={1}
                    max={365}
                    value={extendDays}
                    onChange={(e) => setExtendDays(e.target.value)}
                    className="w-28 py-1.5 text-[13px]"
                  />
                </label>
              </>
            )}

            {actionError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {actionError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" size="sm" onClick={closeDialog} disabled={patchSub.isPending}>
                Back
              </Button>
              <Button
                variant={action === 'cancel' && !atPeriodEnd ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => void confirmAction()}
                disabled={patchSub.isPending}
              >
                {patchSub.isPending
                  ? 'Saving…'
                  : action === 'grant_pro'
                    ? 'Yes, grant Pro'
                    : action === 'extend_pro'
                      ? `Extend by ${Math.min(365, Math.max(1, Number.parseInt(extendDays, 10) || 1))} days`
                      : atPeriodEnd
                        ? 'Cancel at period end'
                        : 'Cancel immediately'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </AdminPage>
  );
}
