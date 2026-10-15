import type { UpdateBusinessSettingsInput } from '../../services/AdminCatalogService';

type FieldCopy = { label: string; hint: string; info: string };

export const businessFieldCopy: Record<keyof Required<UpdateBusinessSettingsInput>, FieldCopy> = {
  economyMarkupMultiplier: {
    label: 'Economy markup',
    hint: 'Multiplier on provider prices for economy-tier text models.',
    info: 'Retail price = provider list price × this value, for both input and output tokens. 1.2 means customers pay 20% above what the provider charges. Economy models are also the ones available on the free plan.',
  },
  premiumMarkupMultiplier: {
    label: 'Premium markup',
    hint: 'Multiplier on provider prices for premium-tier text models.',
    info: 'Applies to every text model that is not economy tier. Retail price = provider list price × this value. 1.35 means a 35% margin over the provider.',
  },
  imageMarkupMultiplier: {
    label: 'Image markup',
    hint: 'Multiplier on provider prices for all image models.',
    info: 'Applies to every image model regardless of its tier. Retail price = provider list price × this value.',
  },
  quotaReferenceModelId: {
    label: 'Quota reference model',
    hint: 'One quota unit equals one token on this model at retail price.',
    info: 'Plan quotas are counted in units, not raw tokens. Each request is weighted by how its model’s retail price compares to this model’s retail price, so a model twice as expensive uses twice the quota. When unset, gpt-4o-mini is used.',
  },
  usdToPhpRate: {
    label: 'USD to PHP rate',
    hint: 'Exchange rate used to bill Scale usage in pesos.',
    info: 'Scale usage is measured in US dollars at retail prices. At the end of each billing period it is multiplied by this rate (and rounded up to the whole peso) before being drawn from the organization’s wallet.',
  },
  scaleAdvanceCentavos: {
    label: 'Scale advance (centavos)',
    hint: 'Prepaid amount that refills a Scale wallet, in centavos.',
    info: 'When a Scale organization’s usage for the period exceeds its wallet balance, it is charged the overage plus this advance, and the wallet is reset to this amount for the next period. 49900 centavos is ₱499.00.',
  },
};
