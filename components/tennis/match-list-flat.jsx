'use client';

import { MatchCard } from '@/components/match-card';
import { EmptyState } from '@/components/tennis/empty-state';

export function MatchListFlat({ matches, descending = false, getCardProps }) {
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
            <MatchCard match={m} {...getCardProps(m)} />
          </div>
        );
      })}
    </>
  );
}
