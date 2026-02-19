import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { getUserChats } from '@/lib/server/chat';
import { ensureUserProfileExists } from '@/lib/server/profile';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await ensureUserProfileExists(user.id, user.email, user.fullName);

    const chats = await getUserChats(user.id, 100);
    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load chats' },
      { status: 500 }
    );
  }
}
