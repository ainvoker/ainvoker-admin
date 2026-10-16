import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import AdminBillingService, {
  type SubscriptionFilters,
  type TransactionFilters,
  type UpdateSubscriptionInput,
} from '../services/AdminBillingService';
import { customerKeys } from './useCustomers';

/** Service methods return `[data, error]`; React Query needs a throw to enter its error state. */
function unwrap<T>([data, err]: [T | null, string | undefined]): T {
  if (err || data === null) throw new Error(err ?? 'Request failed');
  return data;
}

export const billingKeys = {
  all: ['admin', 'billing'] as const,
  plans: ['admin', 'billing', 'plans'] as const,
  subscriptions: ['admin', 'billing', 'subscriptions'] as const,
  subscriptionList: (filters: SubscriptionFilters) =>
    ['admin', 'billing', 'subscriptions', 'list', filters] as const,
  transactions: ['admin', 'billing', 'transactions'] as const,
  transactionList: (filters: TransactionFilters) =>
    ['admin', 'billing', 'transactions', 'list', filters] as const,
};

export function usePlans() {
  const { token } = useAuth();
  return useQuery({
    queryKey: billingKeys.plans,
    queryFn: async () => unwrap(await AdminBillingService.listPlans(token!)),
    enabled: !!token,
  });
}

export function useSubscriptions(filters: SubscriptionFilters) {
  const { token } = useAuth();
  return useQuery({
    queryKey: billingKeys.subscriptionList(filters),
    queryFn: async () => unwrap(await AdminBillingService.listSubscriptions(token!, filters)),
    enabled: !!token,
  });
}

export function useTransactions(filters: TransactionFilters) {
  const { token } = useAuth();
  return useQuery({
    queryKey: billingKeys.transactionList(filters),
    queryFn: async () => unwrap(await AdminBillingService.listTransactions(token!, filters)),
    enabled: !!token,
  });
}

export function usePatchSubscription() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subscriptionId,
      body,
    }: {
      subscriptionId: string;
      body: UpdateSubscriptionInput;
    }) => unwrap(await AdminBillingService.updateSubscription(token!, subscriptionId, body)),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: billingKeys.subscriptions });
      void queryClient.invalidateQueries({ queryKey: billingKeys.transactions });
      void queryClient.invalidateQueries({ queryKey: customerKeys.organizations });
      void queryClient.invalidateQueries({
        queryKey: customerKeys.organization(data.organization.id),
      });
    },
  });
}
