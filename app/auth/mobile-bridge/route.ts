import { type NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { auth } from '@/lib/auth/server';

/**
 * Mobile OAuth bridge — called after Google OAuth completes in the WebBrowser.
 *
 * Flow:
 * 1. The Neon Auth middleware (running on this path) has already exchanged
 *    the `neon_auth_session_verifier` token for a valid session cookie.
 * 2. This handler reads the session, creates a 30-day signed JWT,
 *    and redirects to the `converse://oauth/callback` deep link.
 * 3. The mobile app captures the redirect URL from WebBrowser and
 *    stores the JWT in SecureStore for Bearer token auth.
 */
export async function GET(request: NextRequest) {
  const { data } = await auth.getSession();
  const user = data?.user;

  if (!user?.id) {
    // No valid session — OAuth must have failed; redirect back to sign-in
    return NextResponse.redirect(new URL('/auth/sign-in?error=oauth_failed', request.url));
  }

  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!secret) {
    return NextResponse.redirect(new URL('/auth/sign-in?error=server_error', request.url));
  }

  // Mint a 30-day signed JWT for the mobile app to use as a Bearer token.
  // The same cookie secret is used, so the backend can verify it without
  // an external JWKS call.
  const jwt = await new SignJWT({
    email: user.email ?? null,
    name: user.name ?? null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(new TextEncoder().encode(secret));

  // Redirect to the app's deep link — ASWebAuthenticationSession/Custom Tabs
  // intercepts the `converse://` scheme and closes the browser, returning
  // the URL (with the token) to the calling Expo app.
  const appUrl = new URL('converse://oauth/callback');
  appUrl.searchParams.set('token', jwt);

  return NextResponse.redirect(appUrl);
}
