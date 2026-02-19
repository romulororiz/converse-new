import { profileUpdateSchema, type UserProfile } from '@/lib/core';
import { queryNeon } from '@/lib/db/neon';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { ensureUserProfileExists } from '@/lib/server/profile';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateRequestSchema = z.object({
  updates: profileUpdateSchema,
});

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await ensureUserProfileExists(user.id, user.email, user.fullName);

    const rows = await queryNeon<UserProfile>(
      `
        SELECT id, email, full_name, avatar_url, bio, reading_preferences, favorite_genres, reading_goals
        FROM profiles
        WHERE id = $1
        LIMIT 1
      `,
      [user.id]
    );

    return NextResponse.json(rows[0] ?? null);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await ensureUserProfileExists(user.id, user.email, user.fullName);

    const body = await request.json();
    const parsed = updateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { updates } = parsed.data;

    const rows = await queryNeon<UserProfile>(
      `
        UPDATE profiles
        SET
          full_name = COALESCE($2, full_name),
          bio = COALESCE($3, bio),
          favorite_genres = COALESCE($4, favorite_genres),
          reading_goals = COALESCE($5, reading_goals),
          updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, full_name, avatar_url, bio, reading_preferences, favorite_genres, reading_goals
      `,
      [user.id, updates.full_name ?? null, updates.bio ?? null, updates.favorite_genres ?? null, updates.reading_goals ?? null]
    );

    return NextResponse.json(rows[0] ?? null);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    );
  }
}
