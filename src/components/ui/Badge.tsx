import React from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'muted';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  danger: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  muted: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
};

export const Badge: React.FC<{ tone?: Tone; title?: string; children: React.ReactNode }> = ({
  tone = 'neutral',
  title,
  children,
}) => (
  <span
    title={title}
    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${toneClasses[tone]}`}
  >
    {children}
  </span>
);
