import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import AdminUsageService, { type AiRequestFilters } from '../services/AdminUsageService';

function unwrap<T>([data, err]: [T | null, string | undefined]): T {
  if (err || data === null) throw new Error(err ?? 'Request failed');
  return data;
}

export const usageKeys = {
  all: ['admin', 'usage'] as const,
  overview: (period: string) => ['admin', 'usage', 'overview', period] as const,
  requests: (filters: AiRequestFilters) => ['admin', 'usage', 'requests', filters] as const,
  request: (requestId: string) => ['admin', 'usage', 'request', requestId] as const,
};

export function useAdminUsage(period: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: usageKeys.overview(period),
    queryFn: async () => unwrap(await AdminUsageService.getUsage(token!, period)),
    enabled: !!token && !!period,
  });
}

export function useAdminAiRequests(filters: AiRequestFilters) {
  const { token } = useAuth();
  return useQuery({
    queryKey: usageKeys.requests(filters),
    queryFn: async () => unwrap(await AdminUsageService.listAiRequests(token!, filters)),
    enabled: !!token,
  });
}

export function useAdminAiRequest(requestId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: usageKeys.request(requestId ?? ''),
    queryFn: async () => unwrap(await AdminUsageService.getAiRequest(token!, requestId!)),
    enabled: !!token && !!requestId,
  });
}
