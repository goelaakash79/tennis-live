import { fetchTennis } from '@/lib/tennis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchTennis();
    return Response.json(data, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return Response.json(
      { error: err.message },
      {
        status: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
      },
    );
  }
}
