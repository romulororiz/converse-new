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
  ChevronDown,
} from 'lucide-react';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fetchCurrentProfile } from '@/lib/services/profile';
import type { UserProfile } from '@/lib/core';
import type { Book } from '@/lib/core';
import { BookCoverImage } from '@/components/BookCoverImage';

const navItems = [
  { name: 'Home', href: '/d', icon: Home },
  { name: 'Discover', href: '/d/discover', icon: Compass },
  { name: 'Library', href: '/d/books', icon: BookOpen },
  { name: 'Chats', href: '/d/chats', icon: MessageSquare },
  { name: 'Highlights', href: '/d/highlights', icon: BookMarked },
  { name: 'Goals', href: '/d/goals', icon: Target },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (href: string) =>
    pathname === href || (href !== '/app' && pathname.startsWith(href));
  const isChatRoute = pathname.startsWith('/app/chat/');

  useEffect(() => {
    fetchCurrentProfile().then(setProfile).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!value.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/books?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data: Book[] = await res.json();
          setSearchResults(data.slice(0, 8));
        }
      } catch { /* ignore */ }
      setSearchLoading(false);
    }, 200);
  }, []);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar — 220px wide with labels */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-40 w-56 bg-white border-r border-border">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border shrink-0">
          <Link href="/d" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <BookOpen size={15} className="text-white" />
            </span>
            <span className="font-bold text-[17px] tracking-tight text-foreground">ConversAI</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${item.name.toLowerCase()}`}
                className={cn(
                  'flex items-center gap-3 px-3 h-10 rounded-[10px] transition-all duration-150 text-sm font-medium',
                  active
                    ? 'bg-[#F0F4F8] text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
                )}
              >
                <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {item.name}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom — settings + profile */}
        <div className="p-3 border-t border-border space-y-0.5">
          <Link
            href="/d/settings"
            className={cn(
              'flex items-center gap-3 px-3 h-10 rounded-[10px] transition-all duration-150 text-sm font-medium',
              isActive('/app/settings') ? 'bg-[#F0F4F8] text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
            )}
          >
            <Settings size={18} strokeWidth={1.8} />
            Settings
          </Link>

          {/* Profile */}
          <div ref={avatarRef} className="relative">
            <button
              onClick={() => setAvatarOpen((v) => !v)}
              className="w-full flex items-center gap-3 px-3 h-11 rounded-[10px] hover:bg-surface-2 transition-colors cursor-pointer"
            >
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" width={28} height={28} className="rounded-full object-cover shrink-0" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                  {initials}
                </span>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate text-foreground leading-tight">
                  {profile?.full_name?.split(' ')[0] || 'Account'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight">{profile?.email?.split('@')[0]}</p>
              </div>
              <ChevronDown size={13} className="text-muted-foreground shrink-0" />
            </button>

            <AnimatePresence>
              {avatarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 right-0 mb-1 surface-card py-1.5 shadow-lg z-50"
                >
                  {[
                    { label: 'Profile', icon: User, href: '/app/profile' },
                    { label: 'Billing', icon: CreditCard, href: '/app/billing' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
                    >
                      <item.icon size={14} /> {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-border mt-1 pt-1">
                    <Link
                      href="/auth/sign-in"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-surface-2 transition-colors"
                    >
                      <LogOut size={14} /> Sign out
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Main content — offset by sidebar width */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-white/90 backdrop-blur-sm flex items-center px-4 gap-3">
          {/* Mobile logo */}
          <Link href="/d" className="md:hidden flex items-center gap-2 shrink-0">
            <span className="w-7 h-7 rounded-[8px] bg-primary flex items-center justify-center">
              <BookOpen size={13} className="text-white" />
            </span>
            <span className="font-bold text-base text-foreground">ConversAI</span>
          </Link>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            data-testid="search-trigger"
            className="flex-1 max-w-lg mx-auto h-9 pl-3 pr-3 rounded-[10px] bg-surface-2 border border-border text-sm text-muted-foreground flex items-center gap-2 hover:border-border/80 transition-colors cursor-text"
          >
            <Search size={14} className="text-muted-foreground/70" />
            <span className="flex-1 text-left">Search books, topics...</span>
            <kbd className="hidden sm:inline text-[10px] font-mono bg-white border border-border px-1.5 py-0.5 rounded text-muted-foreground">
              Ctrl K
            </kbd>
          </button>

          {/* Mobile avatar */}
          <div ref={avatarRef} className="relative shrink-0 md:hidden">
            <button
              onClick={() => setAvatarOpen((v) => !v)}
              className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
            >
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" width={28} height={28} className="rounded-full object-cover" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">
                  {initials}
                </span>
              )}
            </button>
            <AnimatePresence>
              {avatarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-52 surface-card py-1.5 shadow-lg z-50"
                >
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                  </div>
                  {[
                    { label: 'Profile', icon: User, href: '/app/profile' },
                    { label: 'Settings', icon: Settings, href: '/app/settings' },
                    { label: 'Billing', icon: CreditCard, href: '/app/billing' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors">
                      <item.icon size={14} /> {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-border mt-1 pt-1">
                    <Link href="/auth/sign-in" onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-surface-2 transition-colors">
                      <LogOut size={14} /> Sign out
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <main className={cn(
          'flex-1',
          isChatRoute ? 'pb-0 md:pb-0' : 'p-4 sm:p-6 pb-24 md:pb-6'
        )}>
          {isChatRoute ? children : (
            <div className="mx-auto max-w-[1100px]">{children}</div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border px-1 py-1.5 safe-bottom">
        <div className="flex items-center justify-around">
          {[...navItems.slice(0, 4), { name: 'Profile', href: '/app/profile', icon: User }].map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-1 px-3 rounded-[10px] transition-colors min-w-0',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* cmdk search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm"
              onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[81] top-[8%] left-1/2 -translate-x-1/2 w-full max-w-xl px-4"
            >
              <Command className="surface-card overflow-hidden shadow-xl" shouldFilter={false}>
                <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
                  <Search size={16} className="text-muted-foreground shrink-0" />
                  <Command.Input
                    value={searchQuery}
                    onValueChange={handleSearch}
                    placeholder="Search books, topics, authors..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    autoFocus
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <Command.List className="max-h-[360px] overflow-y-auto p-2">
                  {searchQuery.trim() === '' ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">Start typing to search books...</div>
                  ) : searchLoading ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No books found for &ldquo;{searchQuery}&rdquo;
                    </Command.Empty>
                  ) : (
                    searchResults.map((book) => (
                      <Command.Item
                        key={book.id}
                        value={book.id}
                        onSelect={() => {
                          router.push(`/app/book/${book.id}`);
                          setSearchOpen(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer text-sm hover:bg-surface-2 transition-colors data-[selected=true]:bg-surface-2"
                      >
                        <div className="w-8 h-12 rounded-[6px] overflow-hidden shrink-0 bg-surface-2">
                          <BookCoverImage src={book.cover_url} alt={book.title} variant="card" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{book.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{book.author ?? 'Unknown author'}</p>
                        </div>
                        <span className="text-xs text-primary font-medium shrink-0">Open</span>
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
