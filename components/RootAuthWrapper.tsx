'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { authClient } from '@/lib/auth/client';
import converseLogo from '@/lib/assets/converse-logo-nobg.png';

const NeonAuthProvider = dynamic(
	() => import('@/components/NeonAuthProvider'),
	{ ssr: false },
);

const AuthSync = dynamic(
	() => import('@/components/AuthSync').then(m => ({ default: m.AuthSync })),
	{ ssr: false },
);

/**
 * Wraps the app with NeonAuthProvider and AuthSync so session and profile
 * are available (and created) on every page, including after OAuth redirect to landing.
 * Redirects authenticated users from / to /home.
 */
export function RootAuthWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const redirectDone = useRef(false);
	const hasResolved = useRef(false);

	const { data: session, isPending } = authClient.useSession();

	const isAuthRoute = pathname.startsWith('/auth/');
	const isRedirectRoute = pathname === '/' || isAuthRoute;
	const isAuthenticated = !!session?.user?.id;

	// Track first resolution so refocus re-fetches don't flash the loader
	useEffect(() => {
		if (!isPending) hasResolved.current = true;
	}, [isPending]);

	useEffect(() => {
		if (isPending || redirectDone.current) return;
		// Redirect authenticated users away from / and /auth/* to /home
		if (isRedirectRoute && isAuthenticated) {
			redirectDone.current = true;
			router.replace('/home');
		}
	}, [pathname, isRedirectRoute, isAuthenticated, isPending, router]);

	// Show loader on first load (before session resolves) or whenever
	// user is authenticated on a redirect route. Never re-show on refocus.
	const showLoader =
		isRedirectRoute && ((!hasResolved.current && isPending) || isAuthenticated);

	if (showLoader) {
		return (
			<NeonAuthProvider>
				<AuthSync />
				<div className='h-screen flex flex-col items-center justify-center bg-background gap-4'>
					<Image
						src={converseLogo}
						alt='Converse'
						width={48}
						height={48}
						className='animate-pulse'
					/>
					<p className='text-sm text-muted-foreground'>
						{isAuthenticated ? 'Loading...' : 'Loading...'}
					</p>
				</div>
			</NeonAuthProvider>
		);
	}

	return (
		<NeonAuthProvider>
			<AuthSync />
			{children}
		</NeonAuthProvider>
	);
}
