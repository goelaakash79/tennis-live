export function SkeletonBlock({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="mb-2.5 flex flex-col gap-2.5 rounded-[14px] border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900"
        >
          <div className="h-3.5 w-[70%] animate-shimmer rounded-md bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 bg-[length:200%_100%] dark:from-stone-800 dark:via-stone-700 dark:to-stone-800" />
          <div className="h-3.5 w-1/2 animate-shimmer rounded-md bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 bg-[length:200%_100%] dark:from-stone-800 dark:via-stone-700 dark:to-stone-800" />
          <div className="h-3.5 w-[35%] animate-shimmer rounded-md bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 bg-[length:200%_100%] dark:from-stone-800 dark:via-stone-700 dark:to-stone-800" />
        </div>
      ))}
    </>
  );
}
