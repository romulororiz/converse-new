'use client';

import Link from 'next/link';
import Image from 'next/image';
import converseLogo from '@/lib/assets/converse-logo-nobg.png';

export function PublicShell({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen flex flex-col' style={{ backgroundColor: 'var(--bg)' }}>
			{/* Header */}
			<header
				className='sticky top-0 z-50 border-b'
				style={{ backgroundColor: 'var(--bg)/95', borderColor: 'var(--border)', backdropFilter: 'blur(12px)' }}
			>
				<div className='mx-auto max-w-[1200px] px-4 sm:px-6 h-16 flex items-center justify-between'>
					<Link href='/' className='inline-flex items-center gap-2.5'>
						<Image
							src={converseLogo}
							alt='Converse logo'
							width={44}
							height={26}
							className='shrink-0 opacity-90'
						/>
						<span className='font-serif italic font-semibold text-2xl tracking-tight text-(--neo-accent)'>
							Converse
						</span>
					</Link>

					<nav className='hidden md:flex items-center gap-7 text-sm'>
						{[
							{ label: 'Discover', href: '/discover' },
							{ label: 'Library', href: '/books' },
							{ label: 'Pricing', href: '/pricing' },
						].map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className='text-(--text-muted) hover:text-(--text-primary) transition-colors font-medium relative group'
							>
								{item.label}
								<span className='absolute -bottom-0.5 left-0 w-0 h-px bg-(--neo-accent) group-hover:w-full transition-all duration-200' />
							</Link>
						))}
					</nav>

					<div className='flex items-center gap-3'>
						<Link
							href='/auth/sign-in'
							className='ghost-button h-9 px-4 inline-flex items-center text-sm font-medium text-(--text-muted) hover:text-(--text-primary)'
						>
							Sign in
						</Link>
						<Link
							href='/auth/sign-up'
							className='gold-button h-9 px-4 inline-flex items-center text-sm font-semibold'
						>
							Get started
						</Link>
					</div>
				</div>
			</header>

			<main className='flex-1'>{children}</main>

			{/* Footer */}
			<footer className='border-t mt-0 py-14' style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
				<div className='mx-auto max-w-[1200px] px-4 sm:px-6'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-10'>
						<div>
							<div className='flex items-center gap-2 mb-4'>
								<Image
									src={converseLogo}
									alt='Converse logo'
									width={22}
									height={22}
									className='shrink-0 opacity-80'
								/>
								<span className='font-serif italic font-semibold text-lg text-(--neo-accent)'>
									Converse
								</span>
							</div>
							<p className='text-sm text-(--text-muted) leading-relaxed'>
								Chat with your favorite books and discover new ways to read.
							</p>
						</div>
						<div>
							<h4 className='mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.15em] mb-4'>Product</h4>
							<div className='flex flex-col gap-2.5 text-sm text-(--text-muted)'>
								<Link href='/discover' className='hover:text-(--text-primary) transition-colors'>Discover</Link>
								<Link href='/books' className='hover:text-(--text-primary) transition-colors'>Library</Link>
								<Link href='/pricing' className='hover:text-(--text-primary) transition-colors'>Pricing</Link>
							</div>
						</div>
						<div>
							<h4 className='mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.15em] mb-4'>Company</h4>
							<div className='flex flex-col gap-2.5 text-sm text-(--text-muted)'>
								<span>About</span>
								<span>Blog</span>
								<span>Careers</span>
							</div>
						</div>
						<div>
							<h4 className='mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.15em] mb-4'>Legal</h4>
							<div className='flex flex-col gap-2.5 text-sm text-(--text-muted)'>
								<span>Privacy Policy</span>
								<span>Terms of Service</span>
							</div>
						</div>
					</div>
					<div className='pt-6 border-t text-center' style={{ borderColor: 'var(--border)' }}>
						<span className='mono text-[11px] text-(--text-muted)'>
							&copy; {new Date().getFullYear()} Converse. All rights reserved.
						</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
