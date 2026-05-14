import { revalidateTag } from 'next/cache';

const secret = () => process.env.REVALIDATE_SECRET;

function authMatches(request) {
  const s = secret();
  if (!s) return false;
  const auth = request.headers.get('authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const qp = request.nextUrl.searchParams.get('secret');
  return bearer === s || qp === s;
}

/**
 * Busts the server cache for tennis aggregate data (`tennis-matches` tag).
 * Call GET or POST /api/revalidate with Authorization: Bearer <REVALIDATE_SECRET>
 * or ?secret= (only over HTTPS).
 */
export async function GET(request) {
  if (!secret()) {
    return Response.json({ ok: false, message: 'Set REVALIDATE_SECRET' }, { status: 503 });
  }
  if (!authMatches(request)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag('tennis-matches');
  return Response.json({ ok: true, revalidated: 'tennis-matches' });
}

export async function POST(request) {
  if (!secret()) {
    return Response.json({ ok: false, message: 'Set REVALIDATE_SECRET' }, { status: 503 });
  }
  if (!authMatches(request)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag('tennis-matches');
  return Response.json({ ok: true, revalidated: 'tennis-matches' });
}
