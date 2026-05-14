'use client';

export function TennisHeader({
  tourFilter,
  onTourFilterChange,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  isDark,
  onApplyTheme,
  tab,
  onTabChange,
  liveCount,
}) {
  return (
    <header className="sticky top-0 z-[100] border-b border-stone-200 bg-stone-50/95 backdrop-blur-md dark:border-stone-600/40 dark:bg-stone-950/95">
      <div className="flex items-center justify-between px-4 pb-2.5 pt-3.5">
        <div className="inline-flex gap-0.5 rounded-full bg-stone-100 p-0.5 dark:bg-stone-800">
          {['all', 'atp', 'wta'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onTourFilterChange(f)}
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
            onClick={onToggleFavoritesOnly}
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
              onClick={() => onApplyTheme(false)}
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
              onClick={() => onApplyTheme(true)}
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
            onClick={() => onTabChange(id)}
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
              <span className="text-xs font-medium font-mono">
                • {liveCount}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </header>
  );
}
