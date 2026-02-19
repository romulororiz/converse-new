import { AuthView } from '@neondatabase/auth/react';
import { AuthPageShell } from './AuthPageShell';

export const dynamicParams = true;

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const isSignUp = path === 'sign-up';

  return (
    <AuthPageShell isSignUp={isSignUp}>
      <AuthView path={path} />
    </AuthPageShell>
  );
}
