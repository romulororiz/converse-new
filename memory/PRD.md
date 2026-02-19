# ConversAI - Product Requirements Document

## Problem Statement
ConversAI is a web app for having AI conversations about books. Users can discover books, chat with AI about their favorite books, save highlights, and track reading goals.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Neon (Serverless Postgres)
- **Authentication**: `@neondatabase/auth` (Neon Auth) with Google OAuth
- **AI**: OpenAI for chat completions
- **Styling**: Tailwind CSS v4, CSS Variables, Framer Motion
- **Frontend**: React 19, Server & Client Components

## Architecture
```
/app/                    # Project root
├── app/                 # Next.js App Router
│   ├── layout.tsx       # Root layout (html/body, fonts, globals.css)
│   ├── page.tsx         # Landing page (/)
│   ├── globals.css      # Global styles with warm cream theme
│   ├── auth/            # Auth pages (/auth/sign-in, /auth/sign-up)
│   │   ├── layout.tsx   # NeonAuthProvider wrapper
│   │   └── [path]/      # Dynamic auth routes
│   ├── d/               # Authenticated section (/d/*)
│   │   ├── layout.tsx   # AppShell + NeonAuthProvider wrapper
│   │   ├── page.tsx     # Dashboard
│   │   ├── discover/    # Discover books
│   │   ├── books/       # Library
│   │   ├── chat/        # Chat with books
│   │   ├── chats/       # Chat history
│   │   ├── highlights/  # Saved highlights
│   │   ├── goals/       # Reading goals
│   │   └── settings/    # User settings
│   ├── books/           # Public book listing
│   ├── discover/        # Public discover
│   ├── pricing/         # Pricing page
│   └── api/             # Next.js API routes (auth, books, chat, etc.)
├── components/          # React components
├── lib/                 # Helper functions, db, auth
├── hooks/               # Custom React hooks
├── middleware.ts        # Auth middleware (protects /d/* routes)
├── backend/             # FastAPI proxy (routes /api/* to Next.js)
└── frontend/            # Emergent platform shim (runs next dev)
```

## Key Design Decision
The authenticated section uses `/d/` instead of `/app/` to avoid a Next.js routing collision (the project root is `/app/` and the Next.js app directory is `/app/app/`, which would create `/app/app/app/` causing routing confusion).

## What's Been Implemented
- [2026-02-19] **P0 Fix: App rendering** — Fixed critical routing issue, SSR auth errors, API proxy
- [2026-02-19] **UI/UX Redesign** — Warm cream theme (#FAF9F6), DM Sans + Lora fonts
- Landing page with hero, features, pricing, FAQ sections
- Auth pages (sign-in/sign-up) with Neon Auth + Google OAuth
- Public pages: /books (95 books), /discover, /pricing
- Authenticated shell (AppShell) with sidebar navigation
- Backend proxy (FastAPI) forwarding /api/* to Next.js

## P0/P1/P2 Backlog
### P1 - Verify & Complete
- [ ] Test full auth flow (sign up, sign in, sign out)
- [ ] Verify authenticated dashboard renders after login
- [ ] Test book chat functionality (OpenAI integration)
- [ ] Verify star ratings, Book of the Day, highlights features

### P2 - New Features
- [ ] Ideate and implement "viral" features
- [ ] Reading streak/gamification
- [ ] Social sharing of highlights
- [ ] Book recommendation engine

### P3 - Polish
- [ ] Add missing data-testid attributes
- [ ] Footer links (About, Blog, Careers) need proper routes
- [ ] Optimize Google OAuth button styling on auth pages
