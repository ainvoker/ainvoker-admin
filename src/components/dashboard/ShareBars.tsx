import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type ShareBarItem = {
  id: string;
  name: string;
  value: number;
  href?: string;
  meta?: string;
};

type ShareBarsProps = {
  title: string;
  items: ShareBarItem[];
  formatValue?: (value: number) => string;
  emptyDescription?: string;
  footer?: ReactNode;
};

export function ShareBars({
  title,
  items,
  formatValue = (v) => v.toLocaleString(),
  emptyDescription = 'No mix to show yet.',
  footer,
}: ShareBarsProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const sorted = [...items].sort((a, b) => b.value - a.value).slice(0, 8);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-[15px] font-medium text-accent">{title}</h2>

      {sorted.length === 0 || total <= 0 ? (
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{emptyDescription}</p>
      ) : (
        <ul className="mt-3 flex flex-1 flex-col gap-2.5">
          {sorted.map((item) => {
            const pct = Math.round((item.value / total) * 100);
            const row = (
              <>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-accent">{item.name}</span>
                  <span className="shrink-0 tabular-nums text-neutral-500 dark:text-neutral-400">
                    {pct}% · {formatValue(item.value)}
                    {item.meta ? ` · ${item.meta}` : ''}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </>
            );
            return (
              <li key={item.id} className="space-y-1.5">
                {item.href ? (
                  <Link to={item.href} className="block space-y-1.5 rounded-md outline-offset-2">
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </li>
            );
          })}
        </ul>
      )}
      {footer ? <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">{footer}</div> : null}
    </section>
  );
}
