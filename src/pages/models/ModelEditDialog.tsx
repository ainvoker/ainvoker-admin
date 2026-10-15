import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUpdateModel } from '../../hooks/useCatalog';
import type { AdminModel, CatalogStatus, ModelPlanTier } from '../../services/AdminCatalogService';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/ui/Select';

type Props = {
  model: AdminModel;
  open: boolean;
  onClose: () => void;
};

export function ModelEditDialog({ model, open, onClose }: Props) {
  const { token } = useAuth();
  const update = useUpdateModel();
  const [status, setStatus] = useState<CatalogStatus>(model.status);
  const [planTier, setPlanTier] = useState<ModelPlanTier>(model.planTier);
  const [freeEligible, setFreeEligible] = useState(model.freeEligible);

  if (!open) return null;

  const isPremium = planTier === 'PREMIUM';

  const save = async () => {
    if (!token) return;
    await update.mutateAsync({
      id: model.id,
      patch: { status, planTier, freeEligible: isPremium ? false : freeEligible },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-labelledby="model-edit-title"
        className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <h2 id="model-edit-title" className="text-lg font-semibold text-accent">
          Edit model
        </h2>
        <p className="mt-1 font-mono text-sm text-neutral-500">{model.slug}</p>
        <p className="mt-3 text-xs text-neutral-500">
          Model definitions come from releases. You can change availability, pricing tier, and whether Free may use it.
        </p>

        <div className="mt-4 space-y-4">
          <label className="block text-sm text-neutral-700 dark:text-neutral-200">
            Status
            <Select
              aria-label="Status"
              className="mt-1"
              value={status}
              onChange={(e) => setStatus(e.target.value as CatalogStatus)}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DEPRECATED">Deprecated</option>
            </Select>
          </label>

          <label className="block text-sm text-neutral-700 dark:text-neutral-200">
            Plan tier
            <Select
              aria-label="Plan tier"
              className="mt-1"
              value={planTier}
              onChange={(e) => setPlanTier(e.target.value as ModelPlanTier)}
            >
              <option value="ECONOMY">Economy (standard markup)</option>
              <option value="PREMIUM">Premium (higher markup, never on Free)</option>
            </Select>
          </label>

          <label
            className={`flex items-start gap-2.5 text-sm ${
              isPremium ? 'text-neutral-400' : 'text-neutral-700 dark:text-neutral-200'
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 accent-neutral-900 dark:accent-neutral-100"
              disabled={isPremium}
              checked={!isPremium && freeEligible}
              onChange={(e) => setFreeEligible(e.target.checked)}
            />
            <span>
              Available on the Free plan
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                Only economy models can be offered on Free.
              </span>
            </span>
          </label>

          {planTier !== model.planTier && (
            <p className="text-xs text-neutral-500">
              Retail price will be recalculated with the {isPremium ? 'premium' : 'economy'} markup.
            </p>
          )}
          {update.isError && (
            <p className="text-xs text-red-600 dark:text-red-400">{update.error.message}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={update.isPending} onClick={() => void save().catch(() => {})}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
