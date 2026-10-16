type Metric = {
  label: string;
  value: string;
  hint?: string;
};

export function MetricRail({ items }: { items: Metric[] }) {
  return (
    <section
      aria-label="Key metrics"
      className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={[
              'flex flex-col gap-1 px-4 py-3.5',
              index < items.length - 1
                ? 'border-b border-neutral-200/80 sm:border-b-0 sm:border-r dark:border-neutral-800'
                : '',
            ].join(' ')}
          >
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">{item.label}</p>
            <p className="text-xl font-semibold tabular-nums tracking-tight text-accent">
              {item.value}
            </p>
            {item.hint ? (
              <p className="text-[11px] text-neutral-400">{item.hint}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
