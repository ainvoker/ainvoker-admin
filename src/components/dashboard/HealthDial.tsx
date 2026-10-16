type HealthDialProps = {
  percent: number | null;
  detail?: string;
  className?: string;
};

export function HealthDial({ percent, detail, className }: HealthDialProps) {
  const r = 54;
  const cx = 64;
  const cy = 64;
  const stroke = 8;
  const circumference = Math.PI * r;
  const value = percent == null ? 0 : Math.min(100, Math.max(0, percent));
  const dash = (value / 100) * circumference;

  return (
    <section
      className={[
        'flex h-full flex-col items-center rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h2 className="self-start text-[15px] font-medium text-accent">Reliability</h2>
      <div className="relative mt-3">
        <svg
          viewBox="0 0 128 80"
          className="h-24 w-40 text-accent"
          role="img"
          aria-label={percent == null ? 'No success rate yet' : `${percent}% success`}
        >
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            className="text-neutral-100 dark:text-neutral-800"
          />
          {percent != null ? (
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          ) : null}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 text-center">
          <p className="text-2xl font-semibold tabular-nums text-accent">
            {percent == null ? '—' : `${percent}%`}
          </p>
        </div>
      </div>
      {detail ? (
        <p className="mt-1 text-center text-xs text-neutral-400">{detail}</p>
      ) : null}
    </section>
  );
}
