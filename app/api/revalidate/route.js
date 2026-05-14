import { revalidateTag } from 'next/cache';

const sharedSecret = () => process.env.REVALIDATE_SECRET || process.env.CRON_SECRET;

function bearerMatches(request) {
  const secret = sharedSecret();
  if (!secret) return false;
  const auth = request.headers.get('authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const qp = request.nextUrl.searchParams.get('secret');
  return bearer === secret || qp === secret;
}

/**
 * Busts the server cache for tennis aggregate data (`tennis-matches` tag).
 * Vercel Cron sends GET with `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
 * Manual: same header, or `?secret=` (only over HTTPS).
 */
export async function GET(request) {
  if (!sharedSecret()) {
    return Response.json({ ok: false, message: 'Set CRON_SECRET or REVALIDATE_SECRET' }, { status: 503 });
  }
  if (!bearerMatches(request)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag('tennis-matches');
  return Response.json({ ok: true, revalidated: 'tennis-matches' });
}

export async function POST(request) {
  if (!sharedSecret()) {
    return Response.json({ ok: false, message: 'Set CRON_SECRET or REVALIDATE_SECRET' }, { status: 503 });
  }
  if (!bearerMatches(request)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag('tennis-matches');
  return Response.json({ ok: true, revalidated: 'tennis-matches' });
}
