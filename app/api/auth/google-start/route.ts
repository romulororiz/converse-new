import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/google-start?callbackURL=<url>
 *
 * Bridge endpoint so the Expo WebBrowser can initiate Google OAuth via a GET
 * request. Better Auth's sign-in/social only accepts POST, so we:
 *
 * 1. POST to /api/auth/sign-in/social server-side to get the Google OAuth URL
 *    and the challenge cookie (set by Neon Auth as a Set-Cookie header).
 * 2. Return a 302 redirect to that Google URL, forwarding the challenge cookie.
 *
 * The WebBrowser follows the redirect chain:
 *   /api/auth/google-start → Google OAuth → Neon Auth callback
 *   → /auth/mobile-bridge (verifier exchange via middleware)
 *   → converse://oauth/callback?token=JWT  ← WebBrowser closes here
 */
export async function GET(request: NextRequest) {
  const callbackURL = request.nextUrl.searchParams.get('callbackURL') ?? '';

  if (!callbackURL) {
    return NextResponse.redirect(new URL('/auth/sign-in?error=missing_callback', request.url));
  }

  // Call the Better Auth social sign-in endpoint server-side.
  // This returns the Google OAuth URL and sets the challenge cookie.
  const origin = request.nextUrl.origin;
  const signInResponse = await fetch(`${origin}/api/auth/sign-in/social`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Forward any browser cookies (likely empty at this point)
      ...(request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {}),
    },
    body: JSON.stringify({ provider: 'google', callbackURL }),
    // Do not auto-follow redirects — we need the raw response
    redirect: 'manual',
  });

  // Collect Set-Cookie headers (challenge cookie that must reach the browser)
  const setCookies: string[] = [];
  try {
    signInResponse.headers.getSetCookie().forEach((c) => setCookies.push(c));
  } catch {
    const raw = signInResponse.headers.get('set-cookie');
    if (raw) setCookies.push(raw);
  }

  // Resolve the Google OAuth URL from the response
  let googleUrl: string | null = null;

  if (signInResponse.status === 301 || signInResponse.status === 302) {
    googleUrl = signInResponse.headers.get('location');
  } else if (signInResponse.ok) {
    try {
      const body = (await signInResponse.json()) as { url?: string; data?: { url?: string } };
      googleUrl = body.url ?? body.data?.url ?? null;
    } catch {
      // ignore parse errors
    }
  }

  if (!googleUrl) {
    return NextResponse.redirect(new URL('/auth/sign-in?error=oauth_start_failed', request.url));
  }

  // Redirect the browser to Google OAuth, forwarding the challenge cookie so
  // Neon Auth can verify the OAuth callback later.
  const redirect = NextResponse.redirect(googleUrl);
  for (const cookie of setCookies) {
    redirect.headers.append('set-cookie', cookie);
  }
  return redirect;
}
