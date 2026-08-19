import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const BASE_COUNT = 77;
const BACKUP_FILE = path.join(process.cwd(), '.pro_reactions.json');

interface ReactionsData {
  count: number;
  users: Record<string, boolean>;
}

// In-memory cache
let inMemoryData: ReactionsData = {
  count: BASE_COUNT,
  users: {}
};

// Try to load initial data from backup file
try {
  if (fs.existsSync(BACKUP_FILE)) {
    const raw = fs.readFileSync(BACKUP_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (typeof parsed.count === 'number' && parsed.count >= BASE_COUNT) {
      inMemoryData = parsed;
    }
  }
} catch (e) {
  // ignore
}

function saveBackup(data: ReactionsData) {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data), 'utf-8');
  } catch (e) {
    // ignore
  }
}

// Helper to interact with Supabase if table exists
async function getSupabaseReactions(): Promise<ReactionsData | null> {
  if (!SUPABASE_URL || (!SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_ANON_KEY)) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/pro_reactions?select=*&limit=1`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store'
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return {
          count: Math.max(BASE_COUNT, Number(rows[0].count ?? BASE_COUNT)),
          users: rows[0].users ?? {}
        };
      }
    }
  } catch (e) {
    // fallback to local/in-memory
  }
  return null;
}

async function saveSupabaseReactions(data: ReactionsData) {
  if (!SUPABASE_URL || (!SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_ANON_KEY)) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/pro_reactions`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: 'global_pro_reactions',
        count: data.count,
        users: data.users,
        updated_at: new Date().toISOString()
      }),
    });
  } catch (e) {
    // ignore
  }
}

export async function GET(req: Request) {
  let userId: string | null = null;
  try {
    const clerkAuth = await auth();
    userId = clerkAuth.userId;
  } catch (e) {
    // anonymous user
  }

  // Check Supabase first, otherwise use local persisted state
  const sbData = await getSupabaseReactions();
  if (sbData) {
    inMemoryData = sbData;
    saveBackup(inMemoryData);
  }

  const hasReacted = userId ? Boolean(inMemoryData.users[userId]) : false;

  return NextResponse.json({
    count: inMemoryData.count,
    hasReacted,
    baseCount: BASE_COUNT
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}

export async function POST(req: Request) {
  let userId: string | null = null;
  try {
    const clerkAuth = await auth();
    userId = clerkAuth.userId;
  } catch (e) {
    // anonymous user
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {
    // empty body
  }

  const clientId = userId || body.clientId || 'anonymous_' + Math.random().toString(36).substring(7);

  // Sync latest from Supabase if available
  const sbData = await getSupabaseReactions();
  if (sbData) {
    inMemoryData = sbData;
  }

  const isCurrentlyReacted = Boolean(inMemoryData.users[clientId]);
  let newHasReacted: boolean;

  if (isCurrentlyReacted) {
    delete inMemoryData.users[clientId];
    inMemoryData.count = Math.max(BASE_COUNT, inMemoryData.count - 1);
    newHasReacted = false;
  } else {
    inMemoryData.users[clientId] = true;
    inMemoryData.count = inMemoryData.count + 1;
    newHasReacted = true;
  }

  // Persist
  saveBackup(inMemoryData);
  await saveSupabaseReactions(inMemoryData);

  return NextResponse.json({
    count: inMemoryData.count,
    hasReacted: newHasReacted,
    success: true
  });
}
