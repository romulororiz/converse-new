import { auth } from '@/lib/auth/server';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  fullName: string | null;
}

export async function getAuthenticatedUserId() {
  const { data } = await auth.getSession();
  return data?.user?.id ?? null;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
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
