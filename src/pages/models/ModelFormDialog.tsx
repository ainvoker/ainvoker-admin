import { useEffect } from 'react';
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { Dialog } from '../../components/ui/Dialog';
import { Field, TextInput } from '../../components/ui/Field';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/common/Button';
import { useCreateModel, useUpdateModel } from '../../hooks/useCatalog';
import type {
  AdminModel,
  AdminProvider,
  UpdateModelInput,
} from '../../services/AdminCatalogService';

const priceField = z
  .number({ error: 'Enter a price' })
  .nonnegative('Price cannot be negative')
  .max(999_999, 'Price must be 999,999 or less');

const modelFormSchema = z
  .object({
    providerId: z.number({ error: 'Choose a provider' }).int().positive('Choose a provider'),
    name: z
      .string()
      .trim()
      .min(1, 'Enter the model name')
      .max(200, 'Name must be 200 characters or less')
      .regex(/^[^\s/]+$/, 'Name cannot contain spaces or slashes'),
    type: z.enum(['TEXT', 'IMAGE']),
    contextWindow: z
      .number({ error: 'Enter a context window' })
      .int('Context window must be a whole number')
      .positive('Context window must be greater than 0'),
    inputPrice: priceField,
    outputPrice: priceField,
    status: z.enum(['ACTIVE', 'INACTIVE', 'DEPRECATED']),
    freeEligible: z.boolean(),
  })
  .refine((v) => !(v.type === 'IMAGE' && v.freeEligible), {
    message: 'Image models cannot be on the Free plan',
    path: ['freeEligible'],
  });

type ModelFormValues = z.infer<typeof modelFormSchema>;

interface ModelFormDialogProps {
  open: boolean;
  onClose: () => void;
  providers: AdminProvider[];
  /** When set, the dialog edits this model; otherwise it creates one. */
  model?: AdminModel;
}

export function ModelFormDialog({ open, onClose, providers, model }: ModelFormDialogProps) {
  const isEdit = !!model;
  const createModel = useCreateModel();
  const updateModel = useUpdateModel();
  const mutation = isEdit ? updateModel : createModel;

  const { register, handleSubmit, control, setValue, formState } = useForm<ModelFormValues>({
    resolver: zodResolver(modelFormSchema),
    mode: 'onTouched',
    defaultValues: model
      ? {
          providerId: model.providerId,
          name: model.name,
          type: model.type === 'IMAGE' ? 'IMAGE' : 'TEXT',
          contextWindow: model.contextWindow,
          inputPrice: Number(model.inputPrice),
          outputPrice: Number(model.outputPrice),
          status: model.status,
          freeEligible: model.freeEligible,
        }
      : {
          providerId: providers[0]?.id,
          name: '',
          type: 'TEXT',
          status: 'ACTIVE',
          freeEligible: false,
        },
  });
  const { errors, isSubmitting } = formState;

  const [providerId, type, status] = useWatch({ control, name: ['providerId', 'type', 'status'] });
  const provider = providers.find((p) => p.id === Number(providerId));
  const missingAdapter =
    provider && !(type === 'IMAGE' ? provider.hasImageAdapter : provider.hasTextAdapter);
  const inactiveProvider = provider && provider.status !== 'ACTIVE' && status === 'ACTIVE';

  useEffect(() => {
    if (type === 'IMAGE') setValue('freeEligible', false);
  }, [type, setValue]);

  const onSubmit: SubmitHandler<ModelFormValues> = async (values) => {
    try {
      if (model) {
        const patch: UpdateModelInput = {};
        if (values.contextWindow !== model.contextWindow) patch.contextWindow = values.contextWindow;
        if (values.inputPrice !== Number(model.inputPrice)) patch.inputPrice = values.inputPrice;
        if (values.outputPrice !== Number(model.outputPrice)) patch.outputPrice = values.outputPrice;
        if (values.status !== model.status) patch.status = values.status;
        if (values.freeEligible !== model.freeEligible) patch.freeEligible = values.freeEligible;

        if (Object.keys(patch).length > 0) {
          await updateModel.mutateAsync({ id: model.id, patch });
        }
      } else {
        await createModel.mutateAsync(values);
      }
      onClose();
    } catch {
      // Error is rendered from mutation.error below.
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${model.slug}` : 'Add model'}
      description={
        isEdit
          ? 'Provider, name, and type are fixed once a model exists.'
          : 'The model becomes available to projects that allow it.'
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {isEdit ? (
          <dl className="grid grid-cols-3 gap-3 rounded-xl bg-neutral-50 px-3.5 py-3 text-sm dark:bg-neutral-800/60">
            <div>
              <dt className="text-xs text-neutral-500 dark:text-neutral-400">Provider</dt>
              <dd className="mt-0.5 font-medium">{model.provider}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500 dark:text-neutral-400">Type</dt>
              <dd className="mt-0.5 font-medium">{model.type === 'IMAGE' ? 'Image' : 'Text'}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-neutral-500 dark:text-neutral-400">Name</dt>
              <dd className="mt-0.5 truncate font-mono font-medium" title={model.name}>{model.name}</dd>
            </div>
          </dl>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Provider" htmlFor="providerId" error={errors.providerId?.message}>
                <Select
                  id="providerId"
                  error={errors.providerId?.message}
                  {...register('providerId', { valueAsNumber: true })}
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.status !== 'ACTIVE' ? ` (${p.status.toLowerCase()})` : ''}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Type" htmlFor="type" error={errors.type?.message}>
                <Select id="type" {...register('type')}>
                  <option value="TEXT">Text</option>
                  <option value="IMAGE">Image</option>
                </Select>
              </Field>
            </div>

            <Field
              label="Model name"
              htmlFor="name"
              hint="Exactly as the provider names it, e.g. gpt-4o-mini."
              error={errors.name?.message}
            >
              <TextInput
                id="name"
                placeholder="gpt-4o-mini"
                autoComplete="off"
                error={errors.name?.message}
                {...register('name')}
              />
            </Field>
          </>
        )}

        {missingAdapter && (
          <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            <HiOutlineExclamationTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {provider.name} has no {type === 'IMAGE' ? 'image' : 'text'} adapter deployed, so
            requests to this model will fail until one ships.
          </p>
        )}

        <Field label="Context window (tokens)" htmlFor="contextWindow" error={errors.contextWindow?.message}>
          <TextInput
            id="contextWindow"
            type="number"
            min={1}
            step={1}
            placeholder="128000"
            error={errors.contextWindow?.message}
            {...register('contextWindow', { valueAsNumber: true })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Input price (USD per 1M tokens)" htmlFor="inputPrice" error={errors.inputPrice?.message}>
            <TextInput
              id="inputPrice"
              type="number"
              min={0}
              step="any"
              placeholder="0.15"
              error={errors.inputPrice?.message}
              {...register('inputPrice', { valueAsNumber: true })}
            />
          </Field>
          <Field label="Output price (USD per 1M tokens)" htmlFor="outputPrice" error={errors.outputPrice?.message}>
            <TextInput
              id="outputPrice"
              type="number"
              min={0}
              step="any"
              placeholder="0.60"
              error={errors.outputPrice?.message}
              {...register('outputPrice', { valueAsNumber: true })}
            />
          </Field>
        </div>

        <Field
          label="Status"
          htmlFor="status"
          hint="Models can't be deleted. Set Inactive to hide one, or Deprecated to signal it's going away."
          error={inactiveProvider ? `${provider.name} is not active, so this model can't be Active.` : undefined}
        >
          <Select id="status" error={inactiveProvider ? 'inactive' : undefined} {...register('status')}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DEPRECATED">Deprecated</option>
          </Select>
        </Field>

        <label className={`flex items-start gap-2.5 text-sm ${type === 'IMAGE' ? 'text-neutral-400' : 'text-neutral-700 dark:text-neutral-200'}`}>
          {type === 'IMAGE' ? (
            <input type="checkbox" disabled checked={false} readOnly className="mt-1" />
          ) : (
            <input type="checkbox" className="mt-1 accent-neutral-900 dark:accent-neutral-100" {...register('freeEligible')} />
          )}
          <span>
            Available on the Free plan
            <span className="block text-xs text-neutral-500 dark:text-neutral-400">
              {type === 'IMAGE' ? 'Image models are paid-plan only.' : 'Free workspaces can only call models with this on.'}
            </span>
          </span>
        </label>
        {errors.freeEligible?.message && (
          <p className="text-xs text-red-500 dark:text-red-400">{errors.freeEligible.message}</p>
        )}

        {mutation.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {mutation.error.message}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={!!inactiveProvider}>
            {isEdit ? 'Save changes' : 'Add model'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
