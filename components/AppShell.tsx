'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
	Home,
	Compass,
	BookOpen,
	MessageSquare,
	User,
	Search,
	Settings,
	CreditCard,
	LogOut,
	BookMarked,
	Target,
	X,
	Menu,
	ChevronRight,
	MoreHorizontal,
} from 'lucide-react';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import { Drawer as VaulDrawer } from 'vaul';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth/client';
import { fetchCurrentProfile } from '@/lib/services/profile';
import type { UserProfile } from '@/lib/core';
import type { Book } from '@/lib/core';
import { BookCoverImage } from '@/components/BookCoverImage';
import converseLogo from '@/lib/assets/converse-logo-nobg.png';

const navItems = [
	{ name: 'Home', href: '/home', icon: Home },
	{ name: 'Discover', href: '/discover', icon: Compass },
	{ name: 'Library', href: '/books', icon: BookOpen },
	{ name: 'Chats', href: '/chats', icon: MessageSquare },
	{ name: 'Highlights', href: '/highlights', icon: BookMarked },
	{ name: 'Goals', href: '/goals', icon: Target },
];

const mobileBottomTabs = navItems.slice(0, 4);

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [railOpen, setRailOpen] = useState(false);
	const [avatarOpen, setAvatarOpen] = useState(false);
	const [moreOpen, setMoreOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<Book[]>([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const avatarRef = useRef<HTMLDivElement>(null);
	const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const isActive = (href: string) =>
		pathname === href || (href !== '/home' && pathname.startsWith(href));
	const isChatRoute = pathname.startsWith('/chat/');

	useEffect(() => {
		fetchCurrentProfile()
			.then(setProfile)
			.catch(() => {});
	}, []);

	// Keyboard shortcut: Ctrl+K → search
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				setSearchOpen(v => !v);
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, []);

	// Close avatar dropdown on outside click
	useEffect(() => {
		if (!avatarOpen) return;
		const handler = (e: MouseEvent) => {
			if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
				setAvatarOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [avatarOpen]);

	// Close rail panel on Escape
	useEffect(() => {
		if (!railOpen) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setRailOpen(false);
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [railOpen]);

	const handleSearch = useCallback((value: string) => {
		setSearchQuery(value);
		if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
		if (!value.trim()) {
			setSearchResults([]);
			return;
		}
		setSearchLoading(true);
		searchTimerRef.current = setTimeout(async () => {
			try {
				const res = await fetch(
					`/api/books?q=${encodeURIComponent(value.trim())}`,
				);
				if (res.ok) {
					const data: Book[] = await res.json();
					setSearchResults(data.slice(0, 8));
				}
			} catch {
				/* ignore */
			}
			setSearchLoading(false);
		}, 200);
	}, []);

	const handleSignOut = async () => {
		setAvatarOpen(false);
		setMoreOpen(false);
		setRailOpen(false);
		await authClient.signOut();
		router.replace('/auth/sign-in');
	};

	const initials = profile?.full_name
		? profile.full_name
				.split(' ')
				.map(w => w[0])
				.join('')
				.toUpperCase()
				.slice(0, 2)
		: (profile?.email?.[0]?.toUpperCase() ?? 'U');

	const avatarImg = profile?.avatar_url ? (
		<Image
			src={profile.avatar_url}
			alt=''
			width={28}
			height={28}
			className='rounded-full object-cover'
		/>
	) : (
		<span className='w-7 h-7 rounded-full bg-(--neo-accent-light) text-(--neo-accent) text-[11px] font-bold flex items-center justify-center ring-1 ring-(--neo-accent)/40'>
			{initials}
		</span>
	);

	return (
		<div className='min-h-screen bg-background flex'>
			<a href='#main-content' className='skip-link'>
				Skip to content
			</a>

			{/* ── DESKTOP ICON RAIL (64px, always visible) ── */}
			<aside className='hidden md:flex flex-col fixed top-0 left-0 h-screen z-40 w-16 bg-(--bg-surface) border-r border-(--border)'>
				{/* Hamburger — opens overlay panel */}
				<button
					onClick={() => setRailOpen(v => !v)}
					title='Navigation'
					aria-label='Open navigation'
					className='h-16 flex items-center justify-center shrink-0 text-(--text-muted) hover:text-(--neo-accent) transition-colors cursor-pointer border-b border-(--border)'
				>
					<Menu size={20} />
				</button>

				{/* Nav icons */}
				<nav className='flex-1 flex flex-col items-center py-3 gap-1 overflow-y-auto'>
					{navItems.map(item => {
						const active = isActive(item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								title={item.name}
								aria-label={item.name}
								data-testid={`nav-${item.name.toLowerCase()}`}
								className={cn(
									'relative w-11 h-11 flex items-center justify-center rounded-md transition-all duration-150',
									active
										? 'bg-(--neo-accent-light) text-(--neo-accent)'
										: 'text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-overlay)',
								)}
							>
								{active && (
									<span className='absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-(--neo-accent) rounded-r-full' />
								)}
								<item.icon size={19} strokeWidth={active ? 2.2 : 1.8} />
							</Link>
						);
					})}

					{/* Search icon */}
					<button
						onClick={() => setSearchOpen(true)}
						title='Search (Ctrl+K)'
						aria-label='Search books'
						className='mt-2 w-11 h-11 flex items-center justify-center rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-overlay) transition-all cursor-pointer'
					>
						<Search size={19} strokeWidth={1.8} />
					</button>
				</nav>

				{/* Bottom — settings + avatar */}
				<div className='flex flex-col items-center py-3 gap-2 border-t border-(--border) shrink-0'>
					<Link
						href='/settings'
						title='Settings'
						aria-label='Settings'
						className={cn(
							'w-11 h-11 flex items-center justify-center rounded-md transition-all duration-150',
							isActive('/settings')
								? 'bg-(--neo-accent-light) text-(--neo-accent)'
								: 'text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-overlay)',
						)}
					>
						<Settings size={19} strokeWidth={1.8} />
					</Link>

					{/* Desktop avatar + dropdown */}
					<div ref={avatarRef} className='relative'>
						<button
							onClick={() => setAvatarOpen(v => !v)}
							aria-label='Open profile menu'
							aria-expanded={avatarOpen}
							title={profile?.full_name ?? 'Profile'}
							className='w-11 h-11 flex items-center justify-center rounded-md hover:bg-(--bg-overlay) transition-colors cursor-pointer'
						>
							{avatarImg}
						</button>

						<AnimatePresence>
							{avatarOpen && (
								<motion.div
									initial={{ opacity: 0, x: 4, scale: 0.96 }}
									animate={{ opacity: 1, x: 0, scale: 1 }}
									exit={{ opacity: 0, x: 4, scale: 0.96 }}
									transition={{ duration: 0.15 }}
									className='absolute bottom-0 left-full ml-2 w-52 ink-card py-1.5 shadow-xl z-50'
								>
									<div className='px-3 py-2.5 border-b border-(--border) mb-1'>
										<p className='text-sm font-medium truncate text-foreground'>
											{profile?.full_name || 'Account'}
										</p>
										<p className='text-[11px] text-muted-foreground truncate mono'>
											{profile?.email}
										</p>
									</div>
									{[
										{ label: 'Profile', icon: User, href: '/profile' },
										{ label: 'Billing', icon: CreditCard, href: '/billing' },
									].map(item => (
										<Link
											key={item.href}
											href={item.href}
											onClick={() => setAvatarOpen(false)}
											className='flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-(--bg-overlay) transition-colors'
										>
											<item.icon size={14} /> {item.label}
										</Link>
									))}
									<div className='border-t border-(--border) mt-1 pt-1'>
										<button
											onClick={handleSignOut}
											className='flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-(--bg-overlay) transition-colors w-full text-left cursor-pointer'
										>
											<LogOut size={14} /> Sign out
										</button>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</aside>

			{/* ── DESKTOP OVERLAY PANEL (240px, slides from rail) ── */}
			<AnimatePresence>
				{railOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className='hidden md:block fixed inset-0 z-45 bg-black/60'
							onClick={() => setRailOpen(false)}
						/>
						<motion.aside
							initial={{ x: -240 }}
							animate={{ x: 0 }}
							exit={{ x: -240 }}
							transition={{ type: 'spring', damping: 28, stiffness: 280 }}
							className='hidden md:flex flex-col fixed top-0 left-16 h-screen w-60 z-46 bg-(--bg-surface) border-r border-(--border) shadow-2xl'
						>
							{/* Logo */}
							<div className='h-16 flex items-center gap-2.5 px-5 border-b border-(--border) shrink-0'>
								<Image
									src={converseLogo}
									alt='Converse'
									width={30}
									height={18}
									className='shrink-0'
								/>
								<span className='font-serif italic font-semibold text-2xl text-(--neo-accent) tracking-tight'>
									Converse
								</span>
								<button
									onClick={() => setRailOpen(false)}
									className='ml-auto text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer'
									aria-label='Close navigation'
								>
									<X size={16} />
								</button>
							</div>

							{/* Nav with labels */}
							<nav className='flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto'>
								{navItems.map(item => {
									const active = isActive(item.href);
									return (
										<Link
											key={item.href}
											href={item.href}
											onClick={() => setRailOpen(false)}
											className={cn(
												'flex items-center gap-3 px-3 h-10 rounded-md transition-all duration-150 text-sm font-medium',
												active
													? 'bg-(--neo-accent-light) text-(--neo-accent) border-l-2 border-(--neo-accent) pl-2.5'
													: 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-overlay)',
											)}
										>
											<item.icon size={17} strokeWidth={active ? 2.2 : 1.8} />
											{item.name}
											{active && (
												<ChevronRight
													size={13}
													className='ml-auto opacity-50'
												/>
											)}
										</Link>
									);
								})}
							</nav>

							{/* User section */}
							<div className='p-3 border-t border-(--border) shrink-0'>
								<Link
									href='/settings'
									onClick={() => setRailOpen(false)}
									className={cn(
										'flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium mb-1 transition-all',
										isActive('/settings')
											? 'bg-(--neo-accent-light) text-(--neo-accent)'
											: 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-overlay)',
									)}
								>
									<Settings size={17} strokeWidth={1.8} /> Settings
								</Link>
								<div className='flex items-center gap-3 px-3 py-2 rounded-md'>
									{avatarImg}
									<div className='flex-1 min-w-0'>
										<p className='text-sm font-medium truncate text-foreground leading-tight'>
											{profile?.full_name?.split(' ')[0] || 'Account'}
										</p>
										<p className='text-[11px] text-muted-foreground truncate mono'>
											{profile?.email?.split('@')[0]}
										</p>
									</div>
								</div>
							</div>
						</motion.aside>
					</>
				)}
			</AnimatePresence>

			{/* ── MAIN CONTENT ── */}
			<div className='flex-1 md:ml-16 flex flex-col min-h-screen'>
				{/* Mobile top bar */}
				<header className='md:hidden sticky top-0 z-30 h-12 bg-(--bg)/90 backdrop-blur-sm border-b border-(--border) flex items-center px-4 gap-3 shrink-0'>
					<Link href='/home' className='flex items-center gap-2 flex-1'>
						<Image
							src={converseLogo}
							alt='Converse'
							width={22}
							height={14}
							className='shrink-0'
						/>
						<span className='font-serif italic font-semibold text-lg text-(--neo-accent)'>
							Converse
						</span>
					</Link>

					<button
						onClick={() => setSearchOpen(true)}
						aria-label='Search'
						className='text-(--text-muted) hover:text-(--text-primary) transition-colors'
					>
						<Search size={18} />
					</button>

					{/* Mobile avatar */}
					<div ref={avatarRef} className='relative'>
						<button
							onClick={() => setAvatarOpen(v => !v)}
							aria-label='Open account menu'
							aria-expanded={avatarOpen}
							className='flex items-center justify-center cursor-pointer'
						>
							{avatarImg}
						</button>

						<AnimatePresence>
							{avatarOpen && (
								<>
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className='fixed inset-0 z-40'
										onClick={() => setAvatarOpen(false)}
									/>
									<motion.div
										initial={{ opacity: 0, y: -4, scale: 0.97 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: -4, scale: 0.97 }}
										transition={{ duration: 0.15 }}
										className='absolute right-0 top-10 w-56 ink-card py-1.5 shadow-xl z-50'
									>
										<div className='px-3 py-2.5 border-b border-(--border) mb-1'>
											<p className='text-sm font-medium truncate'>
												{profile?.full_name || 'Account'}
											</p>
											<p className='text-[11px] text-muted-foreground truncate mono'>
												{profile?.email}
											</p>
										</div>
										{[
											{ label: 'Profile', icon: User, href: '/profile' },
											{ label: 'Settings', icon: Settings, href: '/settings' },
											{ label: 'Billing', icon: CreditCard, href: '/billing' },
										].map(item => (
											<Link
												key={item.href}
												href={item.href}
												onClick={() => setAvatarOpen(false)}
												className='flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-(--bg-overlay) transition-colors'
											>
												<item.icon size={14} /> {item.label}
											</Link>
										))}
										<div className='border-t border-(--border) mt-1 pt-1'>
											<button
												onClick={handleSignOut}
												className='flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-(--bg-overlay) transition-colors w-full text-left cursor-pointer'
											>
												<LogOut size={14} /> Sign out
											</button>
										</div>
									</motion.div>
								</>
							)}
						</AnimatePresence>
					</div>
				</header>

				{/* Page content */}
				<main
					id='main-content'
					className={cn(
						'flex-1 bg-background',
						isChatRoute ? 'pb-0 md:pb-0' : 'p-4 sm:p-6 pb-24 md:pb-6',
					)}
				>
					{isChatRoute ? (
						children
					) : (
						<div className='mx-auto max-w-[1100px]'>{children}</div>
					)}
				</main>
			</div>

			{/* ── MOBILE BOTTOM NAV ── */}
			{!isChatRoute && (
				<nav
					className='md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-(--bg-surface)/95 backdrop-blur-md border-t border-(--border)'
					style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
				>
					<div className='flex items-center justify-around h-full px-1'>
						{mobileBottomTabs.map(item => {
							const active = isActive(item.href);
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										'relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-md transition-all min-h-11 justify-center min-w-[52px]',
										active ? 'text-(--neo-accent)' : 'text-(--text-muted)',
									)}
								>
									{active && (
										<motion.div
											layoutId='mobile-tab-bg'
											className='absolute inset-0 bg-(--neo-accent-light) rounded-md'
											transition={{ type: 'spring', damping: 25, stiffness: 300 }}
										/>
									)}
									<item.icon
										size={20}
										strokeWidth={active ? 2.2 : 1.8}
										className='relative z-10'
									/>
									<span className='text-[10px] font-medium relative z-10'>
										{item.name}
									</span>
								</Link>
							);
						})}

						{/* More tab */}
						<button
							onClick={() => setMoreOpen(true)}
							className='flex flex-col items-center gap-0.5 px-3 py-2 rounded-md transition-all min-h-11 justify-center min-w-[52px] text-(--text-muted) cursor-pointer'
						>
							<MoreHorizontal size={20} strokeWidth={1.8} />
							<span className='text-[10px] font-medium'>More</span>
						</button>
					</div>
				</nav>
			)}

			{/* ── MOBILE "MORE" BOTTOM SHEET (vaul) ── */}
			<VaulDrawer.Root open={moreOpen} onOpenChange={setMoreOpen}>
				<VaulDrawer.Portal>
					<VaulDrawer.Overlay className='fixed inset-0 bg-black/60 z-50' />
					<VaulDrawer.Content
						className='fixed bottom-0 left-0 right-0 z-50 bg-(--bg-surface) border-t border-(--border) rounded-t-xl outline-none'
						style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
					>
						<div className='flex justify-center pt-3 pb-1'>
							<div className='w-10 h-1 rounded-full bg-(--border-strong)' />
						</div>
						<div className='px-4 pt-2 pb-6'>
							<p className='mono text-[10px] uppercase tracking-widest text-(--text-muted) mb-3'>
								More
							</p>
							<div className='space-y-0.5'>
								{[
									{
										label: 'Highlights',
										icon: BookMarked,
										href: '/highlights',
									},
									{ label: 'Goals', icon: Target, href: '/goals' },
									{ label: 'Profile', icon: User, href: '/profile' },
									{ label: 'Settings', icon: Settings, href: '/settings' },
									{ label: 'Billing', icon: CreditCard, href: '/billing' },
								].map(item => {
									const active = isActive(item.href);
									return (
										<Link
											key={item.href}
											href={item.href}
											onClick={() => setMoreOpen(false)}
											className={cn(
												'flex items-center gap-3 px-4 h-12 rounded-md text-sm font-medium transition-colors',
												active
													? 'bg-(--neo-accent-light) text-(--neo-accent)'
													: 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-overlay)',
											)}
										>
											<item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
											{item.label}
										</Link>
									);
								})}
								<button
									onClick={handleSignOut}
									className='flex items-center gap-3 px-4 h-12 rounded-md text-sm font-medium text-danger hover:bg-(--bg-overlay) transition-colors w-full text-left cursor-pointer'
								>
									<LogOut size={18} /> Sign out
								</button>
							</div>
						</div>
					</VaulDrawer.Content>
				</VaulDrawer.Portal>
			</VaulDrawer.Root>

			{/* ── SEARCH OVERLAY (cmdk) ── */}
			<AnimatePresence>
				{searchOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className='fixed inset-0 z-80 bg-black/60 backdrop-blur-sm'
							onClick={() => {
								setSearchOpen(false);
								setSearchQuery('');
								setSearchResults([]);
							}}
						/>
						<motion.div
							initial={{ opacity: 0, y: -8, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -8, scale: 0.98 }}
							transition={{ duration: 0.15 }}
							className='fixed z-81 top-[8%] left-1/2 -translate-x-1/2 w-full max-w-xl px-4'
						>
							<Command
								className='ink-card overflow-hidden shadow-2xl'
								shouldFilter={false}
							>
								<div className='flex items-center gap-2 px-4 h-12 border-b border-(--border)'>
									<Search size={16} className='text-muted-foreground shrink-0' />
									<Command.Input
										value={searchQuery}
										onValueChange={handleSearch}
										placeholder='Search books, topics, authors...'
										className='flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none'
										autoFocus
									/>
									{searchQuery && (
										<button
											onClick={() => {
												setSearchQuery('');
												setSearchResults([]);
											}}
											aria-label='Clear search'
											className='text-muted-foreground hover:text-foreground transition-colors'
										>
											<X size={14} />
										</button>
									)}
									<kbd className='hidden sm:inline text-[10px] mono bg-(--bg-elevated) border border-(--border) px-1.5 py-0.5 rounded text-muted-foreground'>
										Esc
									</kbd>
								</div>
								<Command.List className='max-h-[360px] overflow-y-auto p-2'>
									{searchQuery.trim() === '' ? (
										<div className='px-3 py-6 text-center text-sm text-muted-foreground'>
											Start typing to search books...
										</div>
									) : searchLoading ? (
										<div className='px-3 py-6 text-center text-sm text-muted-foreground'>
											Searching...
										</div>
									) : searchResults.length === 0 ? (
										<Command.Empty className='px-3 py-6 text-center text-sm text-muted-foreground'>
											No books found for &ldquo;{searchQuery}&rdquo;
										</Command.Empty>
									) : (
										searchResults.map(book => (
											<Command.Item
												key={book.id}
												value={book.id}
												onSelect={() => {
													router.push(`/book/${book.id}`);
													setSearchOpen(false);
													setSearchQuery('');
													setSearchResults([]);
												}}
												className='flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-sm hover:bg-(--bg-overlay) transition-colors data-[selected=true]:bg-(--bg-overlay)'
											>
												<div className='w-8 h-12 rounded-sm overflow-hidden shrink-0 bg-(--bg-elevated)'>
													<BookCoverImage
														src={book.cover_url}
														alt={book.title}
														variant='card'
													/>
												</div>
												<div className='flex-1 min-w-0'>
													<p className='font-medium truncate'>{book.title}</p>
													<p className='text-xs text-muted-foreground truncate'>
														{book.author ?? 'Unknown author'}
													</p>
												</div>
												<span className='text-xs text-(--neo-accent) font-medium shrink-0 mono'>
													Open →
												</span>
											</Command.Item>
										))
									)}
								</Command.List>
							</Command>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
