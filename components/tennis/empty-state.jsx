export function EmptyState({ message = 'No matches right now.' }) {
  return (
    <div className="px-5 py-16 text-center text-stone-400 dark:text-stone-500">
      <div className="mb-3 text-5xl">🎾</div>
      <p className="text-[0.9rem]">{message}</p>
    </div>
  );
}
