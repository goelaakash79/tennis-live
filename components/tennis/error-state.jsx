export function ErrorState({ message, onRetry }) {
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
