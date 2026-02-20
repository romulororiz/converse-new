import { queryNeon } from '@/lib/db/neon';

type SubscriptionPlanName = 'free' | 'premium' | 'trial';

interface SubscriptionPlan {
  id: SubscriptionPlanName;
  name: string;
  price: number;
  message_limit: number;
  features: {
    voice_chat: boolean;
    priority_support: boolean;
    unlimited_messages: boolean;
  };
}

interface UserSubscriptionRow {
  id: string;
  subscription_plan: SubscriptionPlanName | null;
  subscription_status: 'active' | 'inactive' | 'cancelled' | null;
  subscription_expires_at: string | null;
  message_count: number | null;
  message_limit: number | null;
  /** pg driver returns Date objects for date columns; normalized to YYYY-MM-DD string in getUserSubscription */
  last_message_reset_date: string | Date | null;
}

interface MessageUsageRow {
  id: string;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    message_limit: 10,
    features: {
      voice_chat: false,
      priority_support: false,
      unlimited_messages: false,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 4.99,
    message_limit: -1,
    features: {
      voice_chat: true,
      priority_support: true,
      unlimited_messages: true,
    },
  },
  trial: {
    id: 'trial',
    name: 'Trial',
    price: 0,
    message_limit: 10,
    features: {
      voice_chat: false,
      priority_support: false,
      unlimited_messages: false,
    },
  },
};

export interface MessageLimitInfo {
  canSend: boolean;
  remainingMessages: number;
  limit: number;
  plan: SubscriptionPlanName;
}

export interface UserSubscriptionInfo {
  id: string;
  subscription_plan: SubscriptionPlanName;
  subscription_status: 'active' | 'inactive' | 'cancelled';
  subscription_expires_at: string | null;
  message_count: number;
  message_limit: number;
  last_message_reset_date: string | null;
}

function toISODate(date: Date) {
  return date.toISOString().split('T')[0];
}

export async function initializeUserSubscription(userId: string): Promise<void> {
  const today = toISODate(new Date());

  await queryNeon(
    `
      UPDATE profiles
      SET
        subscription_plan = 'free',
        subscription_status = 'active',
        message_count = 0,
        message_limit = 10,
        last_message_reset_date = $2,
        updated_at = NOW()
      WHERE id = $1
    `,
    [userId, today]
  );
}

export async function getUserSubscription(userId: string): Promise<UserSubscriptionInfo | null> {
  const rows = await queryNeon<UserSubscriptionRow>(
    `
      SELECT
        id,
        subscription_plan,
        subscription_status,
        subscription_expires_at,
        message_count,
        message_limit,
        last_message_reset_date::text AS last_message_reset_date
      FROM profiles
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  const profile = rows[0];
  if (!profile) return null;

  if (!profile.subscription_plan) {
    await initializeUserSubscription(userId);
    return getUserSubscription(userId);
  }

  const rawDate = profile.last_message_reset_date;
  const normalizedDate = typeof rawDate === 'string' ? rawDate.slice(0, 10) : null;

  const cleanPlan = (profile.subscription_plan?.trim() ?? 'free') as SubscriptionPlanName;

  return {
    id: profile.id,
    subscription_plan: cleanPlan,
    subscription_status: profile.subscription_status ?? 'active',
    subscription_expires_at: profile.subscription_expires_at,
    message_count: profile.message_count ?? 0,
    message_limit: profile.message_limit ?? SUBSCRIPTION_PLANS[cleanPlan]?.message_limit ?? 10,
    last_message_reset_date: normalizedDate,
  };
}

async function checkAndResetDailyLimit(profile: UserSubscriptionInfo): Promise<UserSubscriptionInfo> {
  const today = toISODate(new Date());

  if (profile.subscription_plan === 'free' && profile.last_message_reset_date !== today) {
    await queryNeon(
      `
        UPDATE profiles
        SET message_count = 0, last_message_reset_date = $2, updated_at = NOW()
        WHERE id = $1
      `,
      [profile.id, today]
    );

    return {
      ...profile,
      message_count: 0,
      last_message_reset_date: today,
    };
  }

  return profile;
}

export async function canSendMessage(userId: string): Promise<MessageLimitInfo> {
  const profile = await getUserSubscription(userId);
  if (!profile) {
    return { canSend: false, remainingMessages: 0, limit: 10, plan: 'free' };
  }

  const normalized = await checkAndResetDailyLimit(profile);
  const plan = SUBSCRIPTION_PLANS[normalized.subscription_plan] ?? SUBSCRIPTION_PLANS.free;
  const remainingMessages =
    plan.message_limit === -1 ? -1 : Math.max(0, plan.message_limit - normalized.message_count);

  return {
    canSend: plan.message_limit === -1 || normalized.message_count < plan.message_limit,
    remainingMessages,
    limit: plan.message_limit,
    plan: normalized.subscription_plan,
  };
}

async function trackMessageUsage(userId: string, sessionId: string): Promise<void> {
  await queryNeon<MessageUsageRow>(
    `
      INSERT INTO message_usage (user_id, session_id, message_count)
      VALUES ($1, $2, 1)
      RETURNING id
    `,
    [userId, sessionId]
  );
}

export async function incrementMessageCount(userId: string, sessionId: string): Promise<void> {
  const profile = await getUserSubscription(userId);
  if (!profile) return;

  const plan = SUBSCRIPTION_PLANS[profile.subscription_plan] ?? SUBSCRIPTION_PLANS.free;
  if (plan.message_limit === -1) {
    await trackMessageUsage(userId, sessionId);
    return;
  }

  await queryNeon(
    `
      UPDATE profiles
      SET message_count = COALESCE(message_count, 0) + 1, updated_at = NOW()
      WHERE id = $1
    `,
    [userId]
  );

  await trackMessageUsage(userId, sessionId);
}

export async function upgradeToPremium(
  userId: string,
  planType: 'monthly' | 'yearly'
): Promise<void> {
  const expiresAt = new Date();
  if (planType === 'yearly') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  await queryNeon(
    `
      UPDATE profiles
      SET
        subscription_plan = 'premium',
        subscription_status = 'active',
        subscription_expires_at = $2,
        message_limit = -1,
        updated_at = NOW()
      WHERE id = $1
    `,
    [userId, expiresAt.toISOString()]
  );
}

export async function downgradeToFree(userId: string): Promise<void> {
  const today = toISODate(new Date());

  await queryNeon(
    `
      UPDATE profiles
      SET
        subscription_plan = 'free',
        subscription_status = 'active',
        subscription_expires_at = NULL,
        message_limit = 10,
        message_count = 0,
        last_message_reset_date = $2,
        updated_at = NOW()
      WHERE id = $1
    `,
    [userId, today]
  );
}
