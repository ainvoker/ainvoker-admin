export const phpFormat = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

export const usdFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export function formatPhp(amount: string | number) {
  const n = typeof amount === 'number' ? amount : Number(amount);
  if (Number.isNaN(n)) return String(amount);
  return phpFormat.format(n);
}

export function formatUsd(amount: string | number) {
  const n = typeof amount === 'number' ? amount : Number(amount);
  if (Number.isNaN(n)) return String(amount);
  return usdFormat.format(n);
}

export function planLabel(name: string) {
  if (name === 'free') return 'Free';
  if (name === 'pro') return 'Pro';
  if (name === 'scale') return 'Scale';
  return name;
}

export function expenseCategoryLabel(category: string) {
  switch (category) {
    case 'INFRA':
      return 'Infrastructure';
    case 'PROCESSOR_FEES':
      return 'Processor fees';
    case 'SOFTWARE':
      return 'Software';
    case 'PEOPLE':
      return 'People';
    case 'OTHER':
      return 'Other';
    default:
      return category;
  }
}
