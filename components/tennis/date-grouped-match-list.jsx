'use client';

import { fmtDate, localDateFromMs } from '@/lib/date-fmt';
import { MatchListByTournament } from '@/components/tennis/match-list-by-tournament';
import { MatchListFlat } from '@/components/tennis/match-list-flat';

export function DateGroupedMatchList({ matches, tourFilter, descending, getCardProps }) {
  const sorted = [...matches].sort((a, b) =>
    descending ? (b.startMs || 0) - (a.startMs || 0) : (a.startMs || 0) - (b.startMs || 0),
  );
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
          {tourFilter === 'all' ? (
            <MatchListFlat matches={ms} descending={descending} getCardProps={getCardProps} />
          ) : (
            <MatchListByTournament matches={ms} getCardProps={getCardProps} />
          )}
        </div>
      ))}
    </>
  );
}
