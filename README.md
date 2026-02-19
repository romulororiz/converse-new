# Converse

Converse is a single-root Next.js app for AI-powered book conversations, with Neon Auth for authentication, Neon Postgres for data, and provider integrations for chat and voice.

## Requirements

- Node.js 18+
- pnpm 8+

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env.local` in the project root:

```env
DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
OPENAI_API_KEY=
GOOGLE_WEB_CLIENT_ID=
GOOGLE_WEB_CLIENT_SECRET=
ELEVENLABS_API_KEY=
```

3. Start development server:

```bash
pnpm dev
```

## Scripts

- `pnpm dev` — start Next.js in development mode
- `pnpm build` — production build
- `pnpm start` — run production server
- `pnpm lint` — run ESLint
- `pnpm type-check` — run TypeScript checks
- `pnpm seed:subscription-plans` — seed the `subscription_plans` table with free, premium, and trial (uses `DATABASE_URL` from `.env.local`)

**Neon Console: can't edit tables (padlock / RLS)?** Run the SQL in `scripts/disable-rls-for-console-editing.sql` in Neon's SQL Editor to disable RLS on app tables so you can edit rows in the dashboard. The `user_subscription_status` object is a **view** (read-only); to change subscription data, edit the **profiles** table. To show user name and email in that view, run `scripts/recreate-user-subscription-status-view.sql`.