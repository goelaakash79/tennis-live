import { TennisApp } from '@/components/tennis-app';
import { fetchTennis } from '@/lib/tennis';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialFetchedAt = Date.now();
  let initialData = null;
  let initialError = null;
  try {
    initialData = await fetchTennis();
  } catch (err) {
    initialError = err?.message || 'Failed to load matches';
  }
  return (
    <TennisApp
      initialData={initialData}
      initialError={initialError}
      initialFetchedAt={initialData != null ? initialFetchedAt : null}
    />
  );
}
