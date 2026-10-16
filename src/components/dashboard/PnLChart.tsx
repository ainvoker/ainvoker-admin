import { useMemo, useState } from 'react';
import type { AdminDashboardMonthlyFinance } from '../../services/AdminDashboardService';
import { formatPhp, periodLabel } from './dashboardFormat';

type PnLChartProps = {
  monthly: AdminDashboardMonthlyFinance[];
};

/** Neutral accent opacities to distinguish series without extra brand colors. */
const SERIES = [
  { key: 'cash', label: 'Cash', opacity: 1 },
  { key: 'cogs', label: 'COGS', opacity: 0.55 },
  { key: 'expenses', label: 'Expenses', opacity: 0.35 },
  { key: 'net', label: 'Net', opacity: 0.8 },
] as const;

export function PnLChart({ monthly }: PnLChartProps) {
  const [active, setActive] = useState<number | null>(null);

  const width = 720;
  const height = 200;
  const pad = { top: 20, right: 16, bottom: 32, left: 16 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const gap = 10;

  const chart = useMemo(() => {
    const values = monthly.flatMap((m) => [
      Number(m.cashCollectedPhp),
      Number(m.providerCogsPhp),
      Number(m.expensesPhp),
      Math.abs(Number(m.netProfitPhp)),
    ]);
    const max = Math.max(...values, 1);
    const barGroupW = monthly.length === 0 ? 0 : innerW / monthly.length;
    const barW = Math.max((barGroupW - gap) / 4, 4);

    return monthly.map((m, i) => {
      const x0 = pad.left + i * barGroupW + gap / 2;
      const series = [
        { key: 'cash', value: Number(m.cashCollectedPhp), opacity: 1 },
        { key: 'cogs', value: Number(m.providerCogsPhp), opacity: 0.55 },
        { key: 'expenses', value: Number(m.expensesPhp), opacity: 0.35 },
        { key: 'net', value: Number(m.netProfitPhp), opacity: 0.8 },
      ] as const;

      return {
        period: m.period,
        label: periodLabel(m.period),
        x0,
        bars: series.map((s, j) => {
          const h = (Math.abs(s.value) / max) * innerH;
          return {
            ...s,
            x: x0 + j * barW,
            y: pad.top + innerH - h,
            height: Math.max(h, s.value === 0 ? 0 : 2),
            width: barW - 1.5,
          };
        }),
        raw: m,
      };
    });
  }, [monthly, innerH, innerW, pad.left, pad.top]);

  const hovered = active != null ? chart[active] : null;

  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-medium text-accent">Six-month P&L</h2>
          <p className="text-xs text-neutral-400">Cash, provider COGS, expenses, and net profit</p>
        </div>
        <ul className="flex flex-wrap gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
          {SERIES.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span
                className="inline-block size-2 rounded-sm bg-accent"
                style={{ opacity: s.opacity }}
              />
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      {monthly.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">No finance history yet.</p>
      ) : (
        <div className="relative mt-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full text-accent"
            role="img"
            aria-label="Monthly profit and loss bars"
            onMouseLeave={() => setActive(null)}
          >
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={pad.top + innerH}
              y2={pad.top + innerH}
              className="stroke-neutral-200 dark:stroke-neutral-700"
              strokeWidth={1}
            />

            {chart.map((group, i) => (
              <g key={group.period}>
                {group.bars.map((bar) => (
                  <rect
                    key={bar.key}
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    fill="currentColor"
                    opacity={
                      (active == null || active === i ? 1 : 0.35) * bar.opacity
                    }
                    rx={1.5}
                  />
                ))}
                <text
                  x={group.x0 + ((group.bars[0]?.width ?? 0) * 4) / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-neutral-400"
                  fontSize={10}
                >
                  {group.label}
                </text>
                <rect
                  x={group.x0 - 2}
                  y={pad.top}
                  width={Math.max(((group.bars[0]?.width ?? 0) + 1.5) * 4 + 4, 24)}
                  height={innerH}
                  fill="transparent"
                  tabIndex={0}
                  role="listitem"
                  aria-label={`${group.label}: cash ${formatPhp(group.raw.cashCollectedPhp)}, net ${formatPhp(group.raw.netProfitPhp)}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                />
              </g>
            ))}
          </svg>

          {hovered ? (
            <div className="pointer-events-none absolute right-2 top-2 min-w-[11rem] rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-[11px] shadow-sm dark:border-neutral-700 dark:bg-neutral-950">
              <p className="font-medium text-accent">{hovered.label}</p>
              <p className="mt-1 tabular-nums text-neutral-600 dark:text-neutral-300">
                Cash {formatPhp(hovered.raw.cashCollectedPhp)}
              </p>
              <p className="tabular-nums text-neutral-600 dark:text-neutral-300">
                COGS {formatPhp(hovered.raw.providerCogsPhp)}
              </p>
              <p className="tabular-nums text-neutral-600 dark:text-neutral-300">
                Expenses {formatPhp(hovered.raw.expensesPhp)}
              </p>
              <p className="tabular-nums font-medium text-accent">
                Net {formatPhp(hovered.raw.netProfitPhp)}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
