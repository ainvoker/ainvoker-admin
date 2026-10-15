import Service from './Service';

const API_URL = import.meta.env.VITE_API_URL;

export type OrganizationStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export type AdminUserSummary = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

export type AdminSubscriptionSnapshot = {
  id: string;
  status: string;
  planName: string;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
} | null;

export type AdminOrganizationListItem = {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  isPersonal: boolean;
  owner: AdminUserSummary | null;
  memberCount: number;
  planName: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrganizationList = {
  items: AdminOrganizationListItem[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminOrganizationDetail = {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  isPersonal: boolean;
  owner: AdminUserSummary | null;
  memberCount: number;
  subscription: AdminSubscriptionSnapshot;
  projects: Array<{
    id: string;
    name: string;
    environment: string;
    status: string;
    apiKeyCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
  apiKeys: Array<{
    id: string;
    projectId: string;
    projectName: string;
    keyName: string;
    keyPrefix: string;
    status: string;
    clientType: string;
    lastUsed: string | null;
    createdAt: string;
  }>;
  invites: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserListItem = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  isPlatformAdmin: boolean;
  membershipCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserList = {
  items: AdminUserListItem[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminUserDetail = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  themePreference: 'LIGHT' | 'DARK' | 'DEVICE';
  freeQuotaUnitsUsed: number;
  freeQuotaUnitsLimit: number;
  isPlatformAdmin: boolean;
  memberships: Array<{
    id: string;
    role: string;
    organization: {
      id: string;
      name: string;
      slug: string;
      status: OrganizationStatus;
      isPersonal: boolean;
      createdAt: string;
    };
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationFilters = {
  q?: string;
  status?: OrganizationStatus;
  limit?: number;
  offset?: number;
};

export type UserFilters = {
  q?: string;
  limit?: number;
  offset?: number;
};

class AdminCustomersService extends Service {
  private url(path: string) {
    return `${API_URL}/api/v1/admin${path}`;
  }

  private headers(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async listOrganizations(token: string, filters: OrganizationFilters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.status) params.set('status', filters.status);
    if (filters.limit != null) params.set('limit', String(filters.limit));
    if (filters.offset != null) params.set('offset', String(filters.offset));
    const qs = params.toString();
    return this.request<AdminOrganizationList>(this.url(`/organizations${qs ? `?${qs}` : ''}`), {
      headers: this.headers(token),
    });
  }

  async getOrganization(token: string, orgId: string) {
    return this.request<AdminOrganizationDetail>(this.url(`/organizations/${orgId}`), {
      headers: this.headers(token),
    });
  }

  async updateOrganizationStatus(token: string, orgId: string, status: 'ACTIVE' | 'SUSPENDED') {
    return this.request<AdminOrganizationDetail>(this.url(`/organizations/${orgId}`), {
      method: 'PATCH',
      headers: this.headers(token),
      body: JSON.stringify({ status }),
    });
  }

  async listUsers(token: string, filters: UserFilters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.limit != null) params.set('limit', String(filters.limit));
    if (filters.offset != null) params.set('offset', String(filters.offset));
    const qs = params.toString();
    return this.request<AdminUserList>(this.url(`/users${qs ? `?${qs}` : ''}`), {
      headers: this.headers(token),
    });
  }

  async getUser(token: string, userId: string) {
    return this.request<AdminUserDetail>(this.url(`/users/${userId}`), {
      headers: this.headers(token),
    });
  }
}

export default new AdminCustomersService();
