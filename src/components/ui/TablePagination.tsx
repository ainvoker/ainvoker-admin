import { Button } from '../common/Button';

export const TABLE_PAGE_SIZE = 50;

type TablePaginationProps = {
  total: number;
  limit: number;
  offset: number;
  onOffsetChange: (offset: number) => void;
  disabled?: boolean;
};

/** Footer for admin list tables backed by limit/offset APIs. */
export function TablePagination({
  total,
  limit,
  offset,
  onOffsetChange,
  disabled = false,
}: TablePaginationProps) {
  if (total <= 0) return null;

  const from = offset + 1;
  const to = Math.min(offset + limit, total);
  const canPrev = offset > 0 && !disabled;
  const canNext = offset + limit < total && !disabled;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/80 px-4 py-2.5 dark:border-neutral-800">
      <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
        <span className="tabular-nums">
          {from}–{to}
        </span>{' '}
        of <span className="tabular-nums">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canPrev}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canNext}
          onClick={() => onOffsetChange(offset + limit)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
