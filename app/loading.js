export default function Loading() {
  return (
    <div className="mx-auto max-w-[640px] animate-pulse">
      <header className="border-b border-stone-200 bg-stone-50/95 px-4 pb-2.5 pt-3.5 dark:border-stone-600/40 dark:bg-stone-950/95">
        <div className="mb-3 flex justify-between">
          <div className="h-8 w-40 rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="h-8 w-24 rounded-full bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="flex gap-1">
          <div className="h-10 flex-1 rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="h-10 flex-1 rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="h-10 flex-1 rounded-lg bg-stone-200 dark:bg-stone-800" />
        </div>
      </header>
      <main className="p-4">
        <div className="mb-2.5 h-28 rounded-[14px] bg-stone-200 dark:bg-stone-800" />
        <div className="mb-2.5 h-28 rounded-[14px] bg-stone-200 dark:bg-stone-800" />
        <div className="h-28 rounded-[14px] bg-stone-200 dark:bg-stone-800" />
      </main>
    </div>
  );
}
