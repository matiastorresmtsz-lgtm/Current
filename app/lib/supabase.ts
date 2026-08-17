import type { PortfolioAsset } from '../types';

export interface UserSettingsPayload {
  user_id: string;
  country?: string;
  currency?: string;
  goal_type?: string | null;
  goal_amount?: number | null;
  goal_deadline?: string | null;
  custom_goal_name?: string | null;
  is_public?: boolean;
  updated_at?: string;
}

export interface PortfolioSnapshotPayload {
  user_id: string;
  holdings: PortfolioAsset[];
  currency?: string;
  portfolio_value?: number;
  total_cost?: number;
  pnl?: number;
  is_latest?: boolean;
  updated_at?: string;
}

export interface LeaderboardEntryPayload {
  user_id: string;
  username: string;
  avatar_url?: string | null;
  country?: string;
  portfolio_value: number;
  change_24h: number;
  win_rate: number;
  rank?: number;
  updated_at?: string;
}

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '');
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

async function supabaseRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown,
  queryString?: string,
  authToken?: string,
): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;

  const url = new URL(`/rest/v1/${path}`, `${SUPABASE_URL}/`);
  if (queryString) {
    url.search = queryString;
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${authToken ?? SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (err) {
    console.error('Supabase request network error:', { path, url: url.toString(), err });
    return null;
  }

  if (!response.ok) {
    let parsedBody: any = '';
    try {
      const text = await response.text();
      try {
        parsedBody = JSON.parse(text);
      } catch {
        parsedBody = text;
      }
    } catch (e) {
      parsedBody = '<unreadable response body>';
    }

    const statusText = response.statusText;
    console.error('Supabase request failed:', {
      path,
      url: url.toString(),
      status: response.status,
      statusText,
      body: parsedBody,
    });
    return null;
  }

  if (response.status === 204) return null;
  return (await response.json()) as T;
}

export async function getUserSettings(userId: string, authToken?: string): Promise<UserSettingsPayload | null> {
  const query = `select=*&user_id=eq.${encodeURIComponent(userId)}&order=updated_at.desc&limit=1`;
  try {
    const resp = await fetch('/api/supabase/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'user_settings', query, method: 'GET' }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return Array.isArray(data) ? data[0] ?? null : data;
  } catch (err) {
    return null;
  }
}

export async function upsertUserSettings(settings: UserSettingsPayload, authToken?: string): Promise<UserSettingsPayload | null> {
  const payload = {
    ...settings,
    updated_at: new Date().toISOString(),
  };

  const query = `on_conflict=user_id`;
  try {
    const resp = await fetch('/api/supabase/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'user_settings', payload, query }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return Array.isArray(data) ? data[0] ?? null : data;
  } catch (err) {
    return null;
  }
}

export async function getUserPortfolio(userId: string, authToken?: string): Promise<PortfolioAsset[] | null> {
  const query = `select=holdings&user_id=eq.${encodeURIComponent(userId)}&order=updated_at.desc&limit=1`;
  try {
    const resp = await fetch('/api/supabase/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'portfolio_snapshots', query, method: 'GET' }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return Array.isArray(data[0]?.holdings) ? data[0].holdings : null;
  } catch (err) {
    return null;
  }
}

export async function upsertPortfolioSnapshot(snapshot: PortfolioSnapshotPayload, authToken?: string): Promise<PortfolioAsset[] | null> {
  const payload = {
    ...snapshot,
    portfolio_value: Number(snapshot.portfolio_value ?? 0),
    total_cost: Number(snapshot.total_cost ?? 0),
    pnl: Number(snapshot.pnl ?? 0),
    is_latest: true,
    updated_at: new Date().toISOString(),
  };

  try {
    const resp = await fetch('/api/supabase/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'portfolio_snapshots', payload }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return Array.isArray(data[0]?.holdings) ? data[0].holdings : null;
  } catch (err) {
    return null;
  }
}

export async function upsertLeaderboardEntry(entry: LeaderboardEntryPayload, authToken?: string): Promise<LeaderboardEntryPayload | null> {
  const payload = {
    ...entry,
    rank: Number(entry.rank ?? 1),
    portfolio_value: Number(entry.portfolio_value ?? 0),
    change_24h: Number(entry.change_24h ?? 0),
    win_rate: Number(entry.win_rate ?? 0),
    updated_at: new Date().toISOString(),
  };

  const query = `on_conflict=user_id`;
  try {
    const resp = await fetch('/api/supabase/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'leaderboard_entries', payload, query }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return Array.isArray(data) ? data[0] ?? null : data;
  } catch (err) {
    return null;
  }
}

export async function getLeaderboardEntries(limit = 25, authToken?: string): Promise<LeaderboardEntryPayload[] | null> {
  const query = `select=*&order=portfolio_value.desc,updated_at.desc&limit=${limit}`;
  try {
    const resp = await fetch('/api/supabase/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'leaderboard_entries', query, method: 'GET' }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return Array.isArray(data) ? data : null;
  } catch (err) {
    return null;
  }
}
