import { useMemo, useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare } from 'react-icons/hi2';
import { useModels, useProviders } from '../../hooks/useCatalog';
import type { AdminModel, CatalogStatus, ModelFilters } from '../../services/AdminCatalogService';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { TextInput } from '../../components/ui/Field';
import { Button } from '../../components/common/Button';
import { AdminPage } from '../../components/layout/AdminPage';
import { ModelEditDialog } from './ModelEditDialog';

const priceFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const statusTone: Record<CatalogStatus, 'success' | 'muted' | 'warning'> = {
  ACTIVE: 'success',
  INACTIVE: 'muted',
  DEPRECATED: 'warning',
};
const statusLabel: Record<CatalogStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DEPRECATED: 'Deprecated',
};

export default function ModelsPage() {
  const [filters, setFilters] = useState<ModelFilters>({});
  const [search, setSearch] = useState('');
  const [editModel, setEditModel] = useState<AdminModel | null>(null);

  const providersQuery = useProviders();
  const modelsQuery = useModels(filters);
  const providers = providersQuery.data ?? [];

  const visibleModels = useMemo(() => {
    const term = search.trim().toLowerCase();
    const models = modelsQuery.data ?? [];
    return term ? models.filter((m) => m.slug.toLowerCase().includes(term)) : models;
  }, [modelsQuery.data, search]);

  const hasFilters = !!(filters.type || filters.status || filters.providerId || search);

  return (
    <AdminPage>
      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200/80 p-3 dark:border-neutral-800">
          <div className="relative w-full sm:w-64">
            <HiOutlineMagnifyingGlass
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
            />
            <TextInput
              aria-label="Search models"
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-1.5 pl-8 text-[13px]"
            />
          </div>
          <Select
            aria-label="Filter by provider"
            className="w-40"
            value={filters.providerId ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, providerId: e.target.value ? Number(e.target.value) : undefined }))
            }
          >
            <option value="">All providers</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
          <Select
            aria-label="Filter by type"
            className="w-32"
            value={filters.type ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, type: (e.target.value || undefined) as ModelFilters['type'] }))
            }
          >
            <option value="">All types</option>
            <option value="TEXT">Text</option>
            <option value="IMAGE">Image</option>
          </Select>
          <Select
            aria-label="Filter by status"
            className="w-36"
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: (e.target.value || undefined) as CatalogStatus | undefined }))
            }
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DEPRECATED">Deprecated</option>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-[13px]">
            <thead className="text-xs text-neutral-500 dark:text-neutral-400">
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800">
                <th scope="col" className="px-4 py-2.5 font-medium">Model</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Tier</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Provider in/out</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Retail in/out</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Updated</th>
                <th scope="col" className="px-3 py-2.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {modelsQuery.isPending &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                    </td>
                  </tr>
                ))}

              {modelsQuery.isError && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-accent">Couldn&apos;t load models</p>
                    <Button variant="secondary" size="sm" className="mt-4" onClick={() => void modelsQuery.refetch()}>
                      Try again
                    </Button>
                  </td>
                </tr>
              )}

              {modelsQuery.isSuccess && visibleModels.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-neutral-500">
                    {hasFilters ? 'No models match filters.' : 'No models in catalog. Run API seed/migrations.'}
                  </td>
                </tr>
              )}

              {visibleModels.map((model) => (
                <tr
                  key={model.id}
                  className={`transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                    model.status === 'ACTIVE' ? 'text-neutral-700 dark:text-neutral-200' : 'text-neutral-400'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] font-medium text-accent">{model.slug}</span>
                      {!model.routable && <Badge tone="danger">Not routable</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <Badge tone={model.planTier === 'PREMIUM' ? 'warning' : 'neutral'}>
                        {model.planTier === 'PREMIUM' ? 'Premium' : 'Economy'}
                      </Badge>
                      {model.freeEligible && <Badge tone="success">Free</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-neutral-500">
                    {priceFormat.format(Number(model.providerInputPrice))} /{' '}
                    {priceFormat.format(Number(model.providerOutputPrice))}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {priceFormat.format(Number(model.inputPrice))} /{' '}
                    {priceFormat.format(Number(model.outputPrice))}
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={statusTone[model.status]}>{statusLabel[model.status]}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-neutral-400">
                    {dateFormat.format(new Date(model.updatedAt))}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditModel(model)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100 hover:text-accent dark:hover:bg-neutral-800"
                    >
                      <HiOutlinePencilSquare className="size-4" aria-hidden />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editModel && (
        <ModelEditDialog
          open
          model={editModel}
          onClose={() => setEditModel(null)}
        />
      )}
    </AdminPage>
  );
}
