import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import AdminCatalogService, {
  type BusinessSettings,
  type UpdateBusinessSettingsInput,
} from '../../services/AdminCatalogService';
import { catalogKeys, useModels } from '../../hooks/useCatalog';
import { AdminPage } from '../../components/layout/AdminPage';
import { Button } from '../../components/common/Button';
import { Field, TextInput } from '../../components/ui/Field';
import { Select } from '../../components/ui/Select';
import { businessFieldCopy } from './businessFieldCopy';

type NumericKey = Exclude<keyof UpdateBusinessSettingsInput, 'quotaReferenceModelId'>;

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const php = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export default function BusinessPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const modelsQuery = useModels({});
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [form, setForm] = useState<UpdateBusinessSettingsInput>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    void AdminCatalogService.getBusinessSettings(token).then(([data, err]) => {
      if (err || !data) {
        setError(err ?? 'Failed to load');
        setLoading(false);
        return;
      }
      setSettings(data);
      setForm({
        economyMarkupMultiplier: Number(data.economyMarkupMultiplier),
        premiumMarkupMultiplier: Number(data.premiumMarkupMultiplier),
        imageMarkupMultiplier: Number(data.imageMarkupMultiplier),
        usdToPhpRate: Number(data.usdToPhpRate),
        quotaReferenceModelId: data.quotaReferenceModelId,
        scaleAdvanceCentavos: data.scaleAdvanceCentavos,
      });
      setLoading(false);
    });
  }, [token]);

  const referenceOptions = useMemo(
    () =>
      (modelsQuery.data ?? [])
        .filter((m) => m.status === 'ACTIVE' || m.id === form.quotaReferenceModelId)
        .sort((a, b) => a.slug.localeCompare(b.slug)),
    [modelsQuery.data, form.quotaReferenceModelId],
  );

  const save = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    setSaved(null);
    const [data, err] = await AdminCatalogService.updateBusinessSettings(token, form);
    setSaving(false);
    if (err || !data) {
      setError(err ?? 'Save failed');
      return;
    }
    setSettings(data.settings);
    setSaved(`Saved. Recomputed retail on ${data.modelsUpdated} models.`);
    void queryClient.invalidateQueries({ queryKey: catalogKeys.models });
  };

  const numberField = (key: NumericKey, step: string, extraHint?: ReactNode) => {
    const copy = businessFieldCopy[key];
    return (
      <Field
        label={copy.label}
        htmlFor={key}
        info={copy.info}
        hint={
          <>
            {copy.hint}
            {extraHint && <span className="block text-neutral-400 dark:text-neutral-500">{extraHint}</span>}
          </>
        }
      >
        <TextInput
          id={key}
          type="number"
          min={0}
          step={step}
          value={form[key] ?? ''}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              [key]: e.target.value === '' ? undefined : Number(e.target.value),
            }))
          }
        />
      </Field>
    );
  };

  const markupExample = (key: NumericKey) => {
    const value = form[key];
    return value && value > 0 ? `e.g. ${usd.format(1)} provider → ${usd.format(value)} retail per 1M tokens` : undefined;
  };

  const advance = form.scaleAdvanceCentavos;

  return (
    <AdminPage>
      {loading && <p className="text-sm text-neutral-500">Loading…</p>}
      {!loading && !settings && error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && settings && (
        <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid xl:grid-cols-[1fr_300px]">
            <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
              <Section
                title="Retail markups"
                description="How much above the provider's list price customers pay for each kind of model."
              >
                <div className="grid gap-x-5 gap-y-4 md:grid-cols-3">
                  {numberField('economyMarkupMultiplier', '0.01', markupExample('economyMarkupMultiplier'))}
                  {numberField('premiumMarkupMultiplier', '0.01', markupExample('premiumMarkupMultiplier'))}
                  {numberField('imageMarkupMultiplier', '0.01', markupExample('imageMarkupMultiplier'))}
                </div>
              </Section>

              <Section
                title="Quota and Scale billing"
                description="How plan quota is counted, and how Scale organizations are charged in pesos."
              >
                <div className="grid gap-x-5 gap-y-4 md:grid-cols-3">
                  <Field
                    label={businessFieldCopy.quotaReferenceModelId.label}
                    htmlFor="quotaReferenceModelId"
                    hint={businessFieldCopy.quotaReferenceModelId.hint}
                    info={businessFieldCopy.quotaReferenceModelId.info}
                  >
                    <Select
                      id="quotaReferenceModelId"
                      value={form.quotaReferenceModelId ?? ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          quotaReferenceModelId: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    >
                      <option value="">Default (gpt-4o-mini)</option>
                      {referenceOptions.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.slug}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  {numberField(
                    'usdToPhpRate',
                    '0.0001',
                    form.usdToPhpRate ? `${usd.format(1)} = ${php.format(form.usdToPhpRate)}` : undefined,
                  )}
                  {numberField(
                    'scaleAdvanceCentavos',
                    '1',
                    advance ? `${advance.toLocaleString('en-US')} centavos = ${php.format(advance / 100)}` : undefined,
                  )}
                </div>
              </Section>
            </div>

            <aside className="space-y-4 border-t border-neutral-200/80 bg-neutral-50/60 p-5 text-xs text-neutral-600 xl:border-l xl:border-t-0 dark:border-neutral-800 dark:bg-neutral-950/30 dark:text-neutral-400">
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-accent">What happens on save</h3>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Every model's retail input and output price is recalculated from its provider price and the matching markup.</li>
                  <li>Quota usage and Scale billing pick up the new values on the next request or billing close.</li>
                  <li>Past requests keep the cost they were charged.</li>
                </ul>
              </div>
              <p className="rounded-lg border border-neutral-200 bg-white px-3 py-2 font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                Retail = provider price × markup
              </p>
              <p>Last updated {dateFormat.format(new Date(settings.updatedAt))}</p>
            </aside>
          </div>

          <div className="flex flex-col gap-3 border-t border-neutral-200/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
            <div className="text-sm" aria-live="polite">
              {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
              {saved && <p className="text-green-700 dark:text-green-400">{saved}</p>}
            </div>
            <Button size="sm" disabled={saving} onClick={() => void save()}>
              {saving ? 'Saving…' : 'Save and recompute retail'}
            </Button>
          </div>
        </div>
      )}
    </AdminPage>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 p-5">
      <div>
        <h2 className="text-sm font-semibold text-accent">{title}</h2>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
      </div>
      {children}
    </section>
  );
}
