import Service from './Service';

const API_URL = import.meta.env.VITE_API_URL;

export type AuditActorType = 'USER' | 'PLATFORM_ADMIN';

export const AUDIT_ACTION_OPTIONS = [
  { value: 'user.created', label: 'Account created' },
  { value: 'organization.created', label: 'Workspace created' },
  { value: 'organization.updated', label: 'Workspace updated' },
  { value: 'organization.deleted', label: 'Workspace deleted' },
  { value: 'organization.suspended', label: 'Workspace suspended' },
  { value: 'organization.reinstated', label: 'Workspace reinstated' },
  { value: 'project.created', label: 'Project created' },
  { value: 'project.updated', label: 'Project updated' },
  { value: 'project.deleted', label: 'Project deleted' },
  { value: 'project.disabled', label: 'Project disabled' },
  { value: 'project.reenabled', label: 'Project re-enabled' },
  { value: 'api_key.revoked', label: 'API key revoked' },
  { value: 'subscription.grant_pro', label: 'Granted Pro' },
  { value: 'subscription.extend_pro', label: 'Extended Pro' },
  { value: 'subscription.cancel', label: 'Canceled subscription' },
  { value: 'business_settings.updated', label: 'Business settings' },
  { value: 'model.updated', label: 'Model updated' },
] as const;

export type AuditAction = (typeof AUDIT_ACTION_OPTIONS)[number]['value'];

export type AdminAuditActor = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

export type AdminAuditEventItem = {
  id: string;
  actorUserId: string | null;
  actorType: AuditActorType;
  actor: AdminAuditActor | null;
  action: string;
  targetType: string;
  targetId: string | null;
  organizationId: string | null;
  summary: string;
  metadata: unknown;
  createdAt: string;
};

export type AdminAuditEventList = {
  items: AdminAuditEventItem[];
  total: number;
  limit: number;
  offset: number;
};

export type AuditFilters = {
  q?: string;
  action?: AuditAction | '';
  actorType?: AuditActorType | '';
  organizationId?: string;
  limit?: number;
  offset?: number;
};

class AdminAuditService extends Service {
  private url(path: string) {
    return `${API_URL}/api/v1/admin${path}`;
  }

  private headers(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async listEvents(token: string, filters: AuditFilters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.action) params.set('action', filters.action);
    if (filters.actorType) params.set('actorType', filters.actorType);
    if (filters.organizationId) params.set('organizationId', filters.organizationId);
    if (filters.limit != null) params.set('limit', String(filters.limit));
    if (filters.offset != null) params.set('offset', String(filters.offset));
    const qs = params.toString();
    return this.request<AdminAuditEventList>(this.url(`/audit-events${qs ? `?${qs}` : ''}`), {
      headers: this.headers(token),
    });
  }
}

export default new AdminAuditService();
