'use client';

import { DateGroupedMatchList } from '@/components/tennis/date-grouped-match-list';
import { EmptyState } from '@/components/tennis/empty-state';
import { ErrorState } from '@/components/tennis/error-state';
import { MatchListByTournament } from '@/components/tennis/match-list-by-tournament';
import { MatchListFlat } from '@/components/tennis/match-list-flat';
import { SkeletonBlock } from '@/components/tennis/skeleton-block';

export function TennisMainPanel({
  skeletonTabs,
  tab,
  error,
  lastData,
  onRetry,
  filtered,
  tourFilter,
  showFavoritesOnly,
  getCardProps,
}) {
  return (
    <main className="p-4">
      {skeletonTabs ? (
        <div>
          {tab === 'live' ? <SkeletonBlock count={3} /> : null}
          {tab === 'upcoming' ? <SkeletonBlock count={4} /> : null}
          {tab === 'past' ? <SkeletonBlock count={3} /> : null}
        </div>
      ) : error && !lastData ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <>
          <div className={tab === 'live' ? 'block' : 'hidden'}>
            {filtered.live.length ? (
              tourFilter === 'all' ? (
                <MatchListFlat matches={filtered.live} getCardProps={getCardProps} />
              ) : (
                <MatchListByTournament matches={filtered.live} getCardProps={getCardProps} />
              )
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
              <DateGroupedMatchList
                matches={filtered.upcoming}
                tourFilter={tourFilter}
                descending={false}
                getCardProps={getCardProps}
              />
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
              <DateGroupedMatchList
                matches={filtered.past}
                tourFilter={tourFilter}
                descending
                getCardProps={getCardProps}
              />
            ) : (
              <EmptyState
                message={showFavoritesOnly ? 'No favorite results yet today.' : 'No results yet today.'}
              />
            )}
          </div>
        </>
      )}
    </main>
  );
}
