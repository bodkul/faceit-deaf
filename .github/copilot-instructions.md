# FaceitDeaf Platform — AI Coding Agent Guide

## Architecture Overview
FaceitDeaf is a Next.js 16 application for tracking CS2 FACEIT matches among deaf/hard-of-hearing players. It uses the App Router, TypeScript, Supabase (DB and real-time), Trigger.dev v4 for background jobs, and integrates with the external FACEIT API.

### Core Services and Data Flows
- **FACEIT API**: Fetches match data via a rate-limited client (`src/lib/faceit/client.ts`). External ID format: `1-{id}`; in the database — without the prefix.
- **Supabase**: Stores data, provides real-time subscriptions for UI (matches, players, stats).
- **Trigger.dev v4**: Background match sync jobs (`src/trigger/`). Use only `task()` from `@trigger.dev/sdk/v3`.
- **Next.js API Routes**: REST endpoints in `src/app/api/` for data aggregation and transformation.

#### Data Flow
1. Trigger.dev jobs sync FACEIT data → Supabase
2. UI updates via Supabase real-time subscriptions
3. SWR hooks + Supabase cache-helpers manage client state
4. API routes aggregate/transform complex queries

## Critical Patterns and Conventions

### Database Operations
- All mutations must go through `src/lib/supabase/mutations.ts` (never write direct queries)
- Types are generated in `src/types/database.ts` (`npm run update-types`)
- For real-time: use hooks like `useMatchesSubscription`, `usePlayersSubscription`

### FACEIT API Integration
- Rate limit: 10 req/sec via `pThrottle` (`src/lib/faceit/client.ts`)
- Batch: `pMap` with concurrency limit (`src/lib/faceit/api/api.ts`)
- Always transform match IDs between API and DB

### Trigger.dev
- All jobs in `src/trigger/*.ts`, use only `task()` (NOT `client.defineJob`)
- Config: `trigger.config.ts` (max duration, retry)
- Run: `npm run trigger:dev`

### Component Architecture
- Pages: `_components/` for page-specific, global — in `src/components/`
- Hooks: `src/hooks/`, use SWR + Supabase
- Typing: via hook return types, e.g. `type MatchType = NonNullable<ReturnType<typeof useMatch>["match"]>`

## Key Commands

```bash
npm run dev            # Next.js + watch
npm run trigger:dev    # Trigger.dev background jobs
npm run update-types   # Generate Supabase types
npm run lint && npm run format # Linting and auto-formatting
```

## Key Files and Directories
- `src/lib/supabase/mutations.ts` — all DB mutations
- `src/types/database.ts` — auto-generated Supabase types
- `src/hooks/use*.tsx` — hooks with real-time subscriptions
- `src/lib/faceit/client.ts` — rate-limited FACEIT client
- `src/trigger/*.ts` — Trigger.dev background jobs
- `trigger.config.ts` — background job config

## Gotchas and Caveats
- Match IDs: always check format (API vs DB)
- Only use Supabase real-time subscriptions for updates (NO polling)
- Respect FACEIT API rate limit, use batch processing
- Trigger.dev: v4 syntax only, see examples in `src/trigger/`

---
If anything is unclear or you need clarification on patterns, ask the user for further guidance.