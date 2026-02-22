import { jwtVerify } from 'jose';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/server';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  fullName: string | null;
}

/**
 * Authenticate the current request.
 *
 * Supports two auth strategies (tried in order):
 *
 * 1. Bearer JWT (mobile app) — The Expo app stores a signed JWT in SecureStore
 *    (minted by /auth/mobile-bridge after Google OAuth). Every request includes
 *    `Authorization: Bearer <jwt>`. The JWT is verified using the same
 *    NEON_AUTH_COOKIE_SECRET that was used to sign it.
 *
 * 2. Session cookie (web app) — Standard Neon Auth cookie session, read via
 *    `auth.getSession()` which uses Next.js `headers()` automatically.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  // 1. Check for Bearer token (mobile OAuth flow)
  const headerStore = await headers();
  const authHeader = headerStore.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const secret = process.env.NEON_AUTH_COOKIE_SECRET;

    if (secret) {
      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(secret),
          { algorithms: ['HS256'] }
        );

        const userId = payload.sub;
        if (userId && typeof userId === 'string') {
          return {
            id: userId,
            email: (payload['email'] as string | null) ?? null,
            fullName: (payload['name'] as string | null) ?? null,
          };
        }
      } catch {
        // Invalid or expired bearer token — fall through to cookie auth
      }
    }
  }

  // 2. Fall back to session cookie (web users are unaffected)
  const { data } = await auth.getSession();
  const user = data?.user;

  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: user.name ?? null,
  };
}

export async function getAuthenticatedUserId() {
  const user = await getAuthenticatedUser();
  return user?.id ?? null;
}
