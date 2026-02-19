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
  Sparkles,
  X,
} from 'lucide-react';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fetchCurrentProfile } from '@/lib/services/profile';
import type { UserProfile } from '@/lib/core';
import type { Book } from '@/lib/core';
import { BookCoverImage } from '@/components/BookCoverImage';

const navItems = [
  { name: 'Home', href: '/app', icon: Home },
  { name: 'Discover', href: '/app/discover', icon: Compass },
  { name: 'Library', href: '/app/books', icon: BookOpen },
  { name: 'Chats', href: '/app/chats', icon: MessageSquare },
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
      {/* Desktop sidebar -- Spotify style: fixed, icon-only, 56px */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-40 w-14 bg-surface-1 border-r border-border">
        <div className="h-14 flex items-center justify-center border-b border-border shrink-0">
          <Link href="/app">
            <span className="w-8 h-8 rounded-[10px] accent-button inline-flex items-center justify-center">
              <Sparkles size={14} />
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-3 px-1.5 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.name}
                className={cn(
                  'group relative flex items-center justify-center w-11 h-11 rounded-[12px] transition-colors duration-150 mx-auto',
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
                )}
              >
                <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />}
                <span className="absolute left-14 px-2.5 py-1 rounded-[8px] bg-surface-2 border border-border text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-1.5 border-t border-border space-y-1">
          <Link
            href="/app/settings"
            title="Settings"
            className={cn(
              'flex items-center justify-center w-11 h-11 rounded-[12px] transition-colors duration-150 mx-auto',
              isActive('/app/settings') ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
            )}
          >
            <Settings size={18} />
          </Link>
          <Link
            href="/app/profile"
            title="Profile"
            className="flex items-center justify-center w-11 h-11 mx-auto"
          >
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="" width={28} height={28} className="rounded-full object-cover" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center">
                {initials}
              </span>
            )}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-14 flex flex-col min-h-screen">
        {/* Top bar -- ChatGPT style */}
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 gap-3">
          {/* Mobile logo */}
          <Link href="/app" className="md:hidden flex items-center gap-2 shrink-0">
            <span className="w-7 h-7 rounded-[8px] accent-button inline-flex items-center justify-center">
              <Sparkles size={12} />
            </span>
          </Link>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex-1 max-w-lg mx-auto h-9 pl-3 pr-3 rounded-[10px] bg-surface-2/60 border border-border text-sm text-muted-foreground flex items-center gap-2 hover:bg-surface-2 transition-colors cursor-text"
          >
            <Search size={14} />
            <span className="flex-1 text-left">Search books, topics...</span>
            <kbd className="hidden sm:inline text-[10px] font-mono bg-surface-1 border border-border px-1.5 py-0.5 rounded text-muted-foreground">
              Ctrl K
            </kbd>
          </button>

          {/* Avatar dropdown */}
          <div ref={avatarRef} className="relative shrink-0">
            <button
              onClick={() => setAvatarOpen((v) => !v)}
              className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
            >
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" width={28} height={28} className="rounded-full object-cover" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center">
                  {initials}
                </span>
              )}
              <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
                {profile?.full_name || profile?.email?.split('@')[0] || 'Account'}
              </span>
            </button>

            <AnimatePresence>
              {avatarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-56 surface-card py-1.5 shadow-lg z-50"
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
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
                    >
                      <item.icon size={15} /> {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-border mt-1 pt-1">
                    <Link
                      href="/auth/sign-in"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-surface-2 transition-colors"
                    >
                      <LogOut size={15} /> Sign out
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

      {/* Mobile bottom nav -- icons only, amber dot indicator */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-1 border-t border-border px-2 py-2 safe-bottom">
        <div className="flex items-center justify-around">
          {[...navItems, { name: 'Profile', href: '/app/profile', icon: User }].map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-1 px-4 rounded-[12px] transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                {active && <span className="w-1 h-1 rounded-full bg-primary" />}
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
              className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
              onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[81] top-[10%] left-1/2 -translate-x-1/2 w-full max-w-xl mx-4"
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
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      Start typing to search books...
                    </div>
                  ) : searchLoading ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
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
