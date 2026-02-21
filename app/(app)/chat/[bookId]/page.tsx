'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Copy, Bookmark, BookmarkCheck, Share2, Check, ArrowUp, BookOpen, Sparkles, ArrowLeft, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingDots } from '@/components/LoadingDots';
import { MessageCounterBadge } from '@/components/MessageCounterBadge';
import { PremiumPaywallDrawer } from '@/components/PremiumPaywallDrawer';
import { InsightsPanel } from '@/components/InsightsPanel';
import { ShareCard } from '@/components/ShareCard';
import { Tabs } from '@/components/ui/Tabs';
import { useHighlights } from '@/lib/hooks/useHighlights';
import type { Book } from '@/lib/core';
import { fetchBookChat, sendBookMessage, type ChatMessage } from '@/lib/services/chats';
import { fetchSubscriptionStatus, upgradeSubscription } from '@/lib/services/subscription';
import { VoiceChat } from '@/components/VoiceChat';
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

type BookMetadata = {
  year?: number | string;
  topics?: string[];
};

/** Extract first bold phrase from markdown to use as key insight */
function extractKeyInsight(content: string): string | null {
  const match = content.match(/\*\*([^*]{15,120})\*\*/);
  return match ? match[1] : null;
}

export default function ChatDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [book, setBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [badgeRefreshKey, setBadgeRefreshKey] = useState(0);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium' | 'trial' | null>(null);
  const [apiRateLimitedUntil, setApiRateLimitedUntil] = useState<Date | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareQuote, setShareQuote] = useState('');
  const [showVoice, setShowVoice] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { save: saveHighlight, remove: removeHighlight, isHighlighted, forBook } = useHighlights();
  const bookHighlights = forBook(bookId ?? '');

  const isBlocked = remainingMessages === 0 && currentPlan === 'free';
  const bookInitial = book?.title?.[0]?.toUpperCase() ?? 'B';
  const bookMeta = (book?.metadata as BookMetadata | null) ?? null;
  const bookYear = typeof bookMeta?.year === 'number' || typeof bookMeta?.year === 'string'
    ? String(bookMeta.year)
    : null;
  const firstTopic = Array.isArray(bookMeta?.topics) && bookMeta.topics.length > 0
    ? bookMeta.topics[0]
    : null;

  useEffect(() => {
    if (!bookId) return;
    (async () => {
      try {
        const [booksRes, chatRes, subscriptionRes] = await Promise.all([
          fetch('/api/books?q=', { cache: 'no-store' }),
          fetchBookChat(bookId),
          fetchSubscriptionStatus().catch(() => null),
        ]);
        const books: Book[] = await booksRes.json();
        const found = books.find((b) => b.id === bookId);
        if (found) setBook(found);
        setMessages(chatRes.messages.map((m: ChatMessage) => ({
          id: m.id, content: m.content, role: m.role, created_at: m.created_at,
        })));
        if (subscriptionRes?.messageInfo) {
          const { remainingMessages: rem, plan: p } = subscriptionRes.messageInfo;
          if (typeof rem === 'number' && !Number.isNaN(rem)) setRemainingMessages(rem);
          if (p === 'free' || p === 'premium' || p === 'trial') setCurrentPlan(p);
        }
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally { setLoading(false); }
    })();
  }, [bookId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const getRemainingTime = (t: Date | null) => t ? Math.max(0, Math.ceil((t.getTime() - Date.now()) / 1000)) : 0;
  const remainingApiSeconds = getRemainingTime(apiRateLimitedUntil);

  useEffect(() => {
    if (remainingApiSeconds > 0) {
      const interval = setInterval(() => { if (getRemainingTime(apiRateLimitedUntil) <= 0) setApiRateLimitedUntil(null); }, 1000);
      return () => clearInterval(interval);
    }
  }, [apiRateLimitedUntil, remainingApiSeconds]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const handleSendMessage = useCallback(async (content?: string) => {
    const text = (content ?? newMessage).trim();
    if (!text || sending || remainingApiSeconds > 0 || isBlocked) return;

    const tempMessage: Message = { id: 'temp-' + Date.now(), content: text, role: 'user', created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
    setSending(true);

    try {
      const response = await sendBookMessage(bookId, text);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { id: response.userMessage.id, content: response.userMessage.content, role: response.userMessage.role, created_at: response.userMessage.created_at },
        { id: response.aiMessage.id, content: response.aiMessage.content, role: response.aiMessage.role, created_at: response.aiMessage.created_at },
      ]);
      const nextRem = Number(response.remainingMessages);
      setRemainingMessages(Number.isNaN(nextRem) ? 0 : nextRem);
      if (response.plan === 'free' || response.plan === 'premium' || response.plan === 'trial') setCurrentPlan(response.plan);
      setBadgeRefreshKey((prev) => prev + 1);
      if ((Number.isNaN(nextRem) ? 0 : nextRem) === 0 && response.plan === 'free') setTimeout(() => setShowPaywall(true), 600);
    } catch (error) {
      setMessages((prev) => prev.slice(0, -1));
      const details = error instanceof Error && 'details' in error
        ? ((error as Error & { details?: Record<string, unknown> }).details ?? null) : null;
      if (details?.plan === 'free') { setShowPaywall(true); return; }
      if (details?.isApiRateLimit) {
        const waitTime = typeof details.waitTime === 'number' && details.waitTime > 0 ? details.waitTime : 60;
        setApiRateLimitedUntil(new Date(Date.now() + waitTime * 1000));
        return;
      }
      setMessages((prev) => [...prev, {
        id: 'error-' + Date.now(), content: error instanceof Error ? error.message : 'Error sending message',
        role: 'assistant', created_at: new Date().toISOString(),
      }]);
    } finally { setSending(false); }
  }, [bookId, newMessage, sending, remainingApiSeconds, isBlocked]);

  const handlePaywallPurchase = async (plan: 'weekly' | 'monthly' | 'yearly') => {
    await upgradeSubscription(plan);
    setShowPaywall(false);
    const data = await fetchSubscriptionStatus().catch(() => null);
    if (data?.messageInfo) {
      const rem = Number(data.messageInfo.remainingMessages);
      setRemainingMessages(Number.isNaN(rem) ? 0 : rem);
      if (data.messageInfo.plan === 'free' || data.messageInfo.plan === 'premium' || data.messageInfo.plan === 'trial') {
        setCurrentPlan(data.messageInfo.plan);
      }
    }
    setBadgeRefreshKey((prev) => prev + 1);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleHighlight = (message: Message) => {
    if (!book) return;
    if (isHighlighted(message.content, bookId ?? '')) {
      const h = bookHighlights.find((x) => x.content === message.content);
      if (h) void removeHighlight(h.id);
    } else {
      void saveHighlight({
        bookId: bookId ?? '',
        bookTitle: book.title,
        bookAuthor: book.author ?? undefined,
        bookCover: book.cover_url ?? undefined,
        content: message.content,
      });
    }
  };

  const handleShare = (content: string) => { setShareQuote(content); setShowShareCard(true); };

  const handleOpenVoice = async () => {
    try {
      const { subscription } = await fetchSubscriptionStatus();
      if (subscription?.subscription_plan !== 'premium') {
        setShowPaywall(true);
        return;
      }
      setShowVoice(true);
    } catch {
      setShowPaywall(true);
    }
  };

  const handleVoiceConversationComplete = async (voiceMessages: { role: 'user' | 'assistant'; content: string }[]) => {
    if (voiceMessages.length === 0) return;

    const tempMessages: Message[] = voiceMessages.map((msg) => ({
      id: `voice-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content: msg.content,
      role: msg.role,
      created_at: new Date().toISOString(),
    }));
    setMessages((prev) => [...prev, ...tempMessages]);

    try {
      const res = await fetch(`/api/voice/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          messages: voiceMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (res.ok) {
        const { messages: savedMessages } = await res.json();
        setMessages((prev) => {
          const tempIds = new Set(tempMessages.map((t) => t.id));
          const withoutTemp = prev.filter((m) => !tempIds.has(m.id));
          const dbMessages: Message[] = savedMessages.map((m: { id: string; content: string; role: 'user' | 'assistant'; created_at: string }) => ({
            id: m.id,
            content: m.content,
            role: m.role,
            created_at: m.created_at,
          }));
          return [...withoutTemp, ...dbMessages];
        });
      }
    } catch (error) {
      console.error('Failed to persist voice messages:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)]" style={{ backgroundColor: 'var(--chat-bg)' }}>
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Book header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/books" className="p-1 rounded-[6px] hover:bg-surface-2 transition-colors text-muted-foreground hover:text-foreground">
              <ArrowLeft size={16} />
            </Link>
            <Link href={`/book/${bookId}`} className="flex items-center gap-3 min-w-0 group">
              <div className="w-11 h-14 rounded-[8px] overflow-hidden shrink-0 shadow-sm relative border border-border">
                {book?.cover_url ? (
                  <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="44px" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <BookOpen size={14} className="text-primary" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate text-foreground leading-tight group-hover:text-primary transition-colors">
                  {book?.title ?? 'Book'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{book?.author ?? 'Unknown author'}</p>
                <p className="text-[10px] text-muted-foreground/90 truncate mt-0.5">
                  {[bookYear ? `Year ${bookYear}` : null, firstTopic].filter(Boolean).join(' • ') || 'Tap cover for details'}
                </p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <MessageCounterBadge
              variant="pill"
              refreshKey={badgeRefreshKey}
              remainingOverride={remainingMessages}
              planOverride={currentPlan}
              onPress={() => setShowPaywall(true)}
            />
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden flex justify-center py-1.5 border-b border-border bg-white shrink-0">
          <Tabs tabs={[{ id: 'chat', label: 'Chat' }, { id: 'insights', label: 'Insights' }]} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Messages */}
        {activeTab === 'chat' ? (
          <div className="relative flex-1 min-h-0">
            <div className="h-full overflow-y-auto">
              <div className="max-w-[720px] mx-auto space-y-5 pb-4 pt-6 px-4">
                {messages.length === 0 ? (
                  <div className="flex justify-center pt-16">
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-3 border border-primary/10">
                        <span className="text-primary font-bold text-xl">{bookInitial}</span>
                      </div>
                      <p className="font-semibold text-foreground mb-1">Ask {book?.title ?? 'this book'} anything</p>
                      <p className="text-sm text-muted-foreground max-w-xs">Start a conversation to explore ideas, themes, and insights from this book.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    const highlighted = isHighlighted(message.content, bookId ?? '');
                    const keyInsight = !isUser ? extractKeyInsight(message.content) : null;
                    return (
                      <motion.div
                        key={message.id}
                        initial={index === messages.length - 1 ? { opacity: 0, y: 8 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                        data-testid={`message-${message.id}`}
                      >
                        {isUser ? (
                          <div className="flex justify-end">
                            <div className="max-w-[75%] bg-primary text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-sm">
                              {message.content}
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-1 border border-primary/10">
                              {bookInitial}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-border shadow-sm text-sm leading-[1.75] text-foreground/90 accent-border-left">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
                                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
                                    li: ({ children }) => <li>{children}</li>,
                                    h1: ({ children }) => <h3 className="text-base font-bold text-foreground mt-4 mb-2">{children}</h3>,
                                    h2: ({ children }) => <h3 className="text-base font-bold text-foreground mt-4 mb-2">{children}</h3>,
                                    h3: ({ children }) => <h4 className="text-sm font-bold text-foreground mt-3 mb-1.5">{children}</h4>,
                                    code: ({ children }) => <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                                    blockquote: ({ children }) => <blockquote className="border-l-2 border-[#C4822A]/40 pl-3 italic text-foreground/70 my-3">{children}</blockquote>,
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>

                              {/* Key Insight callout */}
                              {keyInsight && (
                                <div className="highlight-callout px-4 py-3 mt-2">
                                  <p className="text-[11px] font-bold text-[#C4822A] mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                                    <Sparkles size={11} /> Key Insight
                                  </p>
                                  <p className="text-sm text-foreground/90 font-medium leading-relaxed">{keyInsight}</p>
                                </div>
                              )}

                              {/* Hover-reveal actions */}
                              <div className="flex items-center gap-1 mt-1.5 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleCopy(message.id, message.content)} className="p-1.5 rounded-[8px] text-muted-foreground/60 hover:text-foreground hover:bg-surface-2 transition-colors" title="Copy">
                                  {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                                <button
                                  onClick={() => handleToggleHighlight(message)}
                                  data-testid={`bookmark-btn-${message.id}`}
                                  className={cn('p-1.5 rounded-[8px] transition-colors', highlighted ? 'text-[#C4822A]' : 'text-muted-foreground/60 hover:text-foreground hover:bg-surface-2')}
                                  title={highlighted ? 'Remove from highlights' : 'Save highlight'}
                                >
                                  {highlighted ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                                </button>
                                <button onClick={() => handleShare(message.content)} className="p-1.5 rounded-[8px] text-muted-foreground/60 hover:text-foreground hover:bg-surface-2 transition-colors" title="Share">
                                  <Share2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
                {sending && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-1 border border-primary/10">
                      {bookInitial}
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-border shadow-sm text-sm text-muted-foreground flex items-center gap-2">
                      <LoadingDots />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 lg:hidden" style={{ backgroundColor: 'var(--chat-bg)' }}>
            <InsightsPanel
              highlights={bookHighlights.map((h) => h.content)}
              onPrompt={(p) => { setActiveTab('chat'); handleSendMessage(p); }}
              onShareHighlight={(content) => handleShare(content)}
              onRemoveHighlight={(index) => { const h = bookHighlights[index]; if (h) void removeHighlight(h.id); }}
            />
          </div>
        )}

        {/* Composer */}
        {activeTab === 'chat' && (
          <div className="shrink-0 border-t border-border px-4 py-3" style={{ backgroundColor: 'var(--composer-bg)' }}>
            {isBlocked && (
              <div className="max-w-[720px] mx-auto mb-2 text-center">
                <p className="text-xs text-danger">You&apos;ve used all free messages today.{' '}
                  <button onClick={() => setShowPaywall(true)} className="text-primary underline cursor-pointer font-medium">Upgrade for unlimited.</button>
                </p>
              </div>
            )}
            <div className="max-w-[720px] mx-auto flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); autoResize(); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder={isBlocked ? 'Upgrade to continue chatting...' : `Ask ${book?.title ?? 'this book'} anything...`}
                disabled={isBlocked}
                data-testid="chat-input"
                className="flex-1 pl-4 pr-4 py-3 rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/30 transition-colors resize-none disabled:opacity-50"
                style={{ backgroundColor: 'var(--surface-3)', minHeight: '44px', maxHeight: '160px' }}
              />
              <button
                onClick={handleOpenVoice}
                disabled={sending || remainingApiSeconds > 0 || isBlocked}
                className="w-[44px] h-[44px] shrink-0 rounded-xl border border-border text-primary flex items-center justify-center transition hover:bg-surface-1 disabled:opacity-30 cursor-pointer"
                style={{ backgroundColor: 'var(--surface-3)' }}
                title="Voice chat"
              >
                <Mic size={15} />
              </button>
              <button
                onClick={() => handleSendMessage()}
                disabled={sending || remainingApiSeconds > 0 || isBlocked || !newMessage.trim()}
                data-testid="send-btn"
                className="w-[44px] h-[44px] shrink-0 rounded-xl accent-button flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
              >
                {remainingApiSeconds > 0 ? (
                  <span className="text-[10px] font-bold">{remainingApiSeconds}</span>
                ) : (
                  <ArrowUp size={15} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop insights panel */}
      <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-white border-l border-border py-4 px-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <InsightsPanel
            highlights={bookHighlights.map((h) => h.content)}
            onPrompt={(p) => handleSendMessage(p)}
            onShareHighlight={(content) => handleShare(content)}
            onRemoveHighlight={(index) => { const h = bookHighlights[index]; if (h) void removeHighlight(h.id); }}
          />
        </div>
      </aside>

      {/* Share card modal */}
      {showShareCard && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowShareCard(false)}>
          <div onClick={(e) => e.stopPropagation()} className="mx-4 max-h-[80vh] overflow-y-auto">
            <ShareCard bookTitle={book?.title ?? 'Book'} bookAuthor={book?.author} bookCover={book?.cover_url} quote={shareQuote} />
            <button onClick={() => setShowShareCard(false)} className="outline-button h-9 px-4 text-sm font-medium mt-4 mx-auto flex">Close</button>
          </div>
        </div>
      )}

      <PremiumPaywallDrawer visible={showPaywall} onClose={() => setShowPaywall(false)} onPurchase={(plan) => { void handlePaywallPurchase(plan); }} onRestore={() => setShowPaywall(false)} onPrivacyPolicy={() => setShowPaywall(false)} />

      <VoiceChat
        visible={showVoice}
        onClose={() => setShowVoice(false)}
        onConversationComplete={handleVoiceConversationComplete}
        bookId={bookId}
        bookTitle={book?.title}
        bookAuthor={book?.author ?? undefined}
      />
    </div>
  );
}
