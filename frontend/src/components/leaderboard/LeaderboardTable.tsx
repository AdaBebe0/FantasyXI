import React from "react";
import { LeaderboardEntry } from "@/types";
import { formatCount, ordinal } from "@/lib/leaderboard";

export interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  /** Screen-reader caption describing what is ranked and how */
  caption: string;
  /** Column heading for the points column, e.g. "Season points" or "Gameweek 5 points" */
  pointsLabel: string;
}

const MEDAL_STYLES: Record<number, string> = {
  1: "bg-amber-400 text-slate-950",
  2: "bg-slate-300 text-slate-950",
  3: "bg-amber-700 text-amber-50",
};

/**
 * Semantic, mobile-first leaderboard table.
 *
 * Three columns fit a 320px screen without horizontal scrolling. Rank, tie and
 * "you" status are conveyed in text (not colour alone), long names wrap instead
 * of being clipped, and rows are at least 48px tall for touch.
 */
export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries, caption, pointsLabel }) => {
  const rankCounts = new Map<number, number>();
  for (const entry of entries) rankCounts.set(entry.rank, (rankCounts.get(entry.rank) ?? 0) + 1);

  return (
    <table className="w-full table-fixed border-collapse text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <colgroup>
        <col className="w-16 sm:w-24" />
        <col />
        <col className="w-24 sm:w-36" />
      </colgroup>
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
          <th scope="col" className="px-3 py-3 font-bold sm:px-4">
            Rank
          </th>
          <th scope="col" className="px-3 py-3 font-bold sm:px-4">
            Manager
          </th>
          <th scope="col" aria-sort="descending" className="px-3 py-3 text-right font-bold sm:px-4">
            {pointsLabel}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {entries.map((entry) => {
          const tied = (rankCounts.get(entry.rank) ?? 0) > 1;
          return (
            <tr
              key={entry.squadId}
              data-current-user={entry.isCurrentUser || undefined}
              className={entry.isCurrentUser ? "bg-purple-50/60" : "hover:bg-slate-50"}
            >
              <td className="px-3 py-3 align-middle sm:px-4">
                <span
                  className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 font-mono text-xs font-black tabular-nums ${
                    MEDAL_STYLES[entry.rank] ?? "text-slate-500 font-bold"
                  }`}
                >
                  <span className="sr-only">{tied ? `Joint ${ordinal(entry.rank)}` : ordinal(entry.rank)}</span>
                  <span aria-hidden="true">
                    {tied ? "=" : ""}
                    {formatCount(entry.rank)}
                  </span>
                </span>
              </td>
              <td className="px-3 py-3 align-middle sm:px-4">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className={`break-words font-bold [overflow-wrap:anywhere] ${
                      entry.isCurrentUser ? "text-[#37003c]" : "text-slate-900"
                    }`}
                  >
                    {entry.squadName}
                  </span>
                  {entry.isCurrentUser && (
                    <span className="rounded-md border border-purple-200 bg-purple-100/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#37003c]">
                      You
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 [overflow-wrap:anywhere]">@{entry.username}</div>
              </td>
              <td className="px-3 py-3 text-right align-middle font-mono text-base font-black text-slate-900 tabular-nums sm:px-4">
                {formatCount(entry.points)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
