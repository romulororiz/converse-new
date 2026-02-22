'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Copy, Bookmark, BookmarkCheck, Share2, Check, ArrowUp, BookOpen, Sparkles, ArrowLeft, Mic, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingDots } from '@/components/LoadingDots';
import { MessageCounterBadge } from '@/components/MessageCounterBadge';
import { ChatOptionsMenu } from '@/components/ChatOptionsMenu';
import { InsightsPanel } from '@/components/InsightsPanel';
import { LampGlow } from '@/components/LampGlow';
import { Tabs } from '@/components/ui/Tabs';
import { useHighlights } from '@/lib/hooks/useHighlights';
import type { Book } from '@/lib/core';
import { fetchBookChat, sendBookMessage, resetBookChat, type ChatMessage } from '@/lib/services/chats';
import { fetchSubscriptionStatus, upgradeSubscription } from '@/lib/services/subscription';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const VoiceChat = dynamic(() => import('@/components/VoiceChat').then((m) => m.VoiceChat), { ssr: false });
const PremiumPaywallDrawer = dynamic(() => import('@/components/PremiumPaywallDrawer').then((m) => m.PremiumPaywallDrawer));
const ShareCard = dynamic(() => import('@/components/ShareCard').then((m) => m.ShareCard));

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

const starterPrompts = [
  { label: 'Core ideas', prompt: 'What are the core ideas of this book?' },
  { label: 'Action steps', prompt: 'Give me practical action steps I can apply today.' },
  { label: 'Key lessons', prompt: 'What are the most important lessons from this book?' },
  { label: 'Who benefits', prompt: 'Who would benefit most from reading this book?' },
];

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

  const handleChatReset = useCallback(() => {
    setMessages([]);
    setRemainingMessages(null);
    setBadgeRefreshKey((prev) => prev + 1);
  }, []);

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
            id: m.id, content: m.content, role: m.role, created_at: m.created_at,
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
      <div className="flex items-center justify-center h-[60vh]" style={{ backgroundColor: 'var(--chat-bg)' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-(--neo-accent)/30 border-t-(--neo-accent) animate-spin mx-auto mb-3" />
          <p className="mono text-[11px] text-(--text-muted) uppercase tracking-widest">Opening book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)]" style={{ backgroundColor: 'var(--chat-bg)' }}>
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Book header */}
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/books"
              aria-label="Back to library"
              className="p-1.5 rounded-md hover:bg-(--bg-overlay) transition-colors text-(--text-muted) hover:text-(--text-primary) shrink-0"
            >
              <ArrowLeft size={15} />
            </Link>
            <Link href={`/book/${bookId}`} className="flex items-center gap-3 min-w-0 group">
              <div className="w-9 h-12 rounded-md overflow-hidden shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.6)] relative ring-1 ring-(--neo-accent)/20">
                {book?.cover_url ? (
                  <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="36px" />
                ) : (
                  <div className="w-full h-full bg-(--neo-accent-light) flex items-center justify-center">
                    <BookOpen size={12} className="text-(--neo-accent)" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-serif font-semibold text-sm truncate text-(--text-primary) leading-tight group-hover:text-(--neo-accent) transition-colors">
                  {book?.title ?? 'Book'}
                </p>
                <p className="mono text-[10px] text-(--text-muted) truncate uppercase tracking-widest mt-0.5">
                  {[book?.author, bookYear, firstTopic].filter(Boolean).join(' · ') || 'Unknown'}
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
            <ChatOptionsMenu
              bookId={bookId}
              bookTitle={book?.title}
              onResetComplete={handleChatReset}
            />
          </div>
        </div>

        {/* Mobile tabs */}
        <div
          className="lg:hidden flex justify-center py-1.5 border-b shrink-0"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <Tabs tabs={[{ id: 'chat', label: 'Chat' }, { id: 'insights', label: 'Insights' }]} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Messages */}
        {activeTab === 'chat' ? (
          <div className="relative flex-1 min-h-0">
            <div className="h-full overflow-y-auto">
              <div className="max-w-3xl mx-auto space-y-6 pb-6 pt-8 px-4 md:px-6">

                {/* Empty state */}
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center relative">
                    <LampGlow className="-top-16 left-1/2 -translate-x-1/2" size={400} opacity={0.7} />
                    {/* Book avatar */}
                    <div className="relative mb-6 z-10">
                      <div className="w-16 h-16 rounded-full ring-2 ring-(--neo-accent)/30 overflow-hidden shadow-[0_0_30px_rgba(201,168,76,0.15)]">
                        {book?.cover_url ? (
                          <Image src={book.cover_url} alt={book?.title ?? ''} width={64} height={64} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-(--neo-accent-light) flex items-center justify-center">
                            <span className="font-serif text-2xl font-bold text-(--neo-accent)">{bookInitial}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <h2 className="font-serif text-3xl font-bold italic text-(--text-primary) mb-2 z-10">
                      Where shall we begin?
                    </h2>
                    <p className="text-sm text-(--text-muted) max-w-xs mb-8 z-10 leading-relaxed">
                      Ask {book?.title ?? 'this book'} anything — explore ideas, themes, and insights.
                    </p>
                    {/* Starter prompt grid */}
                    <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm z-10">
                      {starterPrompts.map((sp) => (
                        <motion.button
                          key={sp.prompt}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSendMessage(sp.prompt)}
                          className="ink-card p-3 text-left hover:border-(--neo-accent)/40 transition-all duration-200 group"
                        >
                          <p className="mono text-[10px] text-(--neo-accent) uppercase tracking-wider mb-1">{sp.label}</p>
                          <p className="text-xs text-(--text-secondary) group-hover:text-(--text-primary) transition-colors leading-snug">{sp.prompt}</p>
                        </motion.button>
                      ))}
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
                        initial={index === messages.length - 1 ? { opacity: 0, y: 10 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="group"
                        data-testid={`message-${message.id}`}
                      >
                        {isUser ? (
                          /* User message — right-aligned, gold right border */
                          <div className="flex justify-end">
                            <div
                              className="max-w-[75%] px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed border-r-2"
                              style={{
                                backgroundColor: 'var(--bg-elevated)',
                                borderColor: 'var(--neo-accent)',
                                color: 'var(--text-primary)',
                              }}
                            >
                              {message.content}
                            </div>
                          </div>
                        ) : (
                          /* AI message — left-aligned with avatar */
                          <div className="flex gap-3">
                            {/* Gold-ring avatar */}
                            <div
                              className="w-7 h-7 rounded-full shrink-0 mt-1 ring-1 ring-(--neo-accent)/30 overflow-hidden shadow-[0_0_12px_rgba(201,168,76,0.1)] flex items-center justify-center"
                              style={{ backgroundColor: 'var(--neo-accent-light)' }}
                            >
                              {book?.cover_url ? (
                                <Image src={book.cover_url} alt="" width={28} height={28} className="object-cover w-full h-full" />
                              ) : (
                                <span className="mono text-[10px] font-bold text-(--neo-accent)">{bookInitial}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              {/* Message bubble */}
                              <div
                                className="rounded-2xl rounded-tl-sm px-5 py-4 border text-sm leading-[1.8] text-(--text-primary)"
                                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                              >
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                    strong: ({ children }) => <strong className="font-semibold text-(--neo-accent)">{children}</strong>,
                                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
                                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
                                    li: ({ children }) => <li>{children}</li>,
                                    h1: ({ children }) => <h3 className="font-serif text-base font-bold text-(--text-primary) mt-4 mb-2">{children}</h3>,
                                    h2: ({ children }) => <h3 className="font-serif text-base font-bold text-(--text-primary) mt-4 mb-2">{children}</h3>,
                                    h3: ({ children }) => <h4 className="font-serif text-sm font-bold text-(--text-primary) mt-3 mb-1.5">{children}</h4>,
                                    code: ({ children }) => <code className="bg-(--bg-overlay) px-1.5 py-0.5 rounded text-xs mono text-(--text-secondary)">{children}</code>,
                                    blockquote: ({ children }) => (
                                      <blockquote className="book-spine pl-4 italic text-(--text-secondary) my-3 font-serif text-[15px]">{children}</blockquote>
                                    ),
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>

                              {/* Key Insight callout */}
                              {keyInsight && (
                                <div className="book-spine ink-panel px-4 py-3 mt-2 rounded-md">
                                  <p className="mono text-[10px] font-medium text-(--neo-accent) mb-1.5 flex items-center gap-1.5 uppercase tracking-[0.15em]">
                                    <Sparkles size={10} /> Key Insight
                                  </p>
                                  <p className="font-serif text-sm text-(--text-primary) font-medium leading-relaxed italic">{keyInsight}</p>
                                </div>
                              )}

                              {/* Hover-reveal message actions */}
                              <div className="flex items-center gap-0.5 mt-1.5 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleCopy(message.id, message.content)}
                                  className="p-1.5 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-colors"
                                  title="Copy"
                                >
                                  {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                                <button
                                  onClick={() => handleToggleHighlight(message)}
                                  data-testid={`bookmark-btn-${message.id}`}
                                  className={cn(
                                    'p-1.5 rounded-md transition-colors',
                                    highlighted
                                      ? 'text-(--neo-accent)'
                                      : 'text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated)'
                                  )}
                                  title={highlighted ? 'Remove from highlights' : 'Save highlight'}
                                >
                                  {highlighted ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                                </button>
                                <button
                                  onClick={() => handleShare(message.content)}
                                  className="p-1.5 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-colors"
                                  title="Share"
                                >
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

                {/* Sending indicator */}
                {sending && (
                  <div className="flex gap-3">
                    <div
                      className="w-7 h-7 rounded-full shrink-0 mt-1 ring-1 ring-(--neo-accent)/30 flex items-center justify-center"
                      style={{ backgroundColor: 'var(--neo-accent-light)' }}
                    >
                      <span className="mono text-[10px] font-bold text-(--neo-accent)">{bookInitial}</span>
                    </div>
                    <div
                      className="rounded-2xl rounded-tl-sm px-5 py-4 border text-sm flex items-center gap-2"
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                    >
                      <LoadingDots />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>
          </div>
        ) : (
          /* Mobile Insights tab */
          <div className="flex-1 min-h-0 overflow-y-auto p-5 lg:hidden" style={{ backgroundColor: 'var(--chat-bg)' }}>
            <h2 className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.18em] mb-5">Insights</h2>
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
          <div
            className="shrink-0 px-4 py-3 border-t"
            style={{
              backgroundColor: 'var(--composer-bg)',
              borderColor: 'var(--border)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {isBlocked && (
              <div className="max-w-3xl mx-auto mb-2 text-center">
                <p className="text-xs text-(--neo-danger)">
                  You&apos;ve used all free messages today.{' '}
                  <button onClick={() => setShowPaywall(true)} className="text-(--neo-accent) underline cursor-pointer font-medium">
                    Upgrade for unlimited.
                  </button>
                </p>
              </div>
            )}
            <div className="max-w-3xl mx-auto flex items-end gap-2">
              <div
                className="flex-1 flex items-end gap-2 rounded-xl border px-3 py-2"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={newMessage}
                  onChange={(e) => { setNewMessage(e.target.value); autoResize(); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder={isBlocked ? 'Upgrade to continue chatting...' : `Ask ${book?.title ?? 'this book'} anything...`}
                  disabled={isBlocked}
                  data-testid="chat-input"
                  className="flex-1 bg-transparent text-sm text-(--text-primary) placeholder:text-(--text-muted) outline-none resize-none disabled:opacity-50 py-1"
                  style={{ minHeight: '28px', maxHeight: '160px' }}
                />
              </div>
              <button
                onClick={handleOpenVoice}
                disabled={sending || remainingApiSeconds > 0 || isBlocked}
                className="w-10 h-10 shrink-0 rounded-xl ghost-gold flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
                aria-label="Voice chat"
              >
                <Mic size={15} />
              </button>
              <button
                onClick={() => handleSendMessage()}
                disabled={sending || remainingApiSeconds > 0 || isBlocked || !newMessage.trim()}
                data-testid="send-btn"
                aria-label="Send message"
                className="w-10 h-10 shrink-0 rounded-xl gold-button flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
              >
                {remainingApiSeconds > 0 ? (
                  <span className="mono text-[10px] font-bold text-(--text-on-accent)">{remainingApiSeconds}</span>
                ) : (
                  <ArrowUp size={15} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop insights panel */}
      <aside
        className="hidden lg:flex flex-col w-72 shrink-0 border-l overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="px-4 py-3.5 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <p className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.18em]">Insights</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
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
        <div
          className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowShareCard(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="mx-4 max-h-[80vh] overflow-y-auto">
            <ShareCard bookTitle={book?.title ?? 'Book'} bookAuthor={book?.author} bookCover={book?.cover_url} quote={shareQuote} />
            <button
              onClick={() => setShowShareCard(false)}
              className="ghost-gold h-9 px-4 text-sm font-medium mt-4 mx-auto flex"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <PremiumPaywallDrawer
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={(plan) => { void handlePaywallPurchase(plan); }}
        onRestore={() => setShowPaywall(false)}
        onPrivacyPolicy={() => setShowPaywall(false)}
      />

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
