import Service from './Service';

const API_URL = import.meta.env.VITE_API_URL;

export type ExpenseCategory =
  | 'INFRA'
  | 'PROCESSOR_FEES'
  | 'SOFTWARE'
  | 'PEOPLE'
  | 'OTHER';

export const EXPENSE_CATEGORY_OPTIONS: Array<{ value: ExpenseCategory; label: string }> = [
  { value: 'INFRA', label: 'Infrastructure' },
  { value: 'PROCESSOR_FEES', label: 'Processor fees' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'PEOPLE', label: 'People' },
  { value: 'OTHER', label: 'Other' },
];

export type FinanceOverview = {
  period: string;
  periodStart: string;
  periodEnd: string;
  usdToPhpRate: string;
  cashCollectedPhp: string;
  usageRetailUsd: string;
  usageRetailPhp: string;
  providerCogsUsd: string;
  providerCogsPhp: string;
  expensesPhp: string;
  grossMarginPhp: string;
  netProfitPhp: string;
  requestCount: number;
};

export type FinanceMarginByPlanItem = {
  planName: string;
  cashCollectedPhp: string;
  usageRetailUsd: string;
  usageRetailPhp: string;
  providerCogsUsd: string;
  providerCogsPhp: string;
  grossMarginPhp: string;
  requestCount: number;
};

export type FinanceMarginByPlan = {
  period: string;
  usdToPhpRate: string;
  items: FinanceMarginByPlanItem[];
};

export type FinanceExpense = {
  id: string;
  category: ExpenseCategory;
  amountPhp: string;
  period: string;
  description: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FinanceExpenseList = {
  items: FinanceExpense[];
};

export type CreateFinanceExpenseInput = {
  category: ExpenseCategory;
  amountPhp: number;
  period: string;
  description: string;
  notes?: string | null;
};

export type UpdateFinanceExpenseInput = Partial<CreateFinanceExpenseInput>;

export type FinanceReconciliationRun = {
  id: string;
  kind: string;
  period: string;
  filename: string | null;
  rowCount: number;
  matchedCount: number;
  driftCount: number;
  summary: unknown;
  createdAt: string;
};

export type FinanceXenditReconciliation = {
  period: string;
  internal: {
    transactionCount: number;
    totalPhp: string;
  };
  latestRun: FinanceReconciliationRun | null;
};

export type FinanceProviderReconciliation = {
  period: string;
  usdToPhpRate: string;
  internal: {
    providers: Array<{ provider: string; amountUsd: string; amountPhp: string }>;
    totalUsd: string;
    totalPhp: string;
  };
  latestRun: FinanceReconciliationRun | null;
};

export type FinanceReconciliationUpload = {
  period: string;
  csvText: string;
  filename?: string | null;
};

/** Current UTC month as YYYY-MM. */
export function currentUtcPeriod(now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

class AdminFinanceService extends Service {
  private url(path: string) {
    return `${API_URL}/api/v1/admin/finance${path}`;
  }

  private headers(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getOverview(token: string, period: string) {
    const params = new URLSearchParams({ period });
    return this.request<FinanceOverview>(this.url(`/overview?${params}`), {
      headers: this.headers(token),
    });
  }

  async getMarginByPlan(token: string, period: string) {
    const params = new URLSearchParams({ period });
    return this.request<FinanceMarginByPlan>(this.url(`/margin-by-plan?${params}`), {
      headers: this.headers(token),
    });
  }

  async listExpenses(token: string, period?: string) {
    const params = new URLSearchParams();
    if (period) params.set('period', period);
    const qs = params.toString();
    return this.request<FinanceExpenseList>(this.url(`/expenses${qs ? `?${qs}` : ''}`), {
      headers: this.headers(token),
    });
  }

  async createExpense(token: string, body: CreateFinanceExpenseInput) {
    return this.request<FinanceExpense>(this.url('/expenses'), {
      method: 'POST',
      headers: this.headers(token),
      body: JSON.stringify(body),
    });
  }

  async updateExpense(token: string, expenseId: string, body: UpdateFinanceExpenseInput) {
    return this.request<FinanceExpense>(this.url(`/expenses/${expenseId}`), {
      method: 'PATCH',
      headers: this.headers(token),
      body: JSON.stringify(body),
    });
  }

  async getXenditReconciliation(token: string, period: string) {
    const params = new URLSearchParams({ period });
    return this.request<FinanceXenditReconciliation>(
      this.url(`/reconciliation/xendit?${params}`),
      { headers: this.headers(token) },
    );
  }

  async uploadXenditReconciliation(token: string, body: FinanceReconciliationUpload) {
    return this.request<FinanceReconciliationRun>(this.url('/reconciliation/xendit'), {
      method: 'POST',
      headers: this.headers(token),
      body: JSON.stringify(body),
    });
  }

  async getProviderReconciliation(token: string, period: string) {
    const params = new URLSearchParams({ period });
    return this.request<FinanceProviderReconciliation>(
      this.url(`/reconciliation/providers?${params}`),
      { headers: this.headers(token) },
    );
  }

  async uploadProviderReconciliation(token: string, body: FinanceReconciliationUpload) {
    return this.request<FinanceReconciliationRun>(this.url('/reconciliation/providers'), {
      method: 'POST',
      headers: this.headers(token),
      body: JSON.stringify(body),
    });
  }
}

export default new AdminFinanceService();
