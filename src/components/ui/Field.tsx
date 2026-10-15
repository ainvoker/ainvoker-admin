import React from 'react';
import { InfoTooltip } from './InfoTooltip';

export const controlClass =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-accent placeholder:text-neutral-400 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-neutral-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-900 dark:placeholder:text-neutral-500 dark:focus-visible:ring-neutral-700';

export function controlBorder(error?: string) {
  return error
    ? 'border-red-400 dark:border-red-500/70'
    : 'border-neutral-200 focus:border-neutral-400 dark:border-neutral-700 dark:focus:border-neutral-500';
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  /** Longer explanation shown in a tooltip beside the label. */
  info?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, htmlFor, hint, info, error, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      {info && <InfoTooltip label={label}>{info}</InfoTooltip>}
    </div>
    {children}
    {error ? (
      <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
    ) : (
      hint && <p className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
    )}
  </div>
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
};

export const TextInput: React.FC<InputProps> = ({ error, className = '', ...props }) => (
  <input className={`${controlClass} ${controlBorder(error)} ${className}`} {...props} />
);
