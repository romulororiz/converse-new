'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import { BookCoverImage } from '@/components/BookCoverImage';
import { MessageCounterBadge } from '@/components/MessageCounterBadge';
import { PremiumPaywallDrawer } from '@/components/PremiumPaywallDrawer';
import { Input } from '@/components/ui/Input';
import { fetchChats, type ChatListItem } from '@/lib/services/chats';
import { fetchSubscriptionStatus, upgradeSubscription } from '@/lib/services/subscription';

export default function ChatsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [badgeRefreshKey, setBadgeRefreshKey] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    fetchChats()
      .then((data) => setChats(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = chats.filter((c) => {
    const title = c.title || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.last_message ?? '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleBadgePress = async () => {
    try {
      const sub = await fetchSubscriptionStatus();
      if (sub.messageInfo.plan === 'free') setShowPaywall(true);
    } catch { setShowPaywall(true); }
  };

  const handlePaywallPurchase = async (plan: 'weekly' | 'monthly' | 'yearly') => {
    await upgradeSubscription(plan);
    setBadgeRefreshKey((prev) => prev + 1);
    setShowPaywall(false);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-medium uppercase tracking-wide mb-1">
            <MessageSquare size={13} /> Conversations
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Your Conversations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Continue your literary journey</p>
        </div>
        <MessageCounterBadge
          variant="pill"
          label="FREE MESSAGES"
          refreshKey={badgeRefreshKey}
          onPress={handleBadgePress}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className="pl-9"
        />
      </div>

      {/* Chat list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse surface-card h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-[14px] bg-surface-2 flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No conversations yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-5">
            Start a new conversation by selecting a book from the library.
          </p>
          <Link href="/books" className="accent-button h-10 px-5 inline-flex items-center gap-2 text-sm font-medium">
            <BookOpen size={15} /> Browse books
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((chat, i) => (
            <Link href={`/chat/${chat.book_id}`} key={chat.id}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative h-48 overflow-hidden surface-card hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer"
              >
                <BookCoverImage
                  src={chat.cover_url}
                  alt={chat.title}
                  variant="fill"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <h3 className="font-semibold text-white mb-1 line-clamp-1">
                    {chat.title || 'Untitled Book'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
                    <Clock className="w-3 h-3" />
                    <span>{chat.author ?? 'Unknown Author'}</span>
                  </div>
                  <p className="text-xs text-white/50 line-clamp-2">
                    {chat.last_message || 'Start chatting with this book'}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      <PremiumPaywallDrawer
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={(plan) => { void handlePaywallPurchase(plan); }}
        onRestore={() => setShowPaywall(false)}
        onPrivacyPolicy={() => setShowPaywall(false)}
      />
    </div>
  );
}
