import React, { useEffect, useRef } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/** Native <dialog> so focus trapping and Escape-to-close come from the browser. */
export const Dialog: React.FC<DialogProps> = ({ open, onClose, title, description, children }) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-neutral-200 bg-white p-0 font-sans text-accent shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop:bg-black/40 backdrop:backdrop-blur-[2px] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
    >
      {open && (
        <div className="p-5 md:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              {description && (
                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-8 place-content-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 dark:hover:bg-neutral-800"
            >
              <HiOutlineXMark className="size-4" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
};
