export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" role="status">
      <span className="sr-only">Loading dashboard…</span>
      <div className="h-[5.5rem] animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl bg-neutral-100 lg:col-span-2 dark:bg-neutral-800" />
        <div className="h-72 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
      </div>
      <div className="h-56 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="h-52 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-52 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
    </div>
  );
}
