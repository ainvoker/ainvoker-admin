import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatAppUserName } from '../services/UserService';

export default function AdminLayout() {
  const { user, appBootstrap, signout } = useAuth();
  const { resolvedTheme } = useTheme();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDark = resolvedTheme === 'dark';

  const userName = formatAppUserName(appBootstrap?.user) || user?.name || 'Admin';
  const userEmail = appBootstrap?.user.email ?? user?.email ?? '';
  const userAvatar = appBootstrap?.user.profilePicture ?? user?.image ?? undefined;

  return (
    <div
      className={[
        'flex h-svh overflow-hidden bg-[#f4f4f5] font-sans text-accent selection:bg-[#dddddd] selection:text-accent',
        isDark ? 'dark bg-neutral-950 dark:selection:bg-neutral-700' : '',
      ].join(' ')}
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <Sidebar
        open={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
        onSignOut={() => {
          queryClient.clear();
          void signout();
        }}
      />

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pt-14 md:pt-0">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 opacity-40 dark:opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 100% -10%, rgba(17,17,17,0.06), transparent), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(17,17,17,0.04), transparent)',
          }}
        />
        <div className="w-full p-4 md:p-5 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
