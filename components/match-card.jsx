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
  if (p.flagCode) {
    return (
      <span className="inline-flex min-w-[1.4rem] flex-shrink-0 items-center justify-center rounded px-1 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-wide text-stone-600 dark:text-stone-400 bg-stone-200 dark:bg-stone-700">
        {p.flagCode}
      </span>
    );
  }
  return <span className="min-w-[1.4rem] flex-shrink-0" />;
}

function buildSetScores(match) {
  const { sets, status, currentGame } = match;
  if (!sets?.length) return null;

  const p1Cols = sets.map((s, i) => {
    const isLast = i === sets.length - 1 && status === 'live';
    const won = s.p1 > s.p2;
    return (
      <div
        key={`p1-${i}`}
        className={
          isLast
            ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded border-0 bg-stone-700 font-mono text-[15px] font-bold tabular-nums leading-[2.1] text-stone-50'
            : `w-[22px] text-center font-mono text-[0.88rem] font-bold tabular-nums sm:w-[26px] sm:text-[0.95rem] ${won
              ? 'text-stone-900 dark:text-stone-50'
              : 'text-stone-600 dark:text-stone-400'
              }`
        }
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
        className={
          isLast
            ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded border-0 bg-stone-700 font-mono text-[15px] font-bold tabular-nums leading-[2.1] text-stone-50'
            : `w-[22px] text-center font-mono text-[0.88rem] font-bold tabular-nums sm:w-[26px] sm:text-[0.95rem] ${won
              ? 'text-stone-900 dark:text-stone-50'
              : 'text-stone-600 dark:text-stone-400'
              }`
        }
      >
        {s.p2}
      </div>
    );
  });

  let p1game = null;
  let p2game = null;
  if (status === 'live' && currentGame) {
    p1game = (
      <div className="flex h-8 w-8 min-w-8 shrink-0 items-center justify-center rounded bg-[rgba(100,145,48,0.28)] px-0 py-0 font-mono text-[14px] font-bold leading-[2.1] text-green-950 dark:bg-[rgba(137,205,81,0.4)] dark:text-white">
        {currentGame.p1}
      </div>
    );
    p2game = (
      <div className="flex h-8 w-8 min-w-8 shrink-0 items-center justify-center rounded bg-[rgba(100,145,48,0.28)] px-0 py-0 font-mono text-[14px] font-bold leading-[2.1] text-green-950 dark:bg-[rgba(137,205,81,0.4)] dark:text-white">
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

export function MatchCard({ match, isFavorite = false, onToggleFavorite }) {
  const { status, round, court, date, p1, p2, winner } = match;
  const isLive = status === 'live';
  const isPast = status === 'past';
  const isUpcoming = status === 'upcoming';
  const scoreCols = buildSetScores(match);
  const p1IsWinner = isPast && winner === 'p1';
  const p2IsWinner = isPast && winner === 'p2';

  const timeLabel = [fmtDate(date), fmtTime(match.startMs)].filter(Boolean).join(' · ');
  const msToStart = (match.startMs || 0) - Date.now();
  const showCountdown = isUpcoming && msToStart > 0 && msToStart <= 2 * 60 * 60 * 1000;
  const totalMins = Math.ceil(msToStart / 60000);
  const leftHours = Math.floor(totalMins / 60);
  const leftMins = totalMins % 60;
  const countdownLabel = `Starts in ${leftHours ? `${leftHours}h ` : ''}${leftMins}m`;

  const surface = match.tournament?.surface;
  const courtLabel = court || null;
  const surfaceChip = !courtLabel && surface ? surface : null;

  const borderClass = 'border border-stone-200 dark:border-stone-700';

  const inner = (
    <div
      className={`rounded-[14px] overflow-hidden bg-white transition-transform active:scale-[0.985] dark:bg-stone-900 ${borderClass}`}
    >
      {/* Top bar */}
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
        {isUpcoming && (
          <span className="font-mono text-[0.68rem] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Upcoming
          </span>
        )}
        {round ? (
          <span className="font-mono text-[0.68rem] font-medium text-stone-600 dark:text-stone-400">
            {round}
          </span>
        ) : null}
        {(courtLabel || surfaceChip || isLive) ? (
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {courtLabel ? (
              <span className="rounded-full bg-green-600/10 px-2 py-0.5 font-mono text-[0.68rem] font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
                {courtLabel}
              </span>
            ) : surfaceChip ? (
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[0.68rem] font-semibold uppercase tracking-wide ${SURFACE_BADGE[surface] || SURFACE_BADGE.hard
                  }`}
              >
                {surfaceChip}
              </span>
            ) : null}
            {isLive ? (
              <button
                type="button"
                onClick={() => onToggleFavorite?.(match.id)}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                title={isFavorite ? 'Unfavorite' : 'Favorite'}
                className={`rounded-full p-1 transition-colors ${isFavorite
                  ? 'text-red-500 hover:bg-red-500/10'
                  : 'text-stone-500 hover:bg-stone-200/80 dark:text-stone-400 dark:hover:bg-stone-700/80'
                  }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Players + scores */}
      <div className="px-3.5 py-3">
        <div className="flex flex-col gap-2.5">
          {/* Player 1 */}
          <div className="flex items-center gap-2.5">
            <PlayerFlag p={p1} />
            <span
              className={`min-w-0 flex-1 truncate text-[0.9rem] font-semibold tracking-tight sm:text-[0.95rem] ${p1IsWinner
                ? 'font-bold text-stone-900 dark:text-stone-50'
                : 'text-stone-600 dark:text-stone-400'
                }`}
            >
              {p1.name}
              {p1.rank != null ? (
                <span className="ml-1.5 font-mono text-[0.65rem] font-semibold tabular-nums text-stone-500 dark:text-stone-400">
                  #{p1.rank}
                </span>
              ) : null}
              {isLive && p1.serving ? (
                <span className="ml-1.5 text-[0.85rem] leading-none" aria-label="Serving">
                  🎾
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

          {/* Player 2 */}
          <div className="flex items-center gap-2.5">
            <PlayerFlag p={p2} />
            <span
              className={`min-w-0 flex-1 truncate text-[0.9rem] font-semibold tracking-tight sm:text-[0.95rem] ${p2IsWinner
                ? 'font-bold text-stone-900 dark:text-stone-50'
                : 'text-stone-600 dark:text-stone-400'
                }`}
            >
              {p2.name}
              {p2.rank != null ? (
                <span className="ml-1.5 font-mono text-[0.65rem] font-semibold tabular-nums text-stone-500 dark:text-stone-400">
                  #{p2.rank}
                </span>
              ) : null}
              {isLive && p2.serving ? (
                <span className="ml-1.5 text-[0.85rem] leading-none" aria-label="Serving">
                  🎾
                </span>
              ) : null}
            </span>
            {scoreCols ? scoreCols.p2 : null}
          </div>
        </div>
      </div>

      {/* Footer — hidden for live matches */}
      {!isLive ? (
        <div className="flex items-center justify-between border-t border-stone-200 px-3.5 py-2 dark:border-stone-600/40">
          <span className="flex items-center gap-1.5 font-mono text-[0.75rem] text-stone-600 dark:text-stone-400">
            <span className="text-[0.8rem] opacity-60" aria-hidden>
              🕐
            </span>
            {timeLabel}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {showCountdown ? (
              <span className="rounded-full bg-amber-500/10 px-4 py-0.5 font-mono text-[10px] font-semibold text-amber-800 dark:text-amber-400 uppercase">
                {countdownLabel}
              </span>
            ) : null}
            {match.duration ? (
              <span className="font-mono text-[0.72rem] text-stone-400 dark:text-stone-500">
                ⏱ {match.duration}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onToggleFavorite?.(match.id)}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={isFavorite ? 'Unfavorite' : 'Favorite'}
              className={`rounded-full p-1.5 transition-colors ${isFavorite
                ? 'text-red-500 hover:bg-red-500/10'
                : 'text-stone-400 hover:bg-stone-200 dark:text-stone-500 dark:hover:bg-stone-700'
                }`}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  return <div className="mb-2.5">{inner}</div>;
}

export function surfaceBadgeClass(surface) {
  return SURFACE_BADGE[surface] || SURFACE_BADGE.hard;
}
