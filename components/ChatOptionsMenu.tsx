'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MoreVertical, RotateCcw, Flag } from 'lucide-react';
import { resetBookChat } from '@/lib/services/chats';

interface ChatOptionsMenuProps {
  bookId: string;
  bookTitle?: string;
  onResetComplete: () => void;
}

export function ChatOptionsMenu({ bookId, bookTitle, onResetComplete }: ChatOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmReset(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setConfirmReset(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleReset = useCallback(async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setResetting(true);
    try {
      await resetBookChat(bookId);
      onResetComplete();
      setOpen(false);
      setConfirmReset(false);
    } catch (err) {
      console.error('Failed to reset chat:', err);
    } finally {
      setResetting(false);
    }
  }, [bookId, confirmReset, onResetComplete]);

  const handleReportIssue = () => {
    const subject = encodeURIComponent(`Issue Report — ${bookTitle ?? 'Chat'}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to report an issue with the chat for "${bookTitle ?? 'a book'}" (ID: ${bookId}).\n\nDescribe the issue:\n\n`
    );
    window.open(`mailto:support@converse.app?subject=${subject}&body=${body}`, '_self');
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => { setOpen((v) => !v); setConfirmReset(false); }}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
        aria-label="Chat options"
        aria-expanded={open}
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-surface-1 shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
            {resetting
              ? 'Resetting…'
              : confirmReset
                ? 'Tap again to confirm'
                : 'Reset Chat'}
          </button>
          <button
            onClick={handleReportIssue}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-surface-2 transition-colors"
          >
            <Flag size={14} />
            Report Issue
          </button>
        </div>
      )}
    </div>
  );
}
