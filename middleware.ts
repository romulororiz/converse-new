import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/server';

const authMiddleware = auth.middleware({
  loginUrl: '/auth/sign-in',
});

function legacyRedirect(path: string, prefix: string, replaceWith: string): string | null {
  if (path === prefix) return replaceWith;
  if (path.startsWith(prefix + '/')) return replaceWith + path.slice(prefix.length);
  return null;
}

export default function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  // Legacy redirects: /d and /app -> root-level app routes
  const fromD = legacyRedirect(path, '/d', '/home');
  if (fromD) return NextResponse.redirect(new URL(fromD + search, request.url));
  const fromApp = legacyRedirect(path, '/app', '/home');
  if (fromApp) return NextResponse.redirect(new URL(fromApp + search, request.url));
  return authMiddleware(request);
}

export const config = {
  matcher: [
    '/home',
    '/books',
    '/book/:path*',
    '/chat/:path*',
    '/chats',
    '/discover',
    '/profile',
    '/settings',
    '/billing',
    '/goals',
    '/highlights',
    '/app',
    '/app/:path*',
    '/d',
    '/d/:path*',
    // Mobile OAuth bridge — Neon Auth middleware must run here so the
    // verifier token exchange happens before the route handler executes.
    '/auth/mobile-bridge',
  ],
};
