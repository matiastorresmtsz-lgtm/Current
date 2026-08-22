import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { deleteProfile, upsertProfile } from '../../../lib/supabase-server';

interface ClerkUserData {
  id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  email_addresses?: Array<{ email_address: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);
    const data = event.data as ClerkUserData;

    if (event.type === 'user.deleted') {
      await deleteProfile(data.id);
      return NextResponse.json({ received: true });
    }

    if (event.type !== 'user.created' && event.type !== 'user.updated') {
      return NextResponse.json({ received: true, ignored: true });
    }

    const emailUsername = data.email_addresses?.[0]?.email_address.split('@')[0];
    await upsertProfile({
      clerk_user_id: data.id,
      username: data.username || emailUsername || 'Trader',
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      image_url: data.image_url || null,
      score: 0,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Clerk webhook processing failed:', error);
    return NextResponse.json({ error: 'Invalid webhook request' }, { status: 400 });
  }
}
