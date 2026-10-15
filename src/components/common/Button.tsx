import React from 'react';
import { Spinner } from './Spinner';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'sm';
  loading?: boolean;
};

const variantClass = {
  primary: 'bg-accent text-white hover:brightness-95 dark:text-black',
  secondary:
    'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:text-accent dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800',
};

const sizeClass = {
  md: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-[13px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  type = 'button',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
