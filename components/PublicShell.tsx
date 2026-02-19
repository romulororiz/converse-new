'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { SignedIn, SignedOut } from '@neondatabase/auth/react';

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-lg">
            <span className="w-8 h-8 rounded-[10px] accent-button inline-flex items-center justify-center">
              <Sparkles size={15} />
            </span>
            <span>ConversAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/discover" className="hover:text-foreground transition-colors">Discover</Link>
            <Link href="/books" className="hover:text-foreground transition-colors">Books</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-3">
            <SignedIn>
              <Link
                href="/app"
                className="accent-button h-9 px-4 inline-flex items-center gap-2 text-sm font-medium"
              >
                Open App <ArrowRight size={14} />
              </Link>
            </SignedIn>
            <SignedOut>
              <Link
                href="/auth/sign-in"
                className="ghost-button h-9 px-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="accent-button h-9 px-4 inline-flex items-center text-sm font-medium"
              >
                Get started
              </Link>
            </SignedOut>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border py-12 mt-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-semibold mb-4">
                <span className="w-6 h-6 rounded-[8px] accent-button inline-flex items-center justify-center">
                  <Sparkles size={12} />
                </span>
                ConversAI
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The modern way to read, think and converse.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/discover" className="hover:text-foreground transition-colors">Discover</Link>
                <Link href="/books" className="hover:text-foreground transition-colors">Library</Link>
                <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Company</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span>About</span>
                <span>Blog</span>
                <span>Careers</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Legal</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ConversAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
