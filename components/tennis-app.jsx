'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MatchCard, surfaceBadgeClass } from '@/components/match-card';
import { fmtDate, localDateFromMs } from '@/lib/date-fmt';

function groupByTournament(matches) {
  const map = new Map();
  matches.forEach((m) => {
    const key = m.tournament.id;
    if (!map.has(key)) map.set(key, { tournament: m.tournament, matches: [] });
    map.get(key).matches.push(m);
  });
  return [...map.values()];
}

function TournamentGroup({ tournament, matches }) {
  const { name, location, surface, flag, tour } = tournament;
  return (
    <div className="mb-7">
      <div className="mb-2.5 flex items-center gap-2.5 px-0.5">
        <span className="text-[1.3rem] leading-none">{flag}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[0.9rem] font-bold tracking-tight">{name}</div>
          {location ? (
            <div className="mt-px text-[0.72rem] text-stone-600 dark:text-stone-400">{location}</div>
          ) : null}
        </div>
        {tour ? (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.7rem] font-semibold uppercase tracking-wide ${tour === 'ATP'
              ? 'bg-blue-500/15 text-blue-400'
              : 'bg-pink-500/15 text-pink-400'
              }`}
          >
            {tour}
          </span>
        ) : null}
        {surface ? (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.7rem] font-semibold uppercase tracking-wide ${surfaceBadgeClass(surface)}`}
          >
            {surface}
          </span>
        ) : null}
      </div>
      {matches.map((m) => (
        <MatchCard key={m.id} match={m} />
      ))}
    </div>
  );
}

function EmptyState({ message = 'No matches right now.' }) {
  return (
    <div className="px-5 py-16 text-center text-stone-400 dark:text-stone-500">
      <div className="mb-3 text-5xl">🎾</div>
      <p className="text-[0.9rem]">{message}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="px-5 py-10 text-center text-stone-600 dark:text-stone-400">
      <div className="mb-2.5 text-3xl">⚠️</div>
      <p className="mb-3.5 text-[0.85rem] text-stone-400 dark:text-stone-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-stone-300 bg-stone-100 px-5 py-2 text-[0.8rem] font-semibold text-stone-900 active:opacity-70 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-50"
      >
        Retry
      </button>
    </div>
  );
}

function SkeletonBlock({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="mb-2.5 flex flex-col gap-2.5 rounded-[14px] border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900"
        >
          <div className="h-3.5 w-[70%] animate-shimmer rounded-md bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 bg-[length:200%_100%] dark:from-stone-800 dark:via-stone-700 dark:to-stone-800" />
          <div className="h-3.5 w-1/2 animate-shimmer rounded-md bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 bg-[length:200%_100%] dark:from-stone-800 dark:via-stone-700 dark:to-stone-800" />
          <div className="h-3.5 w-[35%] animate-shimmer rounded-md bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 bg-[length:200%_100%] dark:from-stone-800 dark:via-stone-700 dark:to-stone-800" />
        </div>
      ))}
    </>
  );
}

function renderFlat(matches, descending = false) {
  if (!matches.length) return <EmptyState />;
  const sorted = [...matches].sort((a, b) =>
    descending ? (b.startMs || 0) - (a.startMs || 0) : (a.startMs || 0) - (b.startMs || 0),
  );
  let lastTournName = null;
  return (
    <>
      {sorted.map((m) => {
        const showHeader = m.tournament.name !== lastTournName;
        if (showHeader) lastTournName = m.tournament.name;
        return (
          <div key={m.id}>
            {showHeader ? (
              <div className="mb-1.5 mt-4 flex items-center gap-2 px-0.5 first:mt-0">
                <span className="text-[1.15rem]">{m.tournament.flag}</span>
                <span className="min-w-0 flex-1 truncate text-[0.88rem] font-bold tracking-tight">
                  {m.tournament.name}
                </span>
              </div>
            ) : null}
            <MatchCard match={m} />
          </div>
        );
      })}
    </>
  );
}

function renderGroups(matches) {
  if (!matches.length) return <EmptyState />;
  return (
    <>
      {groupByTournament(matches).map((g) => (
        <TournamentGroup key={g.tournament.id} tournament={g.tournament} matches={g.matches} />
      ))}
    </>
  );
}

function LiveTab({ matches, filter }) {
  if (!matches.length) return <EmptyState message="No live matches at the moment." />;
  if (filter === 'all') return renderFlat(matches);
  return renderGroups(matches);
}

function UpcomingTab({ matches, filter }) {
  if (!matches.length) return <EmptyState message="No upcoming matches scheduled." />;
  const sorted = [...matches].sort((a, b) => (a.startMs || 0) - (b.startMs || 0));
  const byDate = new Map();
  sorted.forEach((m) => {
    const k = localDateFromMs(m.startMs) || m.date || 'Unknown date';
    if (!byDate.has(k)) byDate.set(k, []);
    byDate.get(k).push(m);
  });
  const entries = [...byDate.entries()];
  return (
    <>
      {entries.map(([date, ms], idx) => (
        <div key={date}>
          <div
            className={`mb-3 flex items-center gap-2 px-0.5 font-mono text-[0.72rem] font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500 ${idx === 0 ? 'mt-0' : 'mt-5'
              }`}
          >
            {fmtDate(date)}
            <span className="h-px flex-1 bg-stone-200 dark:bg-stone-600/40" />
          </div>
          {filter === 'all' ? renderFlat(ms) : renderGroups(ms)}
        </div>
      ))}
    </>
  );
}

function ResultsTab({ matches, filter }) {
  if (!matches.length) return <EmptyState message="No results yet today." />;
  const sorted = [...matches].sort((a, b) => (b.startMs || 0) - (a.startMs || 0));
  const byDate = new Map();
  sorted.forEach((m) => {
    const k = localDateFromMs(m.startMs) || m.date || 'Unknown date';
    if (!byDate.has(k)) byDate.set(k, []);
    byDate.get(k).push(m);
  });
  const entries = [...byDate.entries()];
  return (
    <>
      {entries.map(([date, ms], idx) => (
        <div key={date}>
          <div
            className={`mb-3 flex items-center gap-2 px-0.5 font-mono text-[0.72rem] font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500 ${idx === 0 ? 'mt-0' : 'mt-5'
              }`}
          >
            {fmtDate(date)}
            <span className="h-px flex-1 bg-stone-200 dark:bg-stone-600/40" />
          </div>
          {filter === 'all' ? renderFlat(ms, true) : renderGroups(ms)}
        </div>
      ))}
    </>
  );
}

export function TennisApp() {
  const [tab, setTab] = useState('live');
  const [tourFilter, setTourFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [lastData, setLastData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [skeletonTabs, setSkeletonTabs] = useState(true);
  const [isDark, setIsDark] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => { });
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('favoriteMatches');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      setFavoriteIds(new Set(parsed.map((id) => String(id))));
    } catch {
      /* ignore malformed local storage */
    }
  }, []);

  const toggleFavorite = useCallback((matchId) => {
    const key = String(matchId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      localStorage.setItem('favoriteMatches', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    if (!lastData) {
      return { live: [], upcoming: [], past: [] };
    }
    const f = (arr) =>
      (arr || []).filter((m) => {
        if (tourFilter !== 'all' && m.tournament.tour.toLowerCase() !== tourFilter) return false;
        if (showFavoritesOnly && !favoriteIds.has(String(m.id))) return false;
        return true;
      });
    return {
      live: f(lastData.live || []),
      upcoming: f(lastData.upcoming || []),
      past: f(lastData.past || []),
    };
  }, [lastData, tourFilter, showFavoritesOnly, favoriteIds]);

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    setSkeletonTabs(true);
    setError(null);
    try {
      const res = await fetch('/api/matches');
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLastData(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setLastData(null);
    } finally {
      setSkeletonTabs(false);
      setRefreshing(false);
    }
  }, []);

  const refreshLive = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/matches');
      if (!res.ok) return;
      const data = await res.json();
      if (data.error) return;
      setLastData(data);
    } catch {
      /* silent */
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const id = setInterval(() => {
      refreshLive();
    }, 30_000);
    return () => clearInterval(id);
  }, [refreshLive]);

  const applyTheme = (dark) => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    setIsDark(dark);
  };

  const liveCount = filtered.live.length;

  const cardProps = (match) => ({
    isFavorite: favoriteIds.has(String(match.id)),
    onToggleFavorite: toggleFavorite,
  });

  const renderFlatWithFavorites = (matches, descending = false) => {
    if (!matches.length) return <EmptyState />;
    const sorted = [...matches].sort((a, b) =>
      descending ? (b.startMs || 0) - (a.startMs || 0) : (a.startMs || 0) - (b.startMs || 0),
    );
    let lastTournName = null;
    return (
      <>
        {sorted.map((m) => {
          const showHeader = m.tournament.name !== lastTournName;
          if (showHeader) lastTournName = m.tournament.name;
          return (
            <div key={m.id}>
              {showHeader ? (
                <div className="mb-1.5 mt-4 flex items-center gap-2 px-0.5 first:mt-0">
                  <span className="text-[1.15rem]">{m.tournament.flag}</span>
                  <span className="min-w-0 flex-1 truncate text-[0.88rem] font-bold tracking-tight">
                    {m.tournament.name}
                  </span>
                </div>
              ) : null}
              <MatchCard match={m} {...cardProps(m)} />
            </div>
          );
        })}
      </>
    );
  };

  const renderGroupsWithFavorites = (matches) => {
    if (!matches.length) return <EmptyState />;
    return (
      <>
        {groupByTournament(matches).map((g) => (
          <div key={g.tournament.id} className="mb-7">
            <div className="mb-2.5 flex items-center gap-2.5 px-0.5">
              <span className="text-[1.3rem] leading-none">{g.tournament.flag}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[0.9rem] font-bold tracking-tight">{g.tournament.name}</div>
                {g.tournament.location ? (
                  <div className="mt-px text-[0.72rem] text-stone-600 dark:text-stone-400">
                    {g.tournament.location}
                  </div>
                ) : null}
              </div>
              {g.tournament.tour ? (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.7rem] font-semibold uppercase tracking-wide ${g.tournament.tour === 'ATP'
                      ? 'bg-blue-500/15 text-blue-400'
                      : 'bg-pink-500/15 text-pink-400'
                    }`}
                >
                  {g.tournament.tour}
                </span>
              ) : null}
              {g.tournament.surface ? (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.7rem] font-semibold uppercase tracking-wide ${surfaceBadgeClass(
                    g.tournament.surface,
                  )}`}
                >
                  {g.tournament.surface}
                </span>
              ) : null}
            </div>
            {g.matches.map((m) => (
              <MatchCard key={m.id} match={m} {...cardProps(m)} />
            ))}
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[640px]">
      <header className="sticky top-0 z-[100] border-b border-stone-200 bg-stone-50/95 backdrop-blur-md dark:border-stone-600/40 dark:bg-stone-950/95">
        <div className="flex items-center justify-between px-4 pb-2.5 pt-3.5">
          <div className="inline-flex gap-0.5 rounded-full bg-stone-100 p-0.5 dark:bg-stone-800">
            {['all', 'atp', 'wta'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTourFilter(f)}
                className={`rounded-full px-3.5 py-1 font-mono text-[0.72rem] font-bold uppercase tracking-wide transition-colors ${tourFilter === f
                  ? 'bg-white text-stone-900 shadow dark:bg-stone-900 dark:text-stone-50'
                  : 'text-stone-600 dark:text-stone-400'
                  }`}
              >
                {f === 'all' ? 'All' : f.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={showFavoritesOnly ? 'Show all matches' : 'Show favorites only'}
              onClick={() => setShowFavoritesOnly((prev) => !prev)}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm transition-colors ${showFavoritesOnly ? 'text-red-500 dark:text-red-400' : 'text-stone-500 dark:text-stone-400'
                }`}
              title={showFavoritesOnly ? 'Favorites only' : 'All matches'}
            >
              {showFavoritesOnly ? '♥' : '♡'}
            </button>
            <div className="inline-flex gap-0.5 rounded-full bg-stone-100 p-0.5 dark:bg-stone-800">
              <button
                type="button"
                aria-label="Light mode"
                onClick={() => applyTheme(false)}
                className={`rounded-full px-3.5 py-1 font-mono text-[0.72rem] font-bold uppercase tracking-wide ${isDark === false
                  ? 'bg-white text-stone-900 shadow dark:bg-stone-900 dark:text-stone-50'
                  : 'text-stone-600 dark:text-stone-400'
                  }`}
              >
                L
              </button>
              <button
                type="button"
                aria-label="Dark mode"
                onClick={() => applyTheme(true)}
                className={`rounded-full px-3.5 py-1 font-mono text-[0.72rem] font-bold uppercase tracking-wide ${isDark === true
                  ? 'bg-white text-stone-900 shadow dark:bg-stone-900 dark:text-stone-50'
                  : 'text-stone-600 dark:text-stone-400'
                  }`}
              >
                D
              </button>
            </div>
          </div>
        </div>
        <nav className="flex gap-1 px-4">
          {[
            { id: 'live', label: 'Live', dot: true },
            { id: 'upcoming', label: 'Upcoming', dot: false },
            { id: 'past', label: 'Results', dot: false },
          ].map(({ id, label, dot }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 py-2.5 pb-3 text-[0.82rem] font-semibold tracking-wide transition-colors after:absolute after:bottom-0 after:left-[10%] after:h-0.5 after:w-4/5 after:rounded-sm after:bg-green-600 after:opacity-0 after:transition-opacity dark:after:bg-green-400 ${tab === id
                ? 'text-stone-900 after:opacity-100 dark:text-stone-50'
                : 'text-stone-600 dark:text-stone-400'
                }`}
            >
              {dot ? (
                <span className="inline-block h-[7px] w-[7px] animate-live-pulse rounded-full bg-red-600 dark:bg-red-400" />
              ) : null}
              {label}
              {id === 'live' && liveCount > 0 ? (
                <span className="ml-1 min-w-4 rounded-full bg-red-600 px-1 py-px text-center text-[0.6rem] font-extrabold text-white">
                  {liveCount}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-4">
        {skeletonTabs ? (
          <div>
            {tab === 'live' ? <SkeletonBlock count={3} /> : null}
            {tab === 'upcoming' ? <SkeletonBlock count={4} /> : null}
            {tab === 'past' ? <SkeletonBlock count={3} /> : null}
          </div>
        ) : error && !lastData ? (
          <ErrorState message={error} onRetry={loadAll} />
        ) : (
          <>
            <div className={tab === 'live' ? 'block' : 'hidden'}>
              {filtered.live.length ? (
                tourFilter === 'all'
                  ? renderFlatWithFavorites(filtered.live)
                  : renderGroupsWithFavorites(filtered.live)
              ) : (
                <EmptyState
                  message={
                    showFavoritesOnly ? 'No favorite live matches at the moment.' : 'No live matches at the moment.'
                  }
                />
              )}
            </div>
            <div className={tab === 'upcoming' ? 'block' : 'hidden'}>
              {filtered.upcoming.length ? (
                (() => {
                  const sorted = [...filtered.upcoming].sort((a, b) => (a.startMs || 0) - (b.startMs || 0));
                  const byDate = new Map();
                  sorted.forEach((m) => {
                    const k = localDateFromMs(m.startMs) || m.date || 'Unknown date';
                    if (!byDate.has(k)) byDate.set(k, []);
                    byDate.get(k).push(m);
                  });
                  const entries = [...byDate.entries()];
                  return entries.map(([date, ms], idx) => (
                    <div key={date}>
                      <div
                        className={`mb-3 flex items-center gap-2 px-0.5 font-mono text-[0.72rem] font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500 ${idx === 0 ? 'mt-0' : 'mt-5'
                          }`}
                      >
                        {fmtDate(date)}
                        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-600/40" />
                      </div>
                      {tourFilter === 'all'
                        ? renderFlatWithFavorites(ms)
                        : renderGroupsWithFavorites(ms)}
                    </div>
                  ));
                })()
              ) : (
                <EmptyState
                  message={
                    showFavoritesOnly
                      ? 'No favorite upcoming matches scheduled.'
                      : 'No upcoming matches scheduled.'
                  }
                />
              )}
            </div>
            <div className={tab === 'past' ? 'block' : 'hidden'}>
              {filtered.past.length ? (
                (() => {
                  const sorted = [...filtered.past].sort((a, b) => (b.startMs || 0) - (a.startMs || 0));
                  const byDate = new Map();
                  sorted.forEach((m) => {
                    const k = localDateFromMs(m.startMs) || m.date || 'Unknown date';
                    if (!byDate.has(k)) byDate.set(k, []);
                    byDate.get(k).push(m);
                  });
                  const entries = [...byDate.entries()];
                  return entries.map(([date, ms], idx) => (
                    <div key={date}>
                      <div
                        className={`mb-3 flex items-center gap-2 px-0.5 font-mono text-[0.72rem] font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500 ${idx === 0 ? 'mt-0' : 'mt-5'
                          }`}
                      >
                        {fmtDate(date)}
                        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-600/40" />
                      </div>
                      {tourFilter === 'all'
                        ? renderFlatWithFavorites(ms, true)
                        : renderGroupsWithFavorites(ms)}
                    </div>
                  ));
                })()
              ) : (
                <EmptyState
                  message={showFavoritesOnly ? 'No favorite results yet today.' : 'No results yet today.'}
                />
              )}
            </div>
          </>
        )}
      </main>

      <button
        type="button"
        aria-label="Refresh scores"
        disabled={refreshing}
        onClick={loadAll}
        className="fixed bottom-4 right-4 z-[200] flex h-8 w-8 items-center justify-center rounded-full bg-stone-400 text-stone-700 shadow-lg disabled:cursor-default disabled:opacity-50 dark:bg-stone-900 dark:text-stone-200"
      >
        <svg
          className={refreshing ? 'animate-fab-spin' : ''}
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M17 10A7 7 0 1 1 13.5 4" />
          <path d="M17 3v4.5H12.5" />
        </svg>
      </button>
    </div>
  );
}
