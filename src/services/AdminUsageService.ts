import Service from './Service';

const API_URL = import.meta.env.VITE_API_URL;

export type AiRequestStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REJECTED';

export type AdminUsageTotals = {
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

export type AdminUsageOrgRow = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  requestsUsed: number;
  tokensUsed: number;
  totalCost: string;
};

export type AdminUsageModelRow = {
  modelId: number;
  model: string;
  providerName: string;
  requestsUsed: number;
  tokensUsed: number;
  totalCost: string;
};

export type AdminUsageProviderRow = {
  providerId: number;
  providerName: string;
  requestsUsed: number;
  tokensUsed: number;
  totalCost: string;
};

export type AdminUsageNearLimitRow = {
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

export type AdminUsageOverview = {
  period: string;
  periodStart: string;
  periodEnd: string;
  totals: AdminUsageTotals;
  byOrganization: AdminUsageOrgRow[];
  byModel: AdminUsageModelRow[];
  byProvider: AdminUsageProviderRow[];
  nearLimit: AdminUsageNearLimitRow[];
};

export type AdminAiRequestSummary = {
  id: string;
  projectId: string;
  projectName: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  apiKeyId: string;
  apiKeyName: string;
  apiKeyPrefix: string;
  model: string;
  serviceType: string;
  requestStatus: string;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  latency: number | null;
  requestCost: string | null;
  createdAt: string;
};

export type AdminAiRequestList = {
  items: AdminAiRequestSummary[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminAiRequestDetail = AdminAiRequestSummary & {
  requestPayload: unknown;
  responsePayload: unknown | null;
};

export type AiRequestFilters = {
  q?: string;
  status?: AiRequestStatus | '';
  organizationId?: string;
  period?: string;
  limit?: number;
  offset?: number;
};

/** Current UTC calendar month as `YYYY-MM`. */
export function currentUtcPeriod(now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

class AdminUsageService extends Service {
  private url(path: string) {
    return `${API_URL}/api/v1/admin${path}`;
  }

  private headers(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getUsage(token: string, period: string) {
    const params = new URLSearchParams({ period });
    return this.request<AdminUsageOverview>(this.url(`/usage?${params}`), {
      headers: this.headers(token),
    });
  }

  async listAiRequests(token: string, filters: AiRequestFilters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.status) params.set('status', filters.status);
    if (filters.organizationId) params.set('organizationId', filters.organizationId);
    if (filters.period) params.set('period', filters.period);
    if (filters.limit != null) params.set('limit', String(filters.limit));
    if (filters.offset != null) params.set('offset', String(filters.offset));
    const qs = params.toString();
    return this.request<AdminAiRequestList>(this.url(`/ai-requests${qs ? `?${qs}` : ''}`), {
      headers: this.headers(token),
    });
  }

  async getAiRequest(token: string, requestId: string) {
    return this.request<AdminAiRequestDetail>(this.url(`/ai-requests/${requestId}`), {
      headers: this.headers(token),
    });
  }
}

export default new AdminUsageService();
