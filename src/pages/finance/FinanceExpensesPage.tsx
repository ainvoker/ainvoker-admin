import { useMemo, useState } from 'react';
import {
  useCreateFinanceExpense,
  useFinanceExpenses,
  useUpdateFinanceExpense,
} from '../../hooks/useFinance';
import {
  EXPENSE_CATEGORY_OPTIONS,
  currentUtcPeriod,
  type ExpenseCategory,
  type FinanceExpense,
} from '../../services/AdminFinanceService';
import { AdminPage } from '../../components/layout/AdminPage';
import { Button } from '../../components/common/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Field, TextInput } from '../../components/ui/Field';
import { Select } from '../../components/ui/Select';
import { expenseCategoryLabel, formatPhp } from './financeFormat';

type FormState = {
  category: ExpenseCategory;
  amountPhp: string;
  period: string;
  description: string;
  notes: string;
};

const emptyForm = (): FormState => ({
  category: 'INFRA',
  amountPhp: '',
  period: currentUtcPeriod(),
  description: '',
  notes: '',
});

function fromExpense(row: FinanceExpense): FormState {
  return {
    category: row.category,
    amountPhp: row.amountPhp,
    period: row.period,
    description: row.description,
    notes: row.notes ?? '',
  };
}

export default function FinanceExpensesPage() {
  const [periodFilter, setPeriodFilter] = useState(currentUtcPeriod);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceExpense | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const expensesQuery = useFinanceExpenses(periodFilter || undefined);
  const createExpense = useCreateFinanceExpense();
  const updateExpense = useUpdateFinanceExpense();

  const items = expensesQuery.data?.items ?? [];
  const totalPhp = useMemo(
    () => items.reduce((sum, row) => sum + Number(row.amountPhp), 0),
    [items],
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm(), period: periodFilter || currentUtcPeriod() });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (row: FinanceExpense) => {
    setEditing(row);
    setForm(fromExpense(row));
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (createExpense.isPending || updateExpense.isPending) return;
    setDialogOpen(false);
    setEditing(null);
    setFormError(null);
  };

  const submit = async () => {
    setFormError(null);
    const amountPhp = Number(form.amountPhp);
    if (!form.description.trim()) {
      setFormError('Description is required');
      return;
    }
    if (!Number.isFinite(amountPhp) || amountPhp < 0) {
      setFormError('Enter a valid PHP amount');
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(form.period)) {
      setFormError('Period must be YYYY-MM');
      return;
    }

    const body = {
      category: form.category,
      amountPhp,
      period: form.period,
      description: form.description.trim(),
      notes: form.notes.trim() || null,
    };

    try {
      if (editing) {
        await updateExpense.mutateAsync({ expenseId: editing.id, body });
      } else {
        await createExpense.mutateAsync(body);
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const saving = createExpense.isPending || updateExpense.isPending;

  return (
    <AdminPage
      actions={
        <>
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <span className="sr-only">Period</span>
            <input
              type="month"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <Button type="button" onClick={openCreate}>
            Add expense
          </Button>
        </>
      }
    >
      {expensesQuery.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {expensesQuery.error instanceof Error
            ? expensesQuery.error.message
            : 'Failed to load expenses'}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <div>
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              Operating expenses
            </h2>
            <p className="text-xs text-neutral-500">
              {periodFilter ? `Period ${periodFilter}` : 'All periods'} · Total{' '}
              {formatPhp(totalPhp)}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-200/80 text-[11px] uppercase tracking-wide text-neutral-500 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-2 font-medium">Period</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Description</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {expensesQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-neutral-500">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-neutral-500">
                    No expenses recorded for this period.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/80"
                  >
                    <td className="px-4 py-2.5 tabular-nums">{row.period}</td>
                    <td className="px-4 py-2.5">{expenseCategoryLabel(row.category)}</td>
                    <td className="px-4 py-2.5">
                      <div>{row.description}</div>
                      {row.notes ? (
                        <div className="text-[11px] text-neutral-400">{row.notes}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{formatPhp(row.amountPhp)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        className="text-sm text-accent underline-offset-2 hover:underline"
                        onClick={() => openEdit(row)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editing ? 'Edit expense' : 'Add expense'}
      >
        <div className="flex flex-col gap-3">
          <Field label="Period" htmlFor="expense-period">
            <input
              id="expense-period"
              type="month"
              value={form.period}
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
              className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>
          <Field label="Category" htmlFor="expense-category">
            <Select
              id="expense-category"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))
              }
            >
              {EXPENSE_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Amount (PHP)" htmlFor="expense-amount">
            <TextInput
              id="expense-amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amountPhp}
              onChange={(e) => setForm((f) => ({ ...f, amountPhp: e.target.value }))}
            />
          </Field>
          <Field label="Description" htmlFor="expense-description">
            <TextInput
              id="expense-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>
          <Field label="Notes (optional)" htmlFor="expense-notes">
            <TextInput
              id="expense-notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </Field>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void submit()} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </Dialog>
    </AdminPage>
  );
}
