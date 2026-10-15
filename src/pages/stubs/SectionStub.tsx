import { AdminPage } from '../../components/layout/AdminPage';

interface SectionStubProps {
  summary: string;
  capabilities: string[];
  endpoints: string[];
}

export function SectionStub({ summary, capabilities, endpoints }: SectionStubProps) {
  return (
    <AdminPage>
      <div className="relative max-w-3xl overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 md:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(17,17,17,0.12) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative">
          <p className="max-w-xl text-sm text-neutral-600 dark:text-neutral-300">{summary}</p>

          <h2 className="mt-6 text-sm font-semibold text-accent">What this section will do</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            {capabilities.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-neutral-400" />
                {item}
              </li>
            ))}
          </ul>

          <h2 className="mt-6 text-sm font-semibold text-accent">Backend work needed first</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            These admin endpoints don't exist on the API yet.
          </p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {endpoints.map((endpoint) => (
              <li key={endpoint}>
                <code className="rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {endpoint}
                </code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminPage>
  );
}
