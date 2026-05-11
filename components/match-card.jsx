'use client';

import { fmtDate, fmtTime } from '@/lib/date-fmt';

const SURFACE_BADGE = {
  clay: 'bg-[rgba(196,108,60,0.15)] text-[#e08860]',
  grass: 'bg-[rgba(46,204,113,0.15)] text-[#5ecc88]',
  hard: 'bg-[rgba(52,152,219,0.15)] text-[#5daee8]',
  indoor: 'bg-[rgba(149,117,205,0.15)] text-[#b39ddb]',
};

function PlayerFlag({ p }) {
  if (p.flagEmoji) {
    return (
      <span className="min-w-[1.4rem] flex-shrink-0 text-center text-[1.1rem] leading-none">
        {p.flagEmoji}
      </span>
    );
  }
  return (
    <span className="inline-flex min-w-[1.4rem] flex-shrink-0 items-center justify-center rounded px-1 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wide text-stone-600 dark:text-stone-400 bg-stone-200 dark:bg-stone-700">
      {p.flagCode || '?'}
    </span>
  );
}

function buildSetScores(match) {
  const { sets, status, currentGame, p1, p2 } = match;
  if (!sets?.length) return null;

  const servingP1 = p1.serving;

  const p1Cols = sets.map((s, i) => {
    const isLast = i === sets.length - 1 && status === 'live';
    const won = s.p1 > s.p2;
    return (
      <div
        key={`p1-${i}`}
        className={`w-[22px] text-center font-mono text-[0.88rem] font-bold tabular-nums sm:w-[26px] sm:text-[0.95rem] ${
          won ? 'text-stone-900 dark:text-stone-50' : 'text-stone-600 dark:text-stone-400'
        } ${isLast ? 'w-6 rounded bg-red-500/10 text-red-600 dark:text-red-400' : ''}`}
      >
        {s.p1}
      </div>
    );
  });

  const p2Cols = sets.map((s, i) => {
    const isLast = i === sets.length - 1 && status === 'live';
    const won = s.p2 > s.p1;
    return (
      <div
        key={`p2-${i}`}
        className={`w-[22px] text-center font-mono text-[0.88rem] font-bold tabular-nums sm:w-[26px] sm:text-[0.95rem] ${
          won ? 'text-stone-900 dark:text-stone-50' : 'text-stone-600 dark:text-stone-400'
        } ${isLast ? 'w-6 rounded bg-red-500/10 text-red-600 dark:text-red-400' : ''}`}
      >
        {s.p2}
      </div>
    );
  });

  let p1game = null;
  let p2game = null;
  if (status === 'live' && currentGame) {
    p1game = (
      <div className="flex min-w-[26px] items-center justify-center gap-0.5 rounded bg-green-600/10 px-0 py-px font-mono text-[0.75rem] font-bold text-green-600 dark:bg-green-400/10 dark:text-green-400">
        {servingP1 ? (
          <span className="text-[0.5rem] leading-none text-green-600 dark:text-green-400">●</span>
        ) : null}
        {currentGame.p1}
      </div>
    );
    p2game = (
      <div className="flex min-w-[26px] items-center justify-center gap-0.5 rounded bg-green-600/10 px-0 py-px font-mono text-[0.75rem] font-bold text-green-600 dark:bg-green-400/10 dark:text-green-400">
        {!servingP1 ? (
          <span className="text-[0.5rem] leading-none text-green-600 dark:text-green-400">●</span>
        ) : null}
        {currentGame.p2}
      </div>
    );
  }

  return {
    p1: (
      <div className="flex flex-shrink-0 items-center gap-1">
        {p1Cols}
        {p1game}
      </div>
    ),
    p2: (
      <div className="flex flex-shrink-0 items-center gap-1">
        {p2Cols}
        {p2game}
      </div>
    ),
  };
}

export function MatchCard({ match }) {
  const { status, round, court, date, p1, p2, winner, currentGame } = match;
  const isLive = status === 'live';
  const isPast = status === 'past';
  const scoreCols = buildSetScores(match);
  const p1IsWinner = isPast && winner === 'p1';
  const p2IsWinner = isPast && winner === 'p2';

  const timeLabel = [fmtDate(date), fmtTime(match.startMs)].filter(Boolean).join(' · ');

  return (
    <div
      className={`mb-2.5 overflow-hidden rounded-[14px] border bg-white transition-transform active:scale-[0.985] dark:bg-stone-900 ${
        isLive
          ? 'border-red-500/30 shadow-[0_0_0_1px_rgba(231,76,60,0.1),0_4px_20px_rgba(231,76,60,0.08)]'
          : 'border-stone-200 dark:border-stone-700'
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-stone-200 bg-stone-100 px-3.5 py-2 dark:border-stone-600/40 dark:bg-stone-800">
        {isLive && (
          <span className="font-mono text-[0.68rem] font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
            ● Live
          </span>
        )}
        {isPast && (
          <span className="font-mono text-[0.68rem] font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500">
            Completed
          </span>
        )}
        {!isLive && !isPast && (
          <span className="font-mono text-[0.68rem] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Upcoming
          </span>
        )}
        {round ? (
          <span className="font-mono text-[0.68rem] font-medium text-stone-600 dark:text-stone-400">
            {round}
          </span>
        ) : null}
        {court ? (
          <span className="ml-auto shrink-0 rounded-full bg-green-600/10 px-2 py-0.5 font-mono text-[0.68rem] font-semibold text-green-700 dark:text-green-400">
            {court}
          </span>
        ) : null}
      </div>
      <div className="px-3.5 py-3">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <PlayerFlag p={p1} />
            <span
              className={`min-w-0 flex-1 truncate text-[0.9rem] font-semibold tracking-tight sm:text-[0.95rem] ${
                p1IsWinner
                  ? 'font-bold text-stone-900 dark:text-stone-50'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              {p1.name}
              {p1.rank ? (
                <span className="ml-1 text-[0.65rem] font-normal text-stone-400 dark:text-stone-500">
                  #{p1.rank}
                </span>
              ) : null}
            </span>
            {scoreCols ? (
              scoreCols.p1
            ) : (
              <span className="font-mono text-[0.75rem] italic text-stone-400">vs</span>
            )}
          </div>
          <div className="h-px bg-stone-200 dark:bg-stone-600/40" />
          <div className="flex items-center gap-2.5">
            <PlayerFlag p={p2} />
            <span
              className={`min-w-0 flex-1 truncate text-[0.9rem] font-semibold tracking-tight sm:text-[0.95rem] ${
                p2IsWinner
                  ? 'font-bold text-stone-900 dark:text-stone-50'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              {p2.name}
              {p2.rank ? (
                <span className="ml-1 text-[0.65rem] font-normal text-stone-400 dark:text-stone-500">
                  #{p2.rank}
                </span>
              ) : null}
            </span>
            {scoreCols ? scoreCols.p2 : null}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-stone-200 px-3.5 py-2 dark:border-stone-600/40">
        <span className="flex items-center gap-1.5 font-mono text-[0.75rem] text-stone-600 dark:text-stone-400">
          <span className="text-[0.8rem] opacity-60">🕐</span>
          {timeLabel}
        </span>
        {isLive && currentGame ? (
          <span className="animate-blink rounded-full bg-red-500/10 px-2 py-0.5 font-mono text-[0.72rem] font-bold text-red-600 dark:text-red-400">
            {currentGame.p1} – {currentGame.p2}
          </span>
        ) : match.duration ? (
          <span className="font-mono text-[0.72rem] text-stone-400 dark:text-stone-500">
            ⏱ {match.duration}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function surfaceBadgeClass(surface) {
  return SURFACE_BADGE[surface] || SURFACE_BADGE.hard;
}
