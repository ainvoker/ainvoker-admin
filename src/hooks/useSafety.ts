import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import AdminSafetyService, {
  type AdminProjectStatus,
  type ApiKeyFilters,
  type ProjectFilters,
} from '../services/AdminSafetyService';

function unwrap<T>([data, err]: [T | null, string | undefined]): T {
  if (err || data === null) throw new Error(err ?? 'Request failed');
  return data;
}

export const safetyKeys = {
  all: ['admin', 'safety'] as const,
  apiKeys: (filters: ApiKeyFilters) => ['admin', 'safety', 'api-keys', filters] as const,
  projects: (filters: ProjectFilters) => ['admin', 'safety', 'projects', filters] as const,
};

export function useAdminApiKeys(filters: ApiKeyFilters) {
  const { token } = useAuth();
  return useQuery({
    queryKey: safetyKeys.apiKeys(filters),
    queryFn: async () => unwrap(await AdminSafetyService.listApiKeys(token!, filters)),
    enabled: !!token,
  });
}

export function useRevokeApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (keyId: string) =>
      unwrap(await AdminSafetyService.revokeApiKey(token!, keyId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: safetyKeys.all });
    },
  });
}

export function useAdminProjects(filters: ProjectFilters) {
  const { token } = useAuth();
  return useQuery({
    queryKey: safetyKeys.projects(filters),
    queryFn: async () => unwrap(await AdminSafetyService.listProjects(token!, filters)),
    enabled: !!token,
  });
}

export function useUpdateProjectStatus() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      status,
    }: {
      projectId: string;
      status: AdminProjectStatus;
    }) => unwrap(await AdminSafetyService.updateProjectStatus(token!, projectId, status)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: safetyKeys.all });
    },
  });
}
