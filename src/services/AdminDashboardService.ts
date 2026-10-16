import Service from './Service';

const API_URL = import.meta.env.VITE_API_URL;

export type AdminDashboardDailyPoint = {
  date: string;
  requestsUsed: number;
  tokensUsed: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: string;
  avgLatency: number | null;
  p95Latency: number | null;
};

export type AdminDashboardMonthlyFinance = {
  period: string;
  cashCollectedPhp: string;
  providerCogsUsd: string;
  providerCogsPhp: string;
  expensesPhp: string;
  grossMarginPhp: string;
  netProfitPhp: string;
  usageRetailUsd: string;
  usageRetailPhp: string;
  requestCount: number;
};

export type AdminDashboardUsageTotals = {
  requests: number;
  successfulRequests: number;
  failedRequests: number;
  tokensUsed: number;
  totalCost: string;
  errorRate: number;
  avgLatency: number | null;
  p50Latency: number | null;
  p95Latency: number | null;
};

export type AdminDashboardProviderRow = {
  providerId: number;
  providerName: string;
  requestsUsed: number;
  tokensUsed: number;
  totalCost: string;
};

export type AdminDashboardNearLimitRow = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  planName: string;
  requestsUsed: number;
  requestLimit: number;
  requestsPct: number | null;
  tokensUsed: number;
  tokenLimit: number;
  tokensPct: number | null;
};

export type AdminDashboardMarginByPlanItem = {
  planName: string;
  cashCollectedPhp: string;
  usageRetailUsd: string;
  usageRetailPhp: string;
  providerCogsUsd: string;
  providerCogsPhp: string;
  grossMarginPhp: string;
  requestCount: number;
};

export type AdminDashboard = {
  period: string;
  months: number;
  periodStart: string;
  periodEnd: string;
  apiStatus: 'ok';
  usage: {
    totals: AdminDashboardUsageTotals;
    daily: AdminDashboardDailyPoint[];
    byProvider: AdminDashboardProviderRow[];
    nearLimit: AdminDashboardNearLimitRow[];
  };
  finance: {
    usdToPhpRate: string;
    overview: {
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
    monthly: AdminDashboardMonthlyFinance[];
    marginByPlan: AdminDashboardMarginByPlanItem[];
  };
};

/** Current UTC calendar month as `YYYY-MM`. */
export function currentUtcPeriod(now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

class AdminDashboardService extends Service {
  private url(path: string) {
    return `${API_URL}/api/v1/admin${path}`;
  }

  private headers(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getDashboard(token: string, period: string, months = 6) {
    const params = new URLSearchParams({
      period,
      months: String(months),
    });
    return this.request<AdminDashboard>(this.url(`/dashboard?${params}`), {
      headers: this.headers(token),
    });
  }
}

export default new AdminDashboardService();
