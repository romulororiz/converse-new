import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl) {
    return NextResponse.next();
  }
  try {
    const { auth } = await import('@/lib/auth/server');
    const mw = auth.middleware({ loginUrl: '/auth/sign-in' });
    return mw(request as Parameters<typeof mw>[0]);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/app/:path*'],
};
