import { createNeonAuth } from '@neondatabase/auth/next/server';

const baseUrl = process.env.NEON_AUTH_BASE_URL ?? '';
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET ?? '';

const noopHandler = () => {
  const handler = async () => new Response(JSON.stringify({ error: 'Auth not configured' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  return { GET: handler, POST: handler };
};

const noopMiddleware = () => () => {
  const { NextResponse } = require('next/server');
  return NextResponse.next();
};

export const auth = baseUrl && cookieSecret && cookieSecret.length >= 32
  ? createNeonAuth({ baseUrl, cookies: { secret: cookieSecret } })
  : { handler: noopHandler, middleware: noopMiddleware, getSession: async () => null } as unknown as ReturnType<typeof createNeonAuth>;
