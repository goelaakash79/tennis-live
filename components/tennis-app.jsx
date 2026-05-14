'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SCORE_POLL_MS, SCORE_SOON_MS } from '@/components/tennis/tennis-constants';
import { TennisHeader } from '@/components/tennis/tennis-header';
import { TennisMainPanel } from '@/components/tennis/tennis-main-panel';
import { RefreshFab } from '@/components/tennis/refresh-fab';

export function TennisApp({
  initialData = null,
  initialError = null,
  initialFetchedAt = null,
}) {
  const [tab, setTab] = useState('live');
  const [tourFilter, setTourFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [lastData, setLastData] = useState(initialData);
  const [error, setError] = useState(initialError);
  const [refreshing, setRefreshing] = useState(false);
  const [skeletonTabs, setSkeletonTabs] = useState(!initialData && !initialError);
  const [isDark, setIsDark] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const initialLoadRef = useRef(!initialData);
  const [lastSuccessfulPollAt, setLastSuccessfulPollAt] = useState(
    () => (initialFetchedAt != null ? initialFetchedAt : initialData ? Date.now() : null),
  );
  const [pollClock, setPollClock] = useState(0);
  const [needsClientBootstrap] = useState(() => !initialData && !initialError);
  const clientBootstrapOnce = useRef(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    };
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(register, { timeout: 5000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(register, 2000);
    return () => clearTimeout(t);
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

  const liveMatchCount = (lastData?.live || []).length;

  useEffect(() => {
    if (skeletonTabs || liveMatchCount === 0) return;
    const id = setInterval(() => setPollClock((n) => n + 1), 400);
    return () => clearInterval(id);
  }, [skeletonTabs, liveMatchCount]);

  const liveScoreSync =
    refreshing
      ? 'syncing'
      : lastSuccessfulPollAt == null
        ? 'idle'
        : lastSuccessfulPollAt + SCORE_POLL_MS - (Date.now() + pollClock * 0) <= SCORE_SOON_MS
          ? 'soon'
          : 'idle';

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    const showSkeleton = initialLoadRef.current;
    if (showSkeleton) setSkeletonTabs(true);
    try {
      const res = await fetch('/api/matches', { cache: 'no-store' });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLastData(data);
      setLastSuccessfulPollAt(Date.now());
      initialLoadRef.current = false;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setLastData(null);
    } finally {
      if (showSkeleton) setSkeletonTabs(false);
      setRefreshing(false);
    }
  }, []);

  const refreshLive = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/matches', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.error) return;
      setLastData(data);
      setLastSuccessfulPollAt(Date.now());
    } catch {
      /* silent */
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!needsClientBootstrap) return;
    if (clientBootstrapOnce.current) return;
    clientBootstrapOnce.current = true;
    loadAll();
  }, [loadAll, needsClientBootstrap]);

  useEffect(() => {
    const id = setInterval(() => {
      refreshLive();
    }, SCORE_POLL_MS);
    return () => clearInterval(id);
  }, [refreshLive]);

  const applyTheme = (dark) => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    setIsDark(dark);
  };

  const liveCount = filtered.live.length;

  const getCardProps = useCallback(
    (match) => ({
      isFavorite: favoriteIds.has(String(match.id)),
      onToggleFavorite: toggleFavorite,
      liveScoreSync: match.status === 'live' ? liveScoreSync : 'idle',
    }),
    [favoriteIds, toggleFavorite, liveScoreSync],
  );

  return (
    <div className="mx-auto max-w-[640px]">
      <TennisHeader
        tourFilter={tourFilter}
        onTourFilterChange={setTourFilter}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly((prev) => !prev)}
        isDark={isDark}
        onApplyTheme={applyTheme}
        tab={tab}
        onTabChange={setTab}
        liveCount={liveCount}
      />
      <TennisMainPanel
        skeletonTabs={skeletonTabs}
        tab={tab}
        error={error}
        lastData={lastData}
        onRetry={loadAll}
        filtered={filtered}
        tourFilter={tourFilter}
        showFavoritesOnly={showFavoritesOnly}
        getCardProps={getCardProps}
      />
      <RefreshFab refreshing={refreshing} onRefresh={loadAll} />
    </div>
  );
}
