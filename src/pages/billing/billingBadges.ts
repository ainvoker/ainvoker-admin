import { subscriptionStatusTone } from '../customers/customersBadges';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'muted';

export { subscriptionStatusTone };

export function paymentStatusTone(status: string | null | undefined): Tone {
  if (!status) return 'muted';
  if (status === 'SUCCEEDED') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'FAILED' || status === 'REFUNDED') return 'danger';
  return 'muted';
}

export function planLabel(name: string): string {
  if (name === 'free') return 'Free';
  if (name === 'pro') return 'Pro';
  if (name === 'scale') return 'Scale';
  return name;
}
