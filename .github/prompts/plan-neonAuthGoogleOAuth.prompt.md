## Plan: Neon Auth + Google OAuth Integration

Replace Supabase auth entirely with Neon Auth (`@neondatabase/auth`) and Google OAuth as the primary social login provider. The app is a single-root Next.js App Router project with Neon Postgres for DB access.

### Completed

1. **Removed Supabase auth runtime** — deleted `lib/supabase/client.ts`, removed `@supabase/supabase-js` from `package.json`, and stripped all Supabase session/signout calls from components and services.
2. **Installed `@neondatabase/auth`** — added as dependency; provides server auth instance, client SDK, UI components, and middleware.
3. **Created server auth instance** — `lib/auth/server.ts` uses `createNeonAuth()` with `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` from env. Fails fast if either is missing.
4. **Created client auth instance** — `lib/auth/client.ts` exports `createAuthClient()` for client-side session checks.
5. **Wired auth API route handler** — `app/api/auth/[...path]/route.ts` exports `GET` and `POST` from `auth.handler()`.
6. **Added auth UI routes** — `app/auth/[path]/page.tsx` renders `<AuthView>` (sign-in, sign-up, forgot-password). `app/account/[path]/page.tsx` renders `<AccountView>` (settings, security, etc.).
7. **Created `NeonAuthProvider`** — `components/NeonAuthProvider.tsx` wraps app in `<NeonAuthUIProvider>` with `social: { providers: ['google'] }`.
8. **Updated layout** — `app/layout.tsx` imports Neon auth CSS, wraps children in `NeonAuthProvider`, includes nav with `NavAuthButtonSlot`.
9. **Updated nav auth button** — `components/NavAuthButton.tsx` uses `<SignedIn>`, `<SignedOut>`, `<UserButton>` from Neon auth.
10. **Updated `RequireAuth`** — `components/RequireAuth.tsx` checks Neon client session; redirects to `/auth/sign-in` if unauthenticated.
11. **Added middleware** — `middleware.ts` protects `/books/*`, `/chat/*`, `/profile/*` with `auth.middleware({ loginUrl: '/auth/sign-in' })`.
12. **Updated profile API** — `app/api/profile/route.ts` derives user ID from Neon auth server session (`auth.getSession()`), not client-supplied.
13. **Login redirect** — `app/login/page.tsx` redirects to `/auth/sign-in`.
14. **Environment configured** — `.env.local` has `NEON_AUTH_BASE_URL` (correct host: `ep-late-cherry-ag8j81ve.neonauth.c-2.eu-central-1.aws.neon.tech/neondb/auth`) and `NEON_AUTH_COOKIE_SECRET`.
15. **Neon Auth provisioned** — `neon_auth` schema exists in DB with user/session/account tables; Google social provider enabled (shared mode); `allow_localhost = true`.
16. **Fixed stale cache 500s** — cleared `.next` and `node_modules/.cache` to remove ghost `@supabase+auth-js` vendor chunks.
17. **Fixed auth route 404s** — corrected `NEON_AUTH_BASE_URL` hostname (was missing `c-2.` segment) and set `dynamicParams = true` on `/auth/[path]` page.

### Verified

- `pnpm type-check` — passes.
- `pnpm build` — passes; all auth routes present in output.
- `GET /auth/sign-in` — 200 (sign-in UI renders with email/password + Google button).
- `GET /api/auth/get-session` — 200 (returns `null` when logged out).
- No runtime `@supabase` imports remain in app source.

### Remaining / To Verify

1. **End-to-end Google sign-in flow** — click "Sign in with Google" in browser, complete OAuth consent, verify redirect back to app with active session. If redirect fails, check `trusted_origins` in `neon_auth.project_config` (currently empty — may need `http://localhost:3000` added).
2. **Session persistence** — after sign-in, confirm `GET /api/auth/get-session` returns user data; confirm protected routes (`/books`, `/chat`, `/profile`) load without redirect.
3. **Profile auto-creation** — on first sign-in, a Neon Auth user is created in `neon_auth.user`. The app's `profiles` table in `public` schema needs a corresponding row. Options: (a) DB trigger on `neon_auth.user` insert, (b) app-level upsert in profile API on first access.
4. **Sign-out flow** — verify `<UserButton>` sign-out clears session cookie and redirects to home or sign-in.
5. **Credential rotation** — rotate all keys/secrets exposed during development (DB connection string, OpenAI key, cookie secret) before any deployment.
6. **Trusted origins config** — for production, add deployed domain to `neon_auth.project_config.trusted_origins`.
7. **Email/password sign-up** — currently enabled in Neon Auth config. Decide whether to keep or disable (Google-only).
8. **Account management pages** — `/account/settings`, `/account/security` etc. are wired but untested at runtime.

### Key Files

| Purpose | Path |
|---|---|
| Server auth instance | `lib/auth/server.ts` |
| Client auth instance | `lib/auth/client.ts` |
| Auth API handler | `app/api/auth/[...path]/route.ts` |
| Sign-in/up UI | `app/auth/[path]/page.tsx` |
| Account management UI | `app/account/[path]/page.tsx` |
| Auth UI provider | `components/NeonAuthProvider.tsx` |
| Nav auth button | `components/NavAuthButton.tsx` |
| Route guard (client) | `components/RequireAuth.tsx` |
| Route guard (middleware) | `middleware.ts` |
| Profile API (server auth) | `app/api/profile/route.ts` |
| Environment | `.env.local` |

### Neon Project Reference

- Project: `Converse` (`tiny-credit-46641175`)
- Region: `aws-eu-central-1`
- Default branch: `production` (`br-bitter-meadow-ags0a82q`)
- Endpoint: `ep-late-cherry-ag8j81ve`
- Auth URL: `https://ep-late-cherry-ag8j81ve.neonauth.c-2.eu-central-1.aws.neon.tech/neondb/auth`

---

## Plan: Full App UI Redesign

The app is in a post-migration scaffold state: routing, auth, data, and API integration work, but every page is a developer wireframe with no design system, no component reuse, and no polish. This plan upgrades the UI to a modern, production-quality web app.

### Current State

- **No design system** — 7 CSS custom properties + ~10 global utility classes in `app/globals.css`
- **No component library** — no Tailwind, Radix, shadcn, or Headless UI installed
- **Heavy inline styles** — every page rebuilds form inputs and layout from scratch
- **No shared UI primitives** — no Button, Input, Card, Modal, Spinner, or Toast components
- **Chat page is a debug form** — raw UUID input, no conversation history, no message bubbles
- **No responsive design** — only `.grid-3` auto-fit is responsive; no mobile nav/menu
- **No loading/error/empty states** — plain text only ("Loading…", "Checking session…")
- **No animations or transitions**
- **Dark theme only** — hardcoded, no light mode

### Phase 1: Foundation — Design System + Component Library

**Goal:** Install Tailwind + shadcn/ui, replace global CSS with design tokens, create shared primitives.

**Steps:**

1. Install Tailwind CSS v4 and configure `tailwind.config.ts` with the existing dark color palette tokens (`--bg`, `--surface`, `--accent`, etc.) mapped to Tailwind's theme
2. Install shadcn/ui (uses Radix + Tailwind) — initialize with `npx shadcn@latest init`, select dark theme
3. Add core shadcn components: `Button`, `Input`, `Textarea`, `Card`, `Badge`, `Skeleton`, `Separator`, `DropdownMenu`, `Avatar`, `Toast`/`Sonner`, `Dialog`/`Sheet`
4. Create shared layout components:
   - `components/ui/PageHeader.tsx` — page title + kicker + optional actions
   - `components/ui/EmptyState.tsx` — icon + title + description + optional CTA
   - `components/ui/LoadingSpinner.tsx` — replaces "Loading…" text everywhere
5. Replace all inline styles across pages with Tailwind utility classes
6. Remove old global utility classes from `app/globals.css` (`.card`, `.grid`, `.btn`, `.kicker`, `.subtle`)
7. Switch Neon Auth CSS import from `@neondatabase/auth/ui/css` to `@neondatabase/auth/ui/tailwind` (Tailwind v4 compatible) in `app/globals.css`

**Files touched:** `package.json`, `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, `components/ui/*` (new), `components.json` (shadcn config)

### Phase 2: Navigation + Layout Shell

**Goal:** Responsive nav with mobile menu, active link indicators, proper layout structure.

**Steps:**

1. Rebuild `app/layout.tsx` nav using shadcn `Sheet` for mobile drawer menu (hamburger icon on small screens)
2. Add active link highlighting using `usePathname()` — accent underline or background on current nav link
3. Add Inter font via `next/font/google` for consistent typography (currently just system fallback)
4. Add a minimal footer with app name + links
5. Add a `<Toaster />` (Sonner) to layout for app-wide toast notifications
6. Replace `NavAuthButtonSlot` dynamic import with proper Suspense boundary if needed

**Files touched:** `app/layout.tsx`, `components/NavAuthButton.tsx`, `components/NavAuthButtonSlot.tsx`, `components/MobileNav.tsx` (new)

### Phase 3: Home Page

**Goal:** Polished landing page with clear value prop and feature cards.

**Steps:**

1. Redesign hero section with larger typography, gradient accent text, and a CTA button ("Get Started" → `/auth/sign-in` or `/books` depending on auth state)
2. Replace feature cards with shadcn `Card` components — add icons (Lucide) for each feature (BookOpen, MessageCircle, User)
3. Add conditional content: show personalized greeting + recent activity for signed-in users vs. marketing copy for guests
4. Make fully responsive (single column on mobile, 3-col grid on desktop)

**Files touched:** `app/page.tsx`

### Phase 4: Books Page

**Goal:** Polished book browsing with proper search UX, cards, and states.

**Steps:**

1. Replace raw `<input>` + inline styles with shadcn `Input` + `Button` in a proper search bar component
2. Replace book cards with shadcn `Card` — add cover image placeholder (gradient or icon if no `cover_url`), author badge, description truncation with "Read more"
3. Add `Skeleton` loading state (card grid with shimmer placeholders)
4. Add `EmptyState` component for "No books found" with search icon
5. Add debounced search (search-as-you-type with 300ms debounce) instead of manual Search/Reset buttons
6. Add pagination or infinite scroll with "Load more" button
7. Link each book card to a future `/books/[id]` detail page (placeholder for now)

**Files touched:** `app/books/page.tsx`, `components/BookCard.tsx` (new), `components/SearchBar.tsx` (new)

### Phase 5: Chat Page — Full Redesign

**Goal:** Transform from debug form into a real conversational UI.

**Steps:**

1. Replace raw Book ID input with a book picker dropdown (fetches from `/api/books`, shows title + author)
2. Build a chat message list with distinct user/assistant message bubbles (aligned left/right, different bg colors)
3. Add a fixed input bar at the bottom with textarea + send button
4. Add typing indicator (animated dots) while waiting for AI response
5. Store conversation history in component state; display full thread
6. Add `Skeleton` loading state for initial load
7. Add streaming response support if OpenAI route is updated to use SSE (optional, can be deferred)
8. Add an empty state for new conversations ("Ask me anything about this book")

**Files touched:** `app/chat/page.tsx` (major rewrite), `components/chat/MessageBubble.tsx` (new), `components/chat/ChatInput.tsx` (new), `components/chat/BookPicker.tsx` (new), `components/chat/TypingIndicator.tsx` (new)

### Phase 6: Profile Page

**Goal:** Polished form with avatar, validation feedback, and toast notifications.

**Steps:**

1. Replace raw form with shadcn `Input`, `Textarea`, `Button`, `Avatar` components
2. Add avatar display (from `avatar_url` in profile) with upload placeholder
3. Add inline form validation (highlight invalid fields, show error text below inputs)
4. Replace plain-text success/error message with `toast()` notifications (Sonner)
5. Add "Manage Account" link to `/account/settings` for Neon Auth account management
6. Show user email from auth session in a read-only badge
7. Add favorite genres as tag/chip input (optional enhancement)

**Files touched:** `app/profile/page.tsx`, possibly `components/ProfileForm.tsx` (new)

### Phase 7: Auth Page Wrapper

**Goal:** Wrap Neon Auth prebuilt UI in app-branded container.

**Steps:**

1. Wrap `<AuthView>` in a centered card container with app logo/name above the form
2. Add dark-themed background to match app (Neon Auth inherits from Tailwind theme via CSS import)
3. Same treatment for `<AccountView>` pages

**Files touched:** `app/auth/[path]/page.tsx`, `app/account/[path]/page.tsx`

### Phase 8: Polish + Accessibility

**Goal:** Cross-cutting UX improvements.

**Steps:**

1. Add focus-visible ring styles globally (keyboard navigation indicators)
2. Add `aria-label` attributes to nav links, form inputs, and interactive elements
3. Add page transition animations (subtle fade-in on route change using `next-view-transitions` or CSS)
4. Add hover/active states to all interactive elements (cards, buttons, links)
5. Update `RequireAuth` loading state to use `Skeleton` or `LoadingSpinner` instead of text
6. Add `<title>` per page using Next.js `metadata` exports
7. Test responsive layout at mobile (375px), tablet (768px), and desktop (1280px) breakpoints

**Files touched:** `app/globals.css`, `components/RequireAuth.tsx`, all page files (metadata)

### Dependency Additions

| Package | Purpose |
|---|---|
| `tailwindcss` + `@tailwindcss/postcss` | Utility-first CSS framework |
| `shadcn` (+ `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`) | Component library (installed via `npx shadcn@latest init`) |
| `sonner` | Toast notifications |
| `next-themes` | Dark/light mode toggle (optional — defer if dark-only is fine) |

### Verification

- All pages render without errors at 375px, 768px, and 1280px widths
- `pnpm type-check` and `pnpm build` pass after each phase
- Keyboard navigation works (Tab through all interactive elements, Enter to activate)
- Loading → content → error → empty transitions are smooth on every page
- Chat page supports multi-turn conversation display
- Auth sign-in/sign-up and account pages render with app branding

### Suggested Implementation Order

Phases are sequential — each builds on the prior:

1. Foundation (Tailwind + shadcn + primitives) — unblocks everything else
2. Navigation + Layout — establishes the shell all pages live in
3. Home → Books → Profile → Auth wrapper — increasing complexity, quick wins first
4. Chat — largest rewrite, saved for when primitives are solid
5. Polish + Accessibility — final sweep
