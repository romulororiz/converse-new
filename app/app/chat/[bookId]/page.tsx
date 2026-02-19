'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Copy, Bookmark, BookmarkCheck, Share2, Check, ArrowUp, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingDots } from '@/components/LoadingDots';
import { MessageCounterBadge } from '@/components/MessageCounterBadge';
import { PremiumPaywallDrawer } from '@/components/PremiumPaywallDrawer';
import { InsightsPanel } from '@/components/InsightsPanel';
import { ShareCard } from '@/components/ShareCard';
import { Tabs } from '@/components/ui/Tabs';
import type { Book } from '@/lib/core';
import { fetchBookChat, sendBookMessage, type ChatMessage } from '@/lib/services/chats';
import { upgradeSubscription } from '@/lib/services/subscription';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
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
  const [highlights, setHighlights] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareQuote, setShareQuote] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isBlocked = remainingMessages === 0 && currentPlan === 'free';
  const bookInitial = book?.title?.[0]?.toUpperCase() ?? 'B';

  useEffect(() => {
    if (!bookId) return;
    (async () => {
      try {
        const [booksRes, chatRes] = await Promise.all([
          fetch('/api/books?q=', { cache: 'no-store' }),
          fetchBookChat(bookId),
        ]);
        const books: Book[] = await booksRes.json();
        const found = books.find((b) => b.id === bookId);
        if (found) setBook(found);
        setMessages(chatRes.messages.map((m: ChatMessage) => ({
          id: m.id, content: m.content, role: m.role, created_at: m.created_at,
        })));
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
      setRemainingMessages(response.remainingMessages);
      if (response.plan === 'free' || response.plan === 'premium' || response.plan === 'trial') {
        setCurrentPlan(response.plan);
      }
      setBadgeRefreshKey((prev) => prev + 1);
      if (response.remainingMessages === 0 && response.plan === 'free') {
        setTimeout(() => setShowPaywall(true), 600);
      }
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
        id: 'error-' + Date.now(),
        content: error instanceof Error ? error.message : 'Error sending message',
        role: 'assistant', created_at: new Date().toISOString(),
      }]);
    } finally { setSending(false); }
  }, [bookId, newMessage, sending, remainingApiSeconds, isBlocked]);

  const handlePaywallPurchase = async (plan: 'weekly' | 'monthly' | 'yearly') => {
    await upgradeSubscription(plan);
    setShowPaywall(false);
    setBadgeRefreshKey((prev) => prev + 1);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleHighlight = (content: string) => {
    setHighlights((prev) =>
      prev.includes(content) ? prev.filter((h) => h !== content) : [...prev, content]
    );
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  const handleShare = (content: string) => { setShareQuote(content); setShowShareCard(true); };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Compact single-line header */}
        <div className="flex items-center justify-between h-10 px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen size={14} className="text-primary shrink-0" />
            <span className="font-medium text-sm truncate">{book?.title ?? 'Book'}</span>
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">{book?.author ?? ''}</span>
          </div>
          <MessageCounterBadge
            variant="pill"
            refreshKey={badgeRefreshKey}
            remainingOverride={remainingMessages}
            planOverride={currentPlan}
            onPress={() => setShowPaywall(true)}
          />
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden flex justify-center py-1.5 border-b border-border shrink-0">
          <Tabs tabs={[{ id: 'chat', label: 'Chat' }, { id: 'insights', label: 'Insights' }]} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Messages */}
        {activeTab === 'chat' ? (
          <div className="relative flex-1 min-h-0">
            <div className="h-full overflow-y-auto">
              <div className="max-w-[720px] mx-auto space-y-6 pb-4 pt-6 px-4">
                {messages.length === 0 ? (
                  <div className="flex justify-center pt-20">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <span className="text-primary font-bold text-lg">{bookInitial}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">Ask {book?.title ?? 'this book'} anything</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    const isSaved = highlights.includes(message.content);
                    return (
                      <motion.div
                        key={message.id}
                        initial={index === messages.length - 1 ? { opacity: 0, y: 8 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                      >
                        {isUser ? (
                          <div className="flex justify-end">
                            <div className="max-w-[75%] bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-md text-sm leading-relaxed">
                              {message.content}
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/12 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-1">
                              {bookInitial}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="prose-chat text-sm leading-[1.7] text-foreground/90">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
                                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
                                    li: ({ children }) => <li>{children}</li>,
                                    h1: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h3>,
                                    h2: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h3>,
                                    h3: ({ children }) => <h4 className="text-sm font-semibold text-foreground mt-3 mb-1.5">{children}</h4>,
                                    code: ({ children }) => <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                                    blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/30 pl-3 italic text-foreground/70 my-3">{children}</blockquote>,
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                              {/* Hover-reveal actions */}
                              <div className="flex items-center gap-1 mt-1.5 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleCopy(message.id, message.content)} className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-surface-2 transition-colors" title="Copy">
                                  {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                                <button onClick={() => toggleHighlight(message.content)} className={cn('p-1 rounded-md transition-colors', isSaved ? 'text-primary' : 'text-muted-foreground/60 hover:text-foreground hover:bg-surface-2')} title={isSaved ? 'Remove from highlights' : 'Save'}>
                                  {isSaved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                                </button>
                                <button onClick={() => handleShare(message.content)} className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-surface-2 transition-colors" title="Share">
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
                    <div className="w-6 h-6 rounded-full bg-primary/12 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-1">
                      {bookInitial}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
                      <LoadingDots />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 lg:hidden">
            <InsightsPanel highlights={highlights} onPrompt={(p) => { setActiveTab('chat'); handleSendMessage(p); }} onShareInsight={() => { const last = [...messages].reverse().find((m) => m.role === 'assistant'); if (last) handleShare(last.content); }} onRemoveHighlight={handleRemoveHighlight} />
          </div>
        )}

        {/* Composer */}
        {activeTab === 'chat' && (
          <div className="shrink-0 border-t border-border bg-background/50 px-4 py-3">
            {isBlocked && (
              <div className="max-w-[720px] mx-auto mb-2 text-center">
                <p className="text-xs text-danger">You&apos;ve used all free messages today. <button onClick={() => setShowPaywall(true)} className="text-primary underline cursor-pointer">Upgrade for unlimited.</button></p>
              </div>
            )}
            <div className="max-w-[720px] mx-auto relative">
              <textarea
                ref={textareaRef}
                rows={1}
                value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); autoResize(); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder={isBlocked ? 'Upgrade to continue chatting...' : 'Ask this book anything...'}
                disabled={isBlocked}
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-surface-2/40 border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/30 transition-colors resize-none disabled:opacity-50"
                style={{ minHeight: '44px', maxHeight: '160px' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={sending || remainingApiSeconds > 0 || isBlocked || !newMessage.trim()}
                className="absolute right-2 bottom-2 w-8 h-8 rounded-lg accent-button flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
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
      <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-surface-1/30 py-4 px-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <InsightsPanel highlights={highlights} onPrompt={(p) => handleSendMessage(p)} onShareInsight={() => { const last = [...messages].reverse().find((m) => m.role === 'assistant'); if (last) handleShare(last.content); }} onRemoveHighlight={handleRemoveHighlight} />
        </div>
      </aside>

      {/* Share card modal */}
      {showShareCard && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowShareCard(false)}>
          <div onClick={(e) => e.stopPropagation()} className="mx-4 max-h-[80vh] overflow-y-auto">
            <ShareCard bookTitle={book?.title ?? 'Book'} bookAuthor={book?.author} bookCover={book?.cover_url} quote={shareQuote} />
            <button onClick={() => setShowShareCard(false)} className="outline-button h-9 px-4 text-sm font-medium mt-4 mx-auto flex">Close</button>
          </div>
        </div>
      )}

      <PremiumPaywallDrawer visible={showPaywall} onClose={() => setShowPaywall(false)} onPurchase={(plan) => { void handlePaywallPurchase(plan); }} onRestore={() => setShowPaywall(false)} onPrivacyPolicy={() => setShowPaywall(false)} />
    </div>
  );
}
