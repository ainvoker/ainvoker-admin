import { formatPhp, planLabel } from '../../pages/finance/financeFormat';

const numberFormat = new Intl.NumberFormat('en-US');
const compactFormat = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatNumber(n: number) {
  return numberFormat.format(n);
}

export function formatCompact(n: number) {
  return compactFormat.format(n);
}

export function formatLatency(ms: number | null | undefined) {
  if (ms == null) return '—';
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${ms} ms`;
}

export function formatCostUsd(value: string | number | null | undefined) {
  if (value == null) return '—';
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  if (n === 0) return '$0';
  if (n < 0.01) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(2)}`;
}

export function successRate(successful: number, failed: number) {
  const decided = successful + failed;
  if (decided === 0) return null;
  return Math.round((successful / decided) * 1000) / 10;
}

export function periodLabel(period: string) {
  const [y, m] = period.split('-').map(Number);
  if (!y || !m) return period;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function dayLabel(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export { formatPhp, planLabel };
