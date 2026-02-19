import { createNeonAuth } from '@neondatabase/auth/next/server';

const baseUrl = process.env.NEON_AUTH_BASE_URL ?? '';
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET ?? 'preview-secret-placeholder-not-for-production';

if (!baseUrl) {
  console.warn('[ConversAI] NEON_AUTH_BASE_URL not set — auth features disabled in preview mode.');
}

// Export a no-op auth object when env vars are missing
export const auth = baseUrl
  ? createNeonAuth({ baseUrl, cookies: { secret: cookieSecret } })
  : ({ middleware: () => (req: Request) => new Response(null, { status: 200 }) } as ReturnType<typeof createNeonAuth>);
