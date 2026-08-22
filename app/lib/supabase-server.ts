import 'server-only';

export interface Profile {
  id: string;
  clerk_user_id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  score: number;
  created_at: string;
  updated_at: string;
}

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase server environment variables are not configured');
  }

  return { url: SUPABASE_URL, key: SUPABASE_SERVICE_ROLE_KEY };
}

export async function getProfiles(limit = 100): Promise<Profile[]> {
  const { url, key } = getSupabaseConfig();
  const query = new URLSearchParams({
    select: 'id,clerk_user_id,username,first_name,last_name,image_url,score,created_at,updated_at',
    order: 'score.desc,created_at.asc',
    limit: String(Math.min(Math.max(limit, 1), 100)),
  });

  const response = await fetch(`${url}/rest/v1/profiles?${query}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Supabase profiles query failed with status ${response.status}`);
  }

  return (await response.json()) as Profile[];
}

export async function upsertProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/profiles?on_conflict=clerk_user_id`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error(`Supabase profile upsert failed with status ${response.status}`);
  }
}

export async function deleteProfile(clerkUserId: string) {
  const { url, key } = getSupabaseConfig();
  const query = new URLSearchParams({ clerk_user_id: `eq.${clerkUserId}` });
  const response = await fetch(`${url}/rest/v1/profiles?${query}`, {
    method: 'DELETE',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'return=minimal',
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase profile deletion failed with status ${response.status}`);
  }
}
