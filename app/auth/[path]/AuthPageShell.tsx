'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { BookOpen, MessageCircle, Bookmark, Star } from 'lucide-react';
import { authClient } from '@/lib/auth/client';
import { LampGlow } from '@/components/LampGlow';
import converseLogo from '@/lib/assets/converse-logo-nobg.png';

const testimonials = [
	{
		quote: 'This changed how I absorb ideas from books. It feels like a real conversation.',
		name: 'Sarah K.',
		role: 'Product Designer',
	},
	{
		quote: "I've read more books this month than the entire last year.",
		name: 'Michael R.',
		role: 'Software Engineer',
	},
];

const highlights = [
	{ icon: <BookOpen size={12} />, text: '500+ curated books' },
	{ icon: <MessageCircle size={12} />, text: 'AI-powered conversations' },
	{ icon: <Bookmark size={12} />, text: 'Save & share insights' },
];

export function AuthPageShell({
	isSignUp,
	children,
}: {
	isSignUp: boolean;
	children: React.ReactNode;
}) {
	const t = testimonials[isSignUp ? 1 : 0];
	const router = useRouter();
	const redirected = useRef(false);
	const hasResolved = useRef(false);
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending) hasResolved.current = true;
	}, [isPending]);

	useEffect(() => {
		if (isPending || redirected.current) return;
		if (session?.user?.id) {
			redirected.current = true;
			router.replace('/home');
		}
	}, [session?.user?.id, isPending, router]);

	const showLoader = (!hasResolved.current && isPending) || !!session?.user?.id;

	if (showLoader) {
		return (
			<div className='h-screen flex flex-col items-center justify-center gap-4' style={{ backgroundColor: 'var(--bg)' }}>
				<Image
					src={converseLogo}
					alt='Converse logo'
					width={48}
					height={48}
					className='animate-pulse opacity-80'
				/>
				<p className='mono text-[11px] text-(--text-muted) uppercase tracking-widest'>Signing you in...</p>
			</div>
		);
	}

	return (
		<div className='h-screen overflow-hidden relative' style={{ backgroundColor: 'var(--bg)' }}>
			{/* Ambient glow */}
			<LampGlow className='top-0 left-[25%]' size={600} opacity={0.2} />
			<LampGlow className='bottom-0 right-0' size={350} opacity={0.12} />

			{/* Logo */}
			<div className='absolute top-6 left-8 z-20'>
				<Link href='/' className='inline-flex items-center gap-2'>
					<Image src={converseLogo} alt='Converse logo' width={28} height={28} className='shrink-0 opacity-85' />
					<span className='font-serif italic font-semibold text-base text-(--neo-accent)'>Converse</span>
				</Link>
			</div>

			<div className='relative z-10 h-full flex items-center'>
				{/* Left panel */}
				<div className='hidden lg:flex lg:w-[45%] xl:w-[48%] justify-end pr-10 xl:pr-16'>
					<div className='max-w-[340px] space-y-8'>
						{/* Tagline */}
						<div className='auth-appear auth-appear-d1'>
							<h1 className='font-serif leading-[1.1] tracking-tight mb-3 text-(--text-primary)'
								style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)' }}>
								<em className='text-(--neo-accent) not-italic'>Talk</em> to any book.
								<br />Learn faster.
							</h1>
							<p className='text-sm text-(--text-muted) leading-relaxed'>
								Every book has a voice. Ask questions, get insights, and build
								your knowledge — one conversation at a time.
							</p>
						</div>

						{/* Feature chips */}
						<div className='auth-appear auth-appear-d2 flex flex-wrap gap-2'>
							{highlights.map((h) => (
								<span
									key={h.text}
									className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border mono text-[10px] font-medium text-(--text-muted)'
									style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
								>
									<span className='text-(--neo-accent)'>{h.icon}</span> {h.text}
								</span>
							))}
						</div>

						{/* Testimonial */}
						<div className='auth-appear auth-appear-d3 flex items-start gap-3 ink-panel p-4 rounded-lg'>
							<div
								className='w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-serif font-bold text-sm text-(--neo-accent)'
								style={{ backgroundColor: 'var(--neo-accent-light)' }}
							>
								{t.name[0]}
							</div>
							<div>
								<div className='flex gap-0.5 mb-1.5'>
									{Array.from({ length: 5 }).map((_, i) => (
										<Star key={i} size={10} className='fill-(--neo-accent) text-(--neo-accent)' />
									))}
								</div>
								<p className='font-serif text-xs leading-relaxed text-(--text-secondary) italic mb-1.5'>
									&ldquo;{t.quote}&rdquo;
								</p>
								<p className='mono text-[10px] text-(--text-muted) uppercase tracking-wide'>
									{t.name} · {t.role}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Right panel — auth form */}
				<div className='flex-1 flex flex-col items-center lg:items-start lg:pl-10 xl:pl-16 px-6'>
					{/* Mobile header */}
					<div className='lg:hidden flex items-center justify-between w-full max-w-[400px] mb-7'>
						<Link href='/' className='inline-flex items-center gap-2'>
							<Image src={converseLogo} alt='Converse logo' width={24} height={24} className='shrink-0 opacity-85' />
							<span className='font-serif italic font-semibold text-sm text-(--neo-accent)'>Converse</span>
						</Link>
						<Link
							href={isSignUp ? '/auth/sign-in' : '/auth/sign-up'}
							className='mono text-[11px] font-medium text-(--neo-accent) hover:underline uppercase tracking-wide'
						>
							{isSignUp ? 'Sign in' : 'Create account'}
						</Link>
					</div>

					<div className='auth-appear w-full max-w-[400px]'>
						{/* Form heading */}
						<div className='mb-6'>
							<h2 className='font-serif text-xl font-bold tracking-tight mb-1 text-(--text-primary)'>
								{isSignUp ? 'Create your account' : 'Welcome back'}
							</h2>
							<p className='text-xs text-(--text-muted)'>
								{isSignUp
									? 'Start chatting with books for free — no credit card needed.'
									: 'Sign in to continue your conversations.'}
							</p>
						</div>

						{/* Auth form */}
						<div className='neon-auth-form'>{children}</div>

						<p className='mono text-[10px] text-(--text-muted) mt-5'>
							By continuing, you agree to our Terms of Service and Privacy Policy.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
