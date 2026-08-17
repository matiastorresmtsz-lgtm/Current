import { auth } from '@clerk/nextjs/server';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ message: 'Server not configured with SUPABASE_SERVICE_ROLE_KEY' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Invalid JSON' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const { path, payload, query, method = 'POST' } = body;
  if (!path) {
    return new Response(JSON.stringify({ message: 'Missing path' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // ensure the user_id is set to the authenticated Clerk user
  const finalPayload = Array.isArray(payload) ? payload : { ...payload, user_id: userId };

  const url = new URL(`/rest/v1/${path}`, `${SUPABASE_URL}/`);
  if (query) url.search = query;

  const fetchOpts: any = {
    method: method.toUpperCase(),
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  };

  if (fetchOpts.method !== 'GET') {
    fetchOpts.body = JSON.stringify(finalPayload);
  }

  const res = await fetch(url.toString(), fetchOpts);

  const text = await res.text().catch(() => '');
  const contentType = res.headers.get('content-type') || 'application/json';
  return new Response(text || '', { status: res.status, headers: { 'content-type': contentType } });
}
