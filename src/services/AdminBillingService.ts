import Service from './Service';

const API_URL = import.meta.env.VITE_API_URL;

export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
export type PlanName = 'free' | 'pro' | 'scale';

export type AdminOrgRef = {
  id: string;
  name: string;
  slug: string;
};

export type AdminPlan = {
  id: number;
  name: string;
  monthlyPrice: string;
  /** e.g. "per month" or "wallet advance" — clarifies Scale vs Pro. */
  priceNote: string | null;
  tokenLimit: number;
  requestLimit: number;
  billingMode: string;
  description: string | null;
};

export type AdminSubscriptionItem = {
  id: string;
  organization: AdminOrgRef;
  planName: string;
  status: string;
  startedAt: string;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  xenditRecurringPlanId: string | null;
  updatedAt: string;
};

export type AdminSubscriptionList = {
  items: AdminSubscriptionItem[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminTransactionItem = {
  id: string;
  amount: string;
  paymentMethod: string;
  referenceNumber: string;
  paymentStatus: string;
  description: string | null;
  receiptUrl: string | null;
  createdAt: string;
  organization: AdminOrgRef;
  planName: string;
  subscriptionId: string;
};

export type AdminTransactionList = {
  items: AdminTransactionItem[];
  total: number;
  limit: number;
  offset: number;
};

export type SubscriptionFilters = {
  q?: string;
  status?: SubscriptionStatus;
  plan?: PlanName;
  limit?: number;
  offset?: number;
};

export type TransactionFilters = {
  q?: string;
  paymentStatus?: PaymentStatus;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type UpdateSubscriptionInput =
  | { action: 'cancel'; atPeriodEnd?: boolean }
  | { action: 'grant_pro'; expiresAt?: string }
  | { action: 'extend_pro'; days: number };

class AdminBillingService extends Service {
  private url(path: string) {
    return `${API_URL}/api/v1/admin${path}`;
  }

  private headers(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async listPlans(token: string) {
    return this.request<AdminPlan[]>(this.url('/plans'), {
      headers: this.headers(token),
    });
  }

  async listSubscriptions(token: string, filters: SubscriptionFilters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.status) params.set('status', filters.status);
    if (filters.plan) params.set('plan', filters.plan);
    if (filters.limit != null) params.set('limit', String(filters.limit));
    if (filters.offset != null) params.set('offset', String(filters.offset));
    const qs = params.toString();
    return this.request<AdminSubscriptionList>(this.url(`/subscriptions${qs ? `?${qs}` : ''}`), {
      headers: this.headers(token),
    });
  }

  async listTransactions(token: string, filters: TransactionFilters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.limit != null) params.set('limit', String(filters.limit));
    if (filters.offset != null) params.set('offset', String(filters.offset));
    const qs = params.toString();
    return this.request<AdminTransactionList>(this.url(`/transactions${qs ? `?${qs}` : ''}`), {
      headers: this.headers(token),
    });
  }

  async updateSubscription(token: string, subscriptionId: string, body: UpdateSubscriptionInput) {
    return this.request<AdminSubscriptionItem>(this.url(`/subscriptions/${subscriptionId}`), {
      method: 'PATCH',
      headers: this.headers(token),
      body: JSON.stringify(body),
    });
  }
}

export default new AdminBillingService();
