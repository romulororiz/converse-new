import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl) {
    // Preview mode — allow all requests through
    return NextResponse.next();
  }
  try {
    const { auth } = await import('@/lib/auth/server');
    return auth.middleware({ loginUrl: '/auth/sign-in' })(request as Parameters<ReturnType<typeof auth.middleware>>[0]);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/app/:path*'],
};
