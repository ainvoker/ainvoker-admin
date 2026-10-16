import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboardService from '../services/AdminDashboardService';

function unwrap<T>([data, err]: [T | null, string | undefined]): T {
  if (err || data === null) throw new Error(err ?? 'Request failed');
  return data;
}

export const dashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  overview: (period: string, months: number) =>
    ['admin', 'dashboard', period, months] as const,
};

export function useAdminDashboard(period: string, months = 6) {
  const { token } = useAuth();
  return useQuery({
    queryKey: dashboardKeys.overview(period, months),
    queryFn: async () =>
      unwrap(await AdminDashboardService.getDashboard(token!, period, months)),
    enabled: !!token && !!period,
    placeholderData: (previous) => previous,
  });
}
