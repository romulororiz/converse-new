import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/books', '/discover', '/pricing', '/auth'];

export async function middleware(request: NextRequest) {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl) {
    return NextResponse.next();
  }

  try {
    const { auth } = await import('@/lib/auth/server');
    
    // Use Neon Auth middleware for session verifier exchange + route protection
    const mw = auth.middleware({ loginUrl: '/auth/sign-in' });
    const result = await mw(request as Parameters<typeof mw>[0]);
    
    // If it's a redirect to sign-in but the route is public, allow it instead
    const pathname = request.nextUrl.pathname;
    const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
    
    if (isPublic && result.status === 307) {
      const location = result.headers.get('location') || '';
      if (location.includes('/auth/sign-in')) {
        return NextResponse.next();
      }
    }
    
    return result;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
