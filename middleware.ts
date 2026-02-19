import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/books', '/discover', '/pricing', '/auth'];

export async function middleware(request: NextRequest) {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const pathname = request.nextUrl.pathname;
  const hasVerifier = request.nextUrl.searchParams.has('neon_auth_session_verifier');
  
  console.log(`[MW] ${pathname} hasVerifier=${hasVerifier} baseUrl=${!!baseUrl}`);
  
  if (!baseUrl) {
    return NextResponse.next();
  }

  try {
    const { auth } = await import('@/lib/auth/server');
    const mw = auth.middleware({ loginUrl: '/auth/sign-in' });
    const result = await mw(request as Parameters<typeof mw>[0]);
    
    console.log(`[MW] Result: status=${result.status} location=${result.headers.get('location')}`);
    
    const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
    
    if (isPublic && result.status === 307) {
      const location = result.headers.get('location') || '';
      if (location.includes('/auth/sign-in')) {
        console.log(`[MW] Public route redirect to sign-in, allowing through`);
        return NextResponse.next();
      }
    }
    
    return result;
  } catch (e: unknown) {
    console.error(`[MW] ERROR:`, e instanceof Error ? e.message : String(e));
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
