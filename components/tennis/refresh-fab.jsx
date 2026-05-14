'use client';

export function RefreshFab({ refreshing, onRefresh }) {
  return (
    <button
      type="button"
      aria-label="Refresh scores"
      disabled={refreshing}
      onClick={onRefresh}
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
  );
}
