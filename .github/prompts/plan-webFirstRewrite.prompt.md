## Plan: Web-First Rewrite Migration (DRAFT)

You chose a big-bang rewrite, new web UI, and core-first parity. The safest way to satisfy that combination is to keep business logic/data contracts, rebuild presentation and platform integrations for web, and remove Expo mobile only after the new web app is fully wired and verified. The main risk area is not UI conversion itself, but native dependencies and client-side AI key usage; those must be replaced with server-side web patterns to avoid breakage and security regressions. This plan preserves app behavior while modernizing stack and architecture.

**Steps**
1. Freeze and baseline current behavior from [apps/mobile/App.js](apps/mobile/App.js), [apps/mobile/src/navigation/AppNavigator.tsx](apps/mobile/src/navigation/AppNavigator.tsx), and key screens under [apps/mobile/src/screens](apps/mobile/src/screens), documenting required core-first parity flows.
2. Create a production web app in [apps/web](apps/web) using Next.js App Router + TypeScript + Tailwind + component primitives, and set monorepo tasks in [package.json](package.json), [turbo.json](turbo.json), and [pnpm-workspace.yaml](pnpm-workspace.yaml).
3. Extract reusable domain/data logic from [apps/mobile/src/services](apps/mobile/src/services), [apps/mobile/src/types/supabase.ts](apps/mobile/src/types/supabase.ts), and [apps/mobile/src/utils/validation.ts](apps/mobile/src/utils/validation.ts) into shared packages for web consumption.
4. Replace platform-bound auth/session layer from [apps/mobile/src/lib/supabase.ts](apps/mobile/src/lib/supabase.ts) and [apps/mobile/src/services/googleAuth.ts](apps/mobile/src/services/googleAuth.ts) with web-native Supabase auth (browser storage, web redirects, callback routes).
5. Move AI calls off client: replace direct key usage paths in chat/voice services with server-side endpoints in web app route handlers, preserving request/response contracts used by chat UI.
6. Rebuild core-first pages and routes for web parity: auth, home/discover/books list, book detail, chat detail, profile/settings based on existing behavior from [apps/mobile/src/screens](apps/mobile/src/screens).
7. Re-implement media and integrations for web equivalents: browser microphone/media recorder, web audio playback, file upload via browser APIs, and disable/defer mobile-only notifications for core-first scope.
8. Port state/providers with web-safe storage and effects from [apps/mobile/src/components/AuthProvider.tsx](apps/mobile/src/components/AuthProvider.tsx), [apps/mobile/src/contexts/ThemeContext.tsx](apps/mobile/src/contexts/ThemeContext.tsx), and [apps/mobile/src/contexts/SubscriptionContext.tsx](apps/mobile/src/contexts/SubscriptionContext.tsx).
9. Remove Expo mobile app after web parity signoff: delete [apps/mobile](apps/mobile), remove Expo/EAS/native deps from workspace manifests, and clean scripts/configs that reference mobile runtime.
10. Finalize CI/build/deploy for web-only runtime and run regression checks on all core-first flows.

**Verification**
- Static quality gates: workspace typecheck, lint, and unit tests pass.
- Functional parity checks: login/signup/logout, browse/search/filter books, open book detail, create/open chat, send/receive messages, profile edit/upload.
- Security checks: no client-exposed OpenAI/ElevenLabs private keys in browser bundles.
- Build and runtime checks: web production build succeeds and starts cleanly in local and deployment environment.

**Decisions**
- Migration model: Big-bang rewrite.
- UI direction: New web UI (not RN-web reuse).
- Launch scope: Core-first parity (auth, browse, chat, profile first; advanced voice/notifications can follow).
