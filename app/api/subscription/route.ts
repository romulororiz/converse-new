import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { canSendMessage, getUserSubscription } from '@/lib/server/subscription';
import { ensureUserProfileExists } from '@/lib/server/profile';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await ensureUserProfileExists(user.id, user.email, user.fullName);

    const [subscription, messageInfo] = await Promise.all([
      getUserSubscription(user.id),
      canSendMessage(user.id),
    ]);

    return NextResponse.json({
      subscription,
      messageInfo,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load subscription data' },
      { status: 500 }
    );
  }
}
