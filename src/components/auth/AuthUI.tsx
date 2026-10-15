import React from 'react';
import Mark from '../../assets/mark.svg';
import AuthLayout from '../../layouts/AuthLayout';
import AuthService from '../../services/AuthService';
import { Spinner } from '../common/Spinner';

export const AuthShell: React.FC<{ title: string; subtitle?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <AuthLayout>
    <div className="mb-4 flex items-center gap-2 md:hidden">
      <img src={Mark} alt="" className="h-5 invert" />
      <span className="text-sm font-semibold tracking-tight">AInvoker</span>
      <span className="text-sm text-neutral-400">Admin</span>
    </div>
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    <div className="mt-3">{children}</div>
  </AuthLayout>
);

type AuthFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
};

/** Mirrors the client's InputGroup: the label sits inside the box and turns into the error message. */
export const AuthField: React.FC<AuthFieldProps> = ({ label, error, id, className = '', ...props }) => {
  const inputId = id ?? props.name;
  return (
    <div
      className={`overflow-hidden rounded-lg border transition-colors focus-within:border-gray-500 ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
      }`}
    >
      <label
        htmlFor={inputId}
        className={`block cursor-text px-4 pt-2 text-xs font-medium ${error ? 'text-red-500' : 'text-gray-800'}`}
      >
        {error ?? label}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error || undefined}
        className={`w-full bg-transparent px-4 pb-2 text-base outline-none placeholder:text-gray-400 ${
          error ? 'text-red-500' : 'text-gray-700'
        } ${className}`}
        {...props}
      />
    </div>
  );
};

const oauthButtonClass =
  'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400';

export const OAuthButtons: React.FC<{ callbackPath: '/login' | '/signup' }> = ({ callbackPath }) => {
  const callbackURL = `${window.location.origin}${callbackPath}`;
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className={oauthButtonClass}
        onClick={() => void AuthService.signinWithProvider({ provider: 'google', callbackURL })}
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="size-5" alt="" />
        Continue with Google
      </button>
      <button
        type="button"
        className={oauthButtonClass}
        onClick={() => void AuthService.signinWithProvider({ provider: 'github', callbackURL })}
      >
        <svg className="size-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.58 2 12.29c0 4.52 2.87 8.37 6.84 9.73.5.1.66-.22.66-.48 0-.24-.01-1.04-.01-1.88-2.48.55-3.01-1.06-3.01-1.06-.45-1.16-1.1-1.47-1.1-1.47-.9-.63.07-.62.07-.62 1 .07 1.52 1.03 1.52 1.03.88 1.57 2.3 1.12 2.86.85.09-.65.34-1.12.62-1.37-1.98-.23-4.06-1-4.06-4.45 0-.98.35-1.78.92-2.41-.09-.23-.4-1.17.09-2.43 0 0 .75-.24 2.46.92a8.44 8.44 0 0 1 2.24-.31c.76 0 1.53.11 2.24.31 1.7-1.16 2.46-.92 2.46-.92.49 1.26.18 2.2.09 2.43.57.63.92 1.43.92 2.41 0 3.47-2.08 4.22-4.06 4.45.35.3.66.89.66 1.8 0 1.3-.01 2.34-.01 2.66 0 .26.16.58.66.48 3.98-1.36 6.84-5.21 6.84-9.73C22 6.58 17.52 2 12 2Z" />
        </svg>
        Continue with GitHub
      </button>
    </div>
  );
};

export const OrDivider: React.FC = () => (
  <div className="relative my-4">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="bg-white px-2 text-gray-500">or</span>
    </div>
  </div>
);

export const FullScreenLoader: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-white" role="status" aria-label="Loading">
    <Spinner className="text-neutral-400" />
  </div>
);
