import { queryNeon } from '@/lib/db/neon';

function normalizeFullName(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function ensureUserProfileExists(
  userId: string,
  email: string | null,
  fullName: string | null
): Promise<void> {
  await queryNeon(
    `
      INSERT INTO profiles (
        id,
        email,
        full_name,
        subscription_plan,
        subscription_status,
        message_count,
        message_limit,
        last_message_reset_date
      )
      VALUES (
        $1,
        COALESCE($2, ''),
        $3,
        'free',
        'active',
        0,
        10,
        CURRENT_DATE
      )
      ON CONFLICT (id)
      DO UPDATE SET
        email = CASE
          WHEN profiles.email IS NULL OR profiles.email = '' THEN EXCLUDED.email
          ELSE profiles.email
        END,
        full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
        subscription_plan = COALESCE(profiles.subscription_plan, 'free'),
        subscription_status = COALESCE(profiles.subscription_status, 'active'),
        message_count = COALESCE(profiles.message_count, 0),
        message_limit = COALESCE(profiles.message_limit, 10),
        last_message_reset_date = COALESCE(profiles.last_message_reset_date, CURRENT_DATE),
        updated_at = NOW()
    `,
    [userId, email, normalizeFullName(fullName)]
  );
}
