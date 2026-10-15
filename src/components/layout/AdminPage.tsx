import React from 'react';
import { useLocation } from 'react-router-dom';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { HiOutlineArrowPath } from 'react-icons/hi2';
import { findSection } from '../../config/sections';

interface AdminPageProps {
  /** Controls shown left of the refresh button. */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** Page chrome for console sections: title and description come from `sections.ts`. */
export function AdminPage({ actions, children }: AdminPageProps) {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const isFetching = useIsFetching() > 0;
  const section = findSection(pathname);

  return (
    <div className="flex flex-col gap-5 animate-[hero-in_0.5s_cubic-bezier(0.22,1,0.36,1)_forwards]">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-accent md:text-2xl">
            {section?.title ?? 'AInvoker Admin'}
          </h1>
          {section?.subtitle && (
            <p className="max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">{section.subtitle}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <button
            type="button"
            onClick={() => void queryClient.refetchQueries({ type: 'active' })}
            title="Refresh data"
            aria-label="Refresh data"
            className="grid size-9 place-content-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <HiOutlineArrowPath className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
