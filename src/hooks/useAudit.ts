import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import AdminAuditService, { type AuditFilters } from '../services/AdminAuditService';

function unwrap<T>([data, err]: [T | null, string | undefined]): T {
  if (err || data === null) throw new Error(err ?? 'Request failed');
  return data;
}

export const auditKeys = {
  all: ['admin', 'audit'] as const,
  list: (filters: AuditFilters) => ['admin', 'audit', 'list', filters] as const,
};

export function useAuditEvents(filters: AuditFilters) {
  const { token } = useAuth();
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: async () => unwrap(await AdminAuditService.listEvents(token!, filters)),
    enabled: !!token,
  });
}
