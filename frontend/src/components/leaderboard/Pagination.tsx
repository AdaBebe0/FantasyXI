import React from "react";
import { visiblePages } from "@/lib/leaderboard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/Icons";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
  disabled?: boolean;
}

const BUTTON =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-xs font-bold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#37003c] disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Accessible pagination: a labelled <nav> with 44px touch targets. Small screens
 * get Previous / "Page x of y" / Next; wider screens also get numbered pages.
 */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  label = "Pagination",
  disabled = false,
}) => {
  if (totalPages <= 1) return null;

  const go = (target: number) => {
    if (!disabled && target >= 1 && target <= totalPages && target !== page) onPageChange(target);
  };

  return (
    <nav aria-label={label} className="flex items-center justify-between gap-2 pt-2">
      <button
        type="button"
        className={`${BUTTON} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer`}
        onClick={() => go(page - 1)}
        disabled={disabled || page <= 1}
      >
        <ChevronLeftIcon size={16} aria-hidden="true" />
        <span className="ml-1">
          Previous<span className="sr-only"> page</span>
        </span>
      </button>

      <p className="text-xs text-slate-500 font-semibold sm:hidden">
        Page {page} of {totalPages}
      </p>

      <ul className="hidden items-center gap-1 sm:flex">
        {visiblePages(page, totalPages).map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <button
                type="button"
                className={`${BUTTON} ${
                  item === page
                    ? "border-[#37003c] bg-[#37003c] text-white shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
                }`}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                onClick={() => go(item)}
                disabled={disabled}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} aria-hidden="true" className="px-1 text-slate-400 font-mono">
              …
            </li>
          )
        )}
      </ul>

      <button
        type="button"
        className={`${BUTTON} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer`}
        onClick={() => go(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        <span className="mr-1">
          Next<span className="sr-only"> page</span>
        </span>
        <ChevronRightIcon size={16} aria-hidden="true" />
      </button>
    </nav>
  );
};
