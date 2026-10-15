import type { OrganizationStatus } from '../../services/AdminCustomersService';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'muted';

export const orgStatusTone: Record<OrganizationStatus, Tone> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  DELETED: 'muted',
};

export const orgStatusLabel: Record<OrganizationStatus, string> = {
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  DELETED: 'Deleted',
};

export function subscriptionStatusTone(status: string | null | undefined): Tone {
  if (!status) return 'muted';
  if (status === 'ACTIVE') return 'success';
  if (status === 'PAST_DUE' || status === 'PENDING') return 'warning';
  return 'muted';
}

export function formatPersonName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
} | null): string {
  if (!user) return '—';
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || user.email || '—';
}
