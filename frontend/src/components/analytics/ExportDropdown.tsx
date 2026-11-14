"use client";

import { useState } from "react";
import type { PerformanceAnalytics } from "@/types";
import { buildPerformanceCsv, buildPerformanceJson } from "@/lib/performanceExport";

export interface ExportDropdownProps {
  analytics: PerformanceAnalytics;
}

export function ExportDropdown({ analytics }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!analytics.squadId) return null;

  const download = (format: "csv" | "json") => {
    const content = format === "csv"
      ? buildPerformanceCsv(analytics)
      : buildPerformanceJson(analytics);
    const mimeType = format === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8";
    const blobUrl = URL.createObjectURL(new Blob([content], { type: mimeType }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `fantasyxi-performance-squad-${analytics.squadId}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#37003c] shadow-sm"
      >
        Export data
        <span aria-hidden="true" className="text-slate-400">▾</span>
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-label="Export performance data"
          className="absolute right-0 z-10 mt-2 min-w-36 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => download("csv")}
            className="block w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:outline-none"
          >
            Export CSV
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => download("json")}
            className="block w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:outline-none"
          >
            Export JSON
          </button>
        </div>
      )}
    </div>
  );
}
