import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { ensureUserProfileExists } from '@/lib/server/profile';

export async function POST() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureUserProfileExists(user.id, user.email, user.fullName);

  return NextResponse.json({ ok: true });
}
