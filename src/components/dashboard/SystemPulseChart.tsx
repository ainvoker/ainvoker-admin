import { useId, useMemo, useState } from 'react';
import type { AdminDashboardDailyPoint } from '../../services/AdminDashboardService';
import { dayLabel, formatCompact, formatLatency, formatNumber } from './dashboardFormat';

type SystemPulseChartProps = {
  daily: AdminDashboardDailyPoint[];
};

type HoverState = {
  index: number;
  x: number;
  y: number;
};

export function SystemPulseChart({ daily }: SystemPulseChartProps) {
  const gradId = useId().replace(/:/g, '');
  const [hover, setHover] = useState<HoverState | null>(null);

  const width = 720;
  const height = 220;
  const pad = { top: 16, right: 48, bottom: 28, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const chart = useMemo(() => {
    const maxReq = Math.max(...daily.map((d) => d.requestsUsed), 1);
    const latencyValues = daily
      .map((d) => d.p95Latency ?? d.avgLatency)
      .filter((v): v is number => v != null);
    const maxLat = Math.max(...latencyValues, 1);

    const xAt = (i: number) =>
      daily.length <= 1 ? pad.left + innerW / 2 : pad.left + (i / (daily.length - 1)) * innerW;
    const yReq = (v: number) => pad.top + innerH - (v / maxReq) * innerH;
    const yLat = (v: number) => pad.top + innerH - (v / maxLat) * innerH;

    const area =
      daily.length === 0
        ? ''
        : [
            `M ${xAt(0)} ${pad.top + innerH}`,
            ...daily.map((d, i) => `L ${xAt(i)} ${yReq(d.requestsUsed)}`),
            `L ${xAt(daily.length - 1)} ${pad.top + innerH}`,
            'Z',
          ].join(' ');

    const requestLine = daily.map((d, i) => `${xAt(i)},${yReq(d.requestsUsed)}`).join(' ');

    const latencyPts = daily
      .map((d, i) => {
        const lat = d.p95Latency ?? d.avgLatency;
        if (lat == null) return null;
        return { i, x: xAt(i), y: yLat(lat), lat };
      })
      .filter((p): p is { i: number; x: number; y: number; lat: number } => p != null);

    const latencyLine = latencyPts.map((p) => `${p.x},${p.y}`).join(' ');

    const failureMarks = daily
      .map((d, i) =>
        d.failedRequests > 0
          ? { i, x: xAt(i), y: yReq(d.requestsUsed), count: d.failedRequests }
          : null,
      )
      .filter((m): m is { i: number; x: number; y: number; count: number } => m != null);

    const xTicks =
      daily.length <= 1
        ? [{ i: 0, label: daily[0] ? dayLabel(daily[0].date) : '' }]
        : [0, Math.floor((daily.length - 1) / 2), daily.length - 1].map((i) => ({
            i,
            label: dayLabel(daily[i]!.date),
          }));

    return {
      maxReq,
      maxLat,
      area,
      requestLine,
      latencyLine,
      latencyPts,
      failureMarks,
      xTicks,
      xAt,
      yReq,
    };
  }, [daily, innerH, innerW, pad.left, pad.top]);

  const active = hover ? daily[hover.index] : null;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-medium text-accent">System pulse</h2>
          <p className="text-xs text-neutral-400">
            Daily request volume, incident marks, and p95 latency
          </p>
        </div>
        <ul className="flex flex-wrap gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
          <li className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-sm bg-accent/80" />
            Requests
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-accent" />
            Failures
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 border-t border-dashed border-accent" />
            p95 latency
          </li>
        </ul>
      </div>

      {daily.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">No traffic in this period.</p>
      ) : (
        <div className="relative mt-2 min-h-0 flex-1">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full text-accent"
            role="img"
            aria-label="Daily request volume with failure marks and latency line"
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id={`pulse-fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0.25, 0.5, 0.75, 1].map((t) => {
              const y = pad.top + innerH * (1 - t);
              return (
                <line
                  key={t}
                  x1={pad.left}
                  x2={width - pad.right}
                  y1={y}
                  y2={y}
                  className="stroke-neutral-100 dark:stroke-neutral-800"
                  strokeWidth={1}
                />
              );
            })}

            {chart.area ? (
              <path d={chart.area} fill={`url(#pulse-fill-${gradId})`} />
            ) : null}

            {daily.length > 1 ? (
              <polyline
                points={chart.requestLine}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}

            {chart.latencyPts.length > 1 ? (
              <polyline
                points={chart.latencyLine}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray="4 3"
                opacity={0.55}
              />
            ) : null}

            {chart.failureMarks.map((m) => (
              <g key={`f-${m.i}`}>
                <line
                  x1={m.x}
                  x2={m.x}
                  y1={m.y}
                  y2={pad.top + innerH}
                  stroke="currentColor"
                  strokeWidth={1}
                  opacity={0.25}
                />
                <circle cx={m.x} cy={m.y} r={3.5} fill="currentColor" />
              </g>
            ))}

            {chart.xTicks.map((t) => (
              <text
                key={t.i}
                x={chart.xAt(t.i)}
                y={height - 8}
                textAnchor="middle"
                className="fill-neutral-400"
                fontSize={10}
              >
                {t.label}
              </text>
            ))}

            <text
              x={width - pad.right + 4}
              y={pad.top + 4}
              className="fill-neutral-400"
              fontSize={9}
            >
              {formatLatency(chart.maxLat)}
            </text>
            <text x={4} y={pad.top + 4} className="fill-neutral-400" fontSize={9}>
              {formatCompact(chart.maxReq)}
            </text>

            {daily.map((d, i) => (
              <rect
                key={d.date}
                x={chart.xAt(i) - innerW / Math.max(daily.length, 1) / 2}
                y={pad.top}
                width={Math.max(innerW / Math.max(daily.length, 1), 8)}
                height={innerH}
                fill="transparent"
                onMouseEnter={() =>
                  setHover({
                    index: i,
                    x: chart.xAt(i),
                    y: chart.yReq(d.requestsUsed),
                  })
                }
                onFocus={() =>
                  setHover({
                    index: i,
                    x: chart.xAt(i),
                    y: chart.yReq(d.requestsUsed),
                  })
                }
                tabIndex={0}
                role="listitem"
                aria-label={`${dayLabel(d.date)}: ${formatNumber(d.requestsUsed)} requests, ${formatNumber(d.failedRequests)} failed, latency ${formatLatency(d.p95Latency ?? d.avgLatency)}`}
              />
            ))}

            {hover ? (
              <line
                x1={hover.x}
                x2={hover.x}
                y1={pad.top}
                y2={pad.top + innerH}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.35}
                strokeDasharray="2 2"
              />
            ) : null}
          </svg>

          {active ? (
            <div
              className="pointer-events-none absolute z-10 min-w-[10rem] rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-[11px] shadow-sm dark:border-neutral-700 dark:bg-neutral-950"
              style={{
                left: `min(calc(${((hover!.x / width) * 100).toFixed(2)}% + 8px), calc(100% - 11rem))`,
                top: 8,
              }}
            >
              <p className="font-medium text-accent">{dayLabel(active.date)}</p>
              <p className="mt-1 tabular-nums text-neutral-600 dark:text-neutral-300">
                {formatNumber(active.requestsUsed)} requests
              </p>
              <p className="tabular-nums text-neutral-600 dark:text-neutral-300">
                {formatNumber(active.failedRequests)} failed
              </p>
              <p className="tabular-nums text-neutral-600 dark:text-neutral-300">
                p95 {formatLatency(active.p95Latency ?? active.avgLatency)}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
