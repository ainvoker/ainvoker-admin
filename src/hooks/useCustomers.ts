import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import AdminCustomersService, {
  type OrganizationFilters,
  type UserFilters,
} from '../services/AdminCustomersService';

/** Service methods return `[data, error]`; React Query needs a throw to enter its error state. */
function unwrap<T>([data, err]: [T | null, string | undefined]): T {
  if (err || data === null) throw new Error(err ?? 'Request failed');
  return data;
}

export const customerKeys = {
  organizations: ['admin', 'organizations'] as const,
  organizationList: (filters: OrganizationFilters) =>
    ['admin', 'organizations', 'list', filters] as const,
  organization: (orgId: string) => ['admin', 'organizations', orgId] as const,
  users: ['admin', 'users'] as const,
  userList: (filters: UserFilters) => ['admin', 'users', 'list', filters] as const,
  user: (userId: string) => ['admin', 'users', userId] as const,
};

export function useOrganizations(filters: OrganizationFilters) {
  const { token } = useAuth();
  return useQuery({
    queryKey: customerKeys.organizationList(filters),
    queryFn: async () => unwrap(await AdminCustomersService.listOrganizations(token!, filters)),
    enabled: !!token,
  });
}

export function useOrganization(orgId: string | undefined) {
  const { token } = useAuth();
  return useQuery({
    queryKey: customerKeys.organization(orgId ?? ''),
    queryFn: async () => unwrap(await AdminCustomersService.getOrganization(token!, orgId!)),
    enabled: !!token && !!orgId,
  });
}

export function useUpdateOrganizationStatus() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, status }: { orgId: string; status: 'ACTIVE' | 'SUSPENDED' }) =>
      unwrap(await AdminCustomersService.updateOrganizationStatus(token!, orgId, status)),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.organizations });
      queryClient.setQueryData(customerKeys.organization(data.id), data);
    },
  });
}

export function useUsers(filters: UserFilters) {
  const { token } = useAuth();
  return useQuery({
    queryKey: customerKeys.userList(filters),
    queryFn: async () => unwrap(await AdminCustomersService.listUsers(token!, filters)),
    enabled: !!token,
  });
}

export function useUser(userId: string | undefined) {
  const { token } = useAuth();
  return useQuery({
    queryKey: customerKeys.user(userId ?? ''),
    queryFn: async () => unwrap(await AdminCustomersService.getUser(token!, userId!)),
    enabled: !!token && !!userId,
  });
}
