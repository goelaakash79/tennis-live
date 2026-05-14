'use client';

import { MatchCard, surfaceBadgeClass } from '@/components/match-card';
import { EmptyState } from '@/components/tennis/empty-state';
import { groupByTournament } from '@/components/tennis/group-by-tournament';

export function MatchListByTournament({ matches, getCardProps }) {
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
            <MatchCard key={m.id} match={m} {...getCardProps(m)} />
          ))}
        </div>
      ))}
    </>
  );
}
