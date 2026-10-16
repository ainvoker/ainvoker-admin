import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import AdminFinanceService, {
  type CreateFinanceExpenseInput,
  type FinanceReconciliationUpload,
  type UpdateFinanceExpenseInput,
} from '../services/AdminFinanceService';

function unwrap<T>([data, err]: [T | null, string | undefined]): T {
  if (err || data === null) throw new Error(err ?? 'Request failed');
  return data;
}

export const financeKeys = {
  all: ['admin', 'finance'] as const,
  overview: (period: string) => ['admin', 'finance', 'overview', period] as const,
  marginByPlan: (period: string) => ['admin', 'finance', 'margin-by-plan', period] as const,
  expenses: (period?: string) => ['admin', 'finance', 'expenses', period ?? 'all'] as const,
  xenditRecon: (period: string) => ['admin', 'finance', 'recon', 'xendit', period] as const,
  providerRecon: (period: string) => ['admin', 'finance', 'recon', 'providers', period] as const,
};

export function useFinanceOverview(period: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: financeKeys.overview(period),
    queryFn: async () => unwrap(await AdminFinanceService.getOverview(token!, period)),
    enabled: !!token && !!period,
  });
}

export function useFinanceMarginByPlan(period: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: financeKeys.marginByPlan(period),
    queryFn: async () => unwrap(await AdminFinanceService.getMarginByPlan(token!, period)),
    enabled: !!token && !!period,
  });
}

export function useFinanceExpenses(period?: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: financeKeys.expenses(period),
    queryFn: async () => unwrap(await AdminFinanceService.listExpenses(token!, period)),
    enabled: !!token,
  });
}

export function useCreateFinanceExpense() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateFinanceExpenseInput) =>
      unwrap(await AdminFinanceService.createExpense(token!, body)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

export function useUpdateFinanceExpense() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      expenseId,
      body,
    }: {
      expenseId: string;
      body: UpdateFinanceExpenseInput;
    }) => unwrap(await AdminFinanceService.updateExpense(token!, expenseId, body)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

export function useXenditReconciliation(period: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: financeKeys.xenditRecon(period),
    queryFn: async () => unwrap(await AdminFinanceService.getXenditReconciliation(token!, period)),
    enabled: !!token && !!period,
  });
}

export function useProviderReconciliation(period: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: financeKeys.providerRecon(period),
    queryFn: async () =>
      unwrap(await AdminFinanceService.getProviderReconciliation(token!, period)),
    enabled: !!token && !!period,
  });
}

export function useUploadXenditReconciliation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: FinanceReconciliationUpload) =>
      unwrap(await AdminFinanceService.uploadXenditReconciliation(token!, body)),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.xenditRecon(vars.period) });
    },
  });
}

export function useUploadProviderReconciliation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: FinanceReconciliationUpload) =>
      unwrap(await AdminFinanceService.uploadProviderReconciliation(token!, body)),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.providerRecon(vars.period) });
    },
  });
}
