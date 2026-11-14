"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { buildLeaderboardQuery, formatCount, ordinal, resultRangeText } from "@/lib/leaderboard";
import { Gameweek, LeaderboardData, LeaderboardMode } from "@/types";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Pagination } from "@/components/leaderboard/Pagination";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SearchIcon } from "@/components/ui/Icons";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardData;
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}

export default function LeaderboardPage() {
  const { isAuthenticated } = useAuth();

  const [mode, setMode] = useState<LeaderboardMode>("overall");
  const [gameweeks, setGameweeks] = useState<Gameweek[]>([]);
  const [gameweekId, setGameweekId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const resultsRef = useRef<HTMLElement>(null);
  const pendingFocus = useRef<"results" | "viewer" | null>(null);

  const activeGameweekId = mode === "gameweek" ? gameweekId : null;
  const requestPath = `/api/v1/leaderboard${buildLeaderboardQuery({
    page,
    pageSize: PAGE_SIZE,
    search,
    gameweekId: activeGameweekId,
  })}`;
  // Gameweek mode waits until a gameweek is chosen
  const requestKey = mode === "gameweek" && !gameweekId ? null : `${requestPath}|${isAuthenticated}|${retryCount}`;
  const isLoading = requestKey !== null && requestKey !== loadedKey;

  // Gameweeks that can have scores: finished or in progress, most recent first
  useEffect(() => {
    api
      .get<{ success: boolean; data: Gameweek[] }>("/api/v1/gameweeks")
      .then((res) => {
        const scored = res.data.filter((gw) => gw.isFinished || gw.isCurrent).reverse();
        setGameweeks(scored);
        setGameweekId((current) => current ?? scored[0]?.id ?? null);
      })
      .catch(() => setGameweeks([]));
  }, []);

  // Debounce typing so every keystroke does not trigger a request
  useEffect(() => {
    const next = searchInput.trim();
    if (next === search) return;
    const timer = setTimeout(() => {
      setSearch(next);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    if (requestKey === null) return;
    let cancelled = false;

    api
      .get<LeaderboardResponse>(requestPath)
      .then((res) => {
        if (cancelled) return;
        setResult(res);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "The leaderboard could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, requestPath]);

  // Move focus to the results after paging so keyboard and screen-reader users keep their place
  useEffect(() => {
    if (isLoading || !pendingFocus.current) return;
    const target = pendingFocus.current;
    pendingFocus.current = null;
    resultsRef.current?.focus({ preventScroll: target === "viewer" });
    if (target === "viewer") {
      resultsRef.current?.querySelector("tr[data-current-user]")?.scrollIntoView({ block: "center" });
    } else {
      resultsRef.current?.scrollIntoView({ block: "start" });
    }
  }, [isLoading]);

  const changePage = (next: number) => {
    pendingFocus.current = "results";
    setPage(next);
  };

  const changeMode = (next: LeaderboardMode) => {
    setMode(next);
    setPage(1);
  };

  const jumpToViewer = () => {
    const viewer = result?.data.viewer;
    if (!viewer) return;
    pendingFocus.current = "viewer";
    setSearchInput("");
    setSearch("");
    setPage(viewer.page);
  };

  const data = result?.data;
  const meta = result?.meta;
  const gameweekName = data?.mode === "gameweek" ? data.gameweek?.name : null;
  const pointsLabel = gameweekName ? `${gameweekName} points` : "Season points";
  const caption =
    `Global leaderboard ranked by ${pointsLabel.toLowerCase()}, highest first` +
    (meta && meta.totalPages > 0 ? `. Page ${meta.page} of ${meta.totalPages}.` : ".");

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <header className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase font-sans">Global leaderboard</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">Every FantasyXI manager, ranked. Equal points share a rank.</p>
      </header>

      <form role="search" aria-label="Filter the leaderboard" onSubmit={(e) => e.preventDefault()} className="space-y-3 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="leaderboard-search" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Search managers or squads
            </label>
            <div className="relative">
              <SearchIcon
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="leaderboard-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                maxLength={50}
                autoComplete="off"
                placeholder="e.g. Salah Seekers or @manager"
                className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-[#37003c] focus:ring-1 focus:ring-[#37003c] transition-colors"
              />
            </div>
          </div>

          <fieldset className="shrink-0">
            <legend className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Standings</legend>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(
                [
                  ["overall", "Season"],
                  ["gameweek", "Gameweek"],
                ] as const
              ).map(([value, text]) => (
                <label key={value} className="relative">
                  <input
                    type="radio"
                    name="leaderboard-mode"
                    value={value}
                    checked={mode === value}
                    onChange={() => changeMode(value)}
                    disabled={value === "gameweek" && gameweeks.length === 0}
                    className="peer sr-only"
                  />
                  <span className="inline-flex min-h-8 cursor-pointer items-center rounded-lg px-3.5 text-xs font-bold text-slate-600 peer-checked:bg-[#37003c] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#37003c]/30 peer-disabled:cursor-not-allowed peer-disabled:opacity-40 transition-colors">
                    {text}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {mode === "gameweek" && gameweeks.length > 0 && (
            <div className="shrink-0">
              <label htmlFor="leaderboard-gameweek" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Gameweek
              </label>
              <select
                id="leaderboard-gameweek"
                value={gameweekId ?? ""}
                onChange={(e) => {
                  setGameweekId(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#37003c] focus:ring-1 focus:ring-[#37003c] sm:w-auto"
              >
                {gameweeks.map((gw) => (
                  <option key={gw.id} value={gw.id}>
                    {gw.name}
                    {gw.isCurrent && !gw.isFinished ? " (live)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </form>

      {data?.viewer && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
          <p className="text-xs text-emerald-950 font-medium">
            You are <strong className="font-bold text-emerald-900">{ordinal(data.viewer.rank)}</strong> with{" "}
            <strong className="font-bold text-emerald-900">{formatCount(data.viewer.points)}</strong> {pointsLabel.toLowerCase()}.
          </p>
          <button
            type="button"
            onClick={jumpToViewer}
            className="min-h-9 rounded-xl bg-emerald-700 px-3.5 text-xs font-bold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 transition-colors cursor-pointer"
          >
            Jump to my position
          </button>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setRetryCount((n) => n + 1)}
            className="min-h-8 rounded-lg border border-rose-300 px-3 font-bold hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      <section
        ref={resultsRef}
        tabIndex={-1}
        aria-labelledby="leaderboard-results-heading"
        aria-busy={isLoading}
        className="scroll-mt-4 space-y-3 outline-none"
      >
        <div className="flex items-baseline justify-between gap-3 px-1">
          <h2 id="leaderboard-results-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {gameweekName ? `${gameweekName} standings` : "Season standings"}
          </h2>
          <p role="status" aria-live="polite" className="text-xs text-slate-400">
            {isLoading ? "Loading…" : meta ? resultRangeText(meta.page, meta.pageSize, meta.total) : ""}
          </p>
        </div>

        <ErrorBoundary
          name="LeaderboardTable"
          fallbackTitle="Leaderboard table failed to render"
          onReset={() => setRetryCount((n) => n + 1)}
          resetKeys={[requestKey]}
        >
          <div
            className={`overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-opacity ${
              isLoading && data ? "opacity-60" : ""
            }`}
          >
            {!data && isLoading ? (
              <p className="p-8 text-center text-xs font-medium text-slate-400">Loading the leaderboard…</p>
            ) : data && data.entries.length > 0 ? (
              <LeaderboardTable entries={data.entries} caption={caption} pointsLabel={pointsLabel} />
            ) : data ? (
              <p className="p-8 text-center text-xs text-slate-400">
                {search ? `No managers match “${search}”.` : "No managers have been ranked yet."}
              </p>
            ) : null}
          </div>
        </ErrorBoundary>

        {meta && (
          <Pagination
            label="Leaderboard pages"
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={changePage}
            disabled={isLoading}
          />
        )}
      </section>
    </div>
  );
}
