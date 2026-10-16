import Service from './Service';

const API_URL = import.meta.env.VITE_API_URL;

export type ApiKeyStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'DISABLED';
export type AdminProjectStatus = 'ACTIVE' | 'DISABLED';

export type AdminApiKeyItem = {
  id: string;
  keyName: string;
  keyPrefix: string;
  status: string;
  clientType: string;
  lastUsed: string | null;
  createdAt: string;
  projectId: string;
  projectName: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
};

export type AdminApiKeyList = {
  items: AdminApiKeyItem[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminProjectItem = {
  id: string;
  name: string;
  environment: string;
  status: string;
  apiKeyCount: number;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
};

export type AdminProjectList = {
  items: AdminProjectItem[];
  total: number;
  limit: number;
  offset: number;
};

export type ApiKeyFilters = {
  q?: string;
  status?: ApiKeyStatus | '';
  limit?: number;
  offset?: number;
};

export type ProjectFilters = {
  q?: string;
  status?: ProjectStatus | '';
  limit?: number;
  offset?: number;
};

class AdminSafetyService extends Service {
  private url(path: string) {
    return `${API_URL}/api/v1/admin${path}`;
  }

  private headers(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async listApiKeys(token: string, filters: ApiKeyFilters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.status) params.set('status', filters.status);
    if (filters.limit != null) params.set('limit', String(filters.limit));
    if (filters.offset != null) params.set('offset', String(filters.offset));
    const qs = params.toString();
    return this.request<AdminApiKeyList>(this.url(`/api-keys${qs ? `?${qs}` : ''}`), {
      headers: this.headers(token),
    });
  }

  async revokeApiKey(token: string, keyId: string) {
    return this.request<AdminApiKeyItem>(this.url(`/api-keys/${keyId}/revoke`), {
      method: 'POST',
      headers: this.headers(token),
    });
  }

  async listProjects(token: string, filters: ProjectFilters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.status) params.set('status', filters.status);
    if (filters.limit != null) params.set('limit', String(filters.limit));
    if (filters.offset != null) params.set('offset', String(filters.offset));
    const qs = params.toString();
    return this.request<AdminProjectList>(this.url(`/projects${qs ? `?${qs}` : ''}`), {
      headers: this.headers(token),
    });
  }

  async updateProjectStatus(token: string, projectId: string, status: AdminProjectStatus) {
    return this.request<AdminProjectItem>(this.url(`/projects/${projectId}`), {
      method: 'PATCH',
      headers: this.headers(token),
      body: JSON.stringify({ status }),
    });
  }
}

export default new AdminSafetyService();
