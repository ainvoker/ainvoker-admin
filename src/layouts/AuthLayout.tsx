import type { ReactNode } from 'react';
import { AdminAuthBrandPanel } from '../components/auth/AdminAuthBrandPanel';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-white font-sans text-accent selection:bg-[#dddddd] md:justify-start">
      <div className="mx-6 my-10 flex w-full max-w-96 flex-col justify-center gap-3 sm:mx-12">{children}</div>
      <AdminAuthBrandPanel />
    </div>
  );
}
