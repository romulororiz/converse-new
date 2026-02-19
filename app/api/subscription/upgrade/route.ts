import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { upgradeToPremium } from '@/lib/server/subscription';
import { ensureUserProfileExists } from '@/lib/server/profile';

const bodySchema = z.object({
  plan: z.enum(['weekly', 'monthly', 'yearly']).default('yearly'),
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await ensureUserProfileExists(user.id, user.email, user.fullName);

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const plan = parsed.data.plan === 'weekly' ? 'monthly' : parsed.data.plan;
    await upgradeToPremium(user.id, plan);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}
