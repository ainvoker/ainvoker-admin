import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { HiOutlineInformationCircle } from 'react-icons/hi2';

interface InfoTooltipProps {
  label: string;
  children: ReactNode;
}

/** Small info button that reveals an explanation on hover, focus, or click. */
export function InfoTooltip({ label, children }: InfoTooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setPinned(false);
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setPinned(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <span
      ref={rootRef}
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => !pinned && setOpen(false)}
    >
      <button
        type="button"
        aria-label={`About ${label}`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => !pinned && setOpen(false)}
        onClick={() => {
          setPinned(!pinned);
          setOpen(!pinned);
        }}
        className="grid size-4 place-content-center rounded-full text-neutral-400 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-600"
      >
        <HiOutlineInformationCircle className="size-4" aria-hidden />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white p-3 text-xs font-normal leading-relaxed text-neutral-600 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        >
          {children}
        </span>
      )}
    </span>
  );
}
