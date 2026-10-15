import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import AdminCatalogService, {
  type ModelFilters,
  type UpdateModelInput,
} from '../services/AdminCatalogService';

/** Service methods return `[data, error]`; React Query needs a throw to enter its error state. */
function unwrap<T>([data, err]: [T | null, string | undefined]): T {
  if (err || data === null) throw new Error(err ?? 'Request failed');
  return data;
}

export const catalogKeys = {
  providers: ['admin', 'providers'] as const,
  models: ['admin', 'models'] as const,
  modelList: (filters: ModelFilters) => ['admin', 'models', filters] as const,
};

export function useProviders() {
  const { token } = useAuth();
  return useQuery({
    queryKey: catalogKeys.providers,
    queryFn: async () => unwrap(await AdminCatalogService.listProviders(token!)),
    enabled: !!token,
  });
}

export function useModels(filters: ModelFilters) {
  const { token } = useAuth();
  return useQuery({
    queryKey: catalogKeys.modelList(filters),
    queryFn: async () => unwrap(await AdminCatalogService.listModels(token!, filters)),
    enabled: !!token,
  });
}

export function useUpdateModel() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: UpdateModelInput }) =>
      unwrap(await AdminCatalogService.updateModel(token!, id, patch)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogKeys.models }),
  });
}
