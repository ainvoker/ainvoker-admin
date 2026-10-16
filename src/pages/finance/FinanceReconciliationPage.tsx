import { useRef, useState } from 'react';
import {
  useProviderReconciliation,
  useUploadProviderReconciliation,
  useUploadXenditReconciliation,
  useXenditReconciliation,
} from '../../hooks/useFinance';
import {
  currentUtcPeriod,
  type FinanceReconciliationRun,
} from '../../services/AdminFinanceService';
import { AdminPage } from '../../components/layout/AdminPage';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/ui/Badge';
import { formatPhp, formatUsd } from './financeFormat';

type DriftRow = {
  key: string;
  status: string;
  csvAmount: string | null;
  dbAmount: string | null;
};

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'muted' {
  if (status === 'matched') return 'success';
  if (status === 'amount_mismatch') return 'warning';
  if (status === 'csv_only' || status === 'db_only') return 'danger';
  return 'muted';
}

function driftFromRun(run: FinanceReconciliationRun | null, kind: 'xendit' | 'provider'): DriftRow[] {
  if (!run || !run.summary || typeof run.summary !== 'object') return [];
  const summary = run.summary as {
    driftSample?: Array<Record<string, unknown>>;
    items?: Array<Record<string, unknown>>;
  };
  const rows = (summary.driftSample ?? summary.items ?? []).filter(
    (row) => row.status && row.status !== 'matched',
  );
  return rows.slice(0, 50).map((row, i) => {
    if (kind === 'xendit') {
      return {
        key: String(row.reference ?? i),
        status: String(row.status),
        csvAmount: row.csvAmountPhp != null ? String(row.csvAmountPhp) : null,
        dbAmount: row.dbAmountPhp != null ? String(row.dbAmountPhp) : null,
      };
    }
    return {
      key: String(row.provider ?? i),
      status: String(row.status),
      csvAmount: row.csvAmountUsd != null ? String(row.csvAmountUsd) : null,
      dbAmount: row.dbAmountUsd != null ? String(row.dbAmountUsd) : null,
    };
  });
}

function RunSummary({ run }: { run: FinanceReconciliationRun | null }) {
  if (!run) {
    return <p className="text-sm text-neutral-500">No CSV uploaded for this period yet.</p>;
  }
  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <span>
        Last run{' '}
        <time dateTime={run.createdAt}>{new Date(run.createdAt).toLocaleString()}</time>
        {run.filename ? ` · ${run.filename}` : ''}
      </span>
      <span className="tabular-nums">{run.rowCount} CSV rows</span>
      <span className="tabular-nums text-emerald-700 dark:text-emerald-400">
        {run.matchedCount} matched
      </span>
      <span className="tabular-nums text-amber-700 dark:text-amber-400">
        {run.driftCount} drift
      </span>
    </div>
  );
}

function UploadBlock({
  label,
  acceptHint,
  uploading,
  error,
  onUpload,
}: {
  label: string;
  acceptHint: string;
  uploading: boolean;
  error: string | null;
  onUpload: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="text-sm file:mr-2 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm dark:file:bg-neutral-800"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            setLocalError(null);
            void onUpload(file).catch((err) => {
              setLocalError(err instanceof Error ? err.message : 'Upload failed');
            });
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {label}
        </Button>
      </div>
      <p className="text-xs text-neutral-500">{acceptHint}</p>
      {(localError || error) && (
        <p className="text-sm text-red-600">{localError ?? error}</p>
      )}
    </div>
  );
}

export default function FinanceReconciliationPage() {
  const [period, setPeriod] = useState(currentUtcPeriod);
  const xenditQuery = useXenditReconciliation(period);
  const providerQuery = useProviderReconciliation(period);
  const uploadXendit = useUploadXenditReconciliation();
  const uploadProvider = useUploadProviderReconciliation();

  const xenditDrift = driftFromRun(xenditQuery.data?.latestRun ?? null, 'xendit');
  const providerDrift = driftFromRun(providerQuery.data?.latestRun ?? null, 'provider');

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
      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Xendit settlements
          </h2>
          <p className="text-xs text-neutral-500">
            Compare CSV reference + amount to SUCCEEDED transactions for {period}.
          </p>
        </div>
        <div className="flex flex-col gap-4 px-4 py-4">
          {xenditQuery.error ? (
            <p className="text-sm text-red-600">
              {xenditQuery.error instanceof Error
                ? xenditQuery.error.message
                : 'Failed to load'}
            </p>
          ) : null}
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            Internal:{' '}
            <span className="tabular-nums font-medium text-accent">
              {xenditQuery.data
                ? `${xenditQuery.data.internal.transactionCount} txs · ${formatPhp(xenditQuery.data.internal.totalPhp)}`
                : xenditQuery.isLoading
                  ? 'Loading…'
                  : '—'}
            </span>
          </div>
          <UploadBlock
            label="Upload Xendit CSV"
            acceptHint="Headers: reference / external_id / reference_number + amount / settled_amount"
            uploading={uploadXendit.isPending}
            error={
              uploadXendit.error instanceof Error ? uploadXendit.error.message : null
            }
            onUpload={async (file) => {
              const csvText = await readFileAsText(file);
              await uploadXendit.mutateAsync({
                period,
                csvText,
                filename: file.name,
              });
            }}
          />
          <RunSummary run={xenditQuery.data?.latestRun ?? null} />
          {xenditDrift.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b border-neutral-200/80 text-[11px] uppercase tracking-wide text-neutral-500 dark:border-neutral-800">
                  <tr>
                    <th className="px-3 py-2 font-medium">Reference</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">CSV</th>
                    <th className="px-3 py-2 font-medium">DB</th>
                  </tr>
                </thead>
                <tbody>
                  {xenditDrift.map((row) => (
                    <tr
                      key={row.key}
                      className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/80"
                    >
                      <td className="px-3 py-2 font-mono text-xs">{row.key}</td>
                      <td className="px-3 py-2">
                        <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {row.csvAmount != null ? formatPhp(row.csvAmount) : '—'}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {row.dbAmount != null ? formatPhp(row.dbAmount) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Provider invoices
          </h2>
          <p className="text-xs text-neutral-500">
            Compare CSV provider totals to estimated usage COGS for {period}.
          </p>
        </div>
        <div className="flex flex-col gap-4 px-4 py-4">
          {providerQuery.error ? (
            <p className="text-sm text-red-600">
              {providerQuery.error instanceof Error
                ? providerQuery.error.message
                : 'Failed to load'}
            </p>
          ) : null}
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            Internal estimated COGS:{' '}
            <span className="tabular-nums font-medium text-accent">
              {providerQuery.data
                ? `${formatPhp(providerQuery.data.internal.totalPhp)} (${formatUsd(providerQuery.data.internal.totalUsd)})`
                : providerQuery.isLoading
                  ? 'Loading…'
                  : '—'}
            </span>
          </div>
          {providerQuery.data && providerQuery.data.internal.providers.length > 0 ? (
            <ul className="text-xs text-neutral-500">
              {providerQuery.data.internal.providers.map((p) => (
                <li key={p.provider}>
                  {p.provider}: {formatUsd(p.amountUsd)} · {formatPhp(p.amountPhp)}
                </li>
              ))}
            </ul>
          ) : null}
          <UploadBlock
            label="Upload provider CSV"
            acceptHint="OpenAI Usage Cost export (amount_value), or provider / vendor + amount_usd / amount / total"
            uploading={uploadProvider.isPending}
            error={
              uploadProvider.error instanceof Error ? uploadProvider.error.message : null
            }
            onUpload={async (file) => {
              const csvText = await readFileAsText(file);
              await uploadProvider.mutateAsync({
                period,
                csvText,
                filename: file.name,
              });
            }}
          />
          <RunSummary run={providerQuery.data?.latestRun ?? null} />
          {providerDrift.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b border-neutral-200/80 text-[11px] uppercase tracking-wide text-neutral-500 dark:border-neutral-800">
                  <tr>
                    <th className="px-3 py-2 font-medium">Provider</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">CSV (USD)</th>
                    <th className="px-3 py-2 font-medium">DB (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {providerDrift.map((row) => (
                    <tr
                      key={row.key}
                      className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/80"
                    >
                      <td className="px-3 py-2">{row.key}</td>
                      <td className="px-3 py-2">
                        <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {row.csvAmount != null ? formatUsd(row.csvAmount) : '—'}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {row.dbAmount != null ? formatUsd(row.dbAmount) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>
    </AdminPage>
  );
}
