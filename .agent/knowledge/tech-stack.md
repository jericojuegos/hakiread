# Hakiread — Tech Stack

> Approved technologies, conventions, and prohibited patterns for Hakiread development.

---

## Stack Overview

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS |
| **Package manager** | pnpm |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (email/password) |
| **Storage** | Supabase Storage (user documents) |
| **AI Orchestration** | Vercel AI SDK (`ai` package) |
| **AI Providers** | Anthropic Claude (default) · OpenAI (via adapter) |
| **Schema validation** | Zod |
| **Deployment** | Vercel |

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | `PascalCase.tsx` | `ReadingProfileCard.tsx`, `SessionPlayer.tsx` |
| Hooks | `useCamelCase.ts` | `useReadingProfile.ts`, `useSessionTimer.ts` |
| Utilities / lib | `camelCase.ts` | `bottleneckDetector.ts`, `curveAnalyzer.ts` |
| AI prompts | `camelCase.ts` | `diagnostic.ts`, `comprehension.ts` |
| Constants | `UPPER_SNAKE` | `MAX_SESSION_WPM`, `MIN_COMPREHENSION_THRESHOLD` |
| Types / Interfaces | `PascalCase` | `ReadingProfile`, `TrainingSession`, `BottleneckType` |
| Next.js reserved files | `lowercase.tsx` | `page.tsx`, `layout.tsx`, `loading.tsx`, `route.ts` |
| DB tables | `snake_case` plural | `reading_profiles`, `session_results` |
| Supabase RLS policies | descriptive string | `"users can only access own data"` |

---

## File Structure Rules

```
src/app/api/          ← Route Handlers only — no UI here
src/app/(auth)/       ← login, register pages
src/app/(app)/        ← all authenticated app pages
src/components/features/  ← one folder per feature
src/components/shared/    ← shared UI components only
src/lib/ai/           ← AIClient, adapters, ALL prompts
src/lib/supabase/     ← server.ts and browser.ts clients only
src/lib/reading/      ← reading logic (bottleneck detection, curve analysis)
src/types/            ← all TypeScript types and interfaces
```

---

## Key Constants (`src/lib/constants.ts`)

```typescript
export const MAX_SESSION_WPM = 1000;
export const MIN_COMPREHENSION_THRESHOLD = 0.60;  // below this = too fast
export const OPTIMAL_COMPREHENSION_TARGET = 0.75;
export const DIAGNOSTIC_PASSAGE_WORDS = 300;
export const DAILY_SESSION_MINUTES = 10;
export const COMPREHENSION_QUESTIONS_PER_SESSION = 5;
export const PROFILE_UPDATE_INTERVAL_DAYS = 14;
export const CACHE_QUESTIONS_BY_TEXT_HASH = true;
export const MAX_AI_CALLS_FREE_TIER_DAILY = 3;
```

---

## Supabase Patterns

```typescript
// ✅ Server-side (Route Handlers, Server Components)
import { createClient } from '@/lib/supabase/server';
const supabase = createClient();

// ✅ Browser (Client Components — non-sensitive reads only)
import { createClient } from '@/lib/supabase/browser';
const supabase = createClient();

// ❌ Never — service role key on client
// ❌ Never — SUPABASE_SERVICE_ROLE_KEY in NEXT_PUBLIC_ vars
```

---

## Vercel AI SDK Pattern

```typescript
// ✅ Correct — in a Route Handler only
import { getAIClient } from '@/lib/ai/client';
import { buildDiagnosticPrompt } from '@/lib/ai/prompts/diagnostic';

export async function POST(req: Request) {
  const body = await req.json();
  const prompt = buildDiagnosticPrompt(body);
  const result = await getAIClient().generate(prompt);
  // parse + validate with Zod
}

// ❌ Wrong — AI call in a Client Component or hook
// ❌ Wrong — inline prompt string in Route Handler
```

---

## Zod Validation Pattern

All Route Handler inputs AND all AI outputs validated with Zod:

```typescript
// Input validation
const DiagnosticInputSchema = z.object({
  wpm_recorded: z.number().min(50).max(1500),
  comprehension_score: z.number().min(0).max(1),
  passage_type: z.enum(['narrative', 'technical', 'mixed']),
});

// AI output validation
const ReadingProfileSchema = z.object({
  primary_bottleneck: z.enum(['subvocalization', 'regression', 'vocabulary', 'topic_unfamiliarity']),
  bottleneck_severity: z.number().min(0).max(1),
  secondary_bottleneck: z.enum(['subvocalization', 'regression', 'vocabulary', 'topic_unfamiliarity']).optional(),
  baseline_wpm: z.number().int().positive(),
  vocabulary_percentile: z.number().int().min(0).max(100),
});
```

---

## Commit Format

`type(scope): message`

Scopes: `auth`, `diagnostic`, `session`, `comprehension`, `profile`, `progress`, `ai`, `db`, `ui`

Examples:
```
feat(diagnostic): implement behavioral bottleneck detection
feat(comprehension): add question caching by text hash
fix(session): prevent session generation without valid reading profile
chore(db): add RLS policies for session_results table
```

---

## Prohibited List

| Prohibited | Reason | Use Instead |
|-----------|--------|-------------|
| AI SDK imports in Client Components | Security — exposes AI logic to browser | Route Handlers only |
| Inline prompt strings in Route Handlers | Unmaintainable, untuneable | `src/lib/ai/prompts/` files |
| Showing speed score without comprehension | Core product integrity — speed alone is misleading | Always show both |
| `any` TypeScript type | Bypasses type safety | `unknown` + Zod narrowing |
| `console.log` in committed code | Noise in production | Remove or use structured logger |
| Hardcoded WPM limits or thresholds | Brittle, scattered | `src/lib/constants.ts` |
| Skipping Zod validation on AI output | AI output is unpredictable | Always parse + validate |
| `SUPABASE_SERVICE_ROLE_KEY` in client code | Full DB bypass — security catastrophe | Server-side only |
| Re-generating comprehension questions for same text | Wastes LLM credits | Check `text_hash` cache first |
| Reading Profile generated from a single session | One session is noisy — profile needs 2+ data points | Require at least diagnostic + 1 training session |


---

## Additional Libraries (Added from PRD)

| Library | Purpose | Approved Usage |
|---------|---------|---------------|
| `@mozilla/readability` | URL article extraction — strips ads, nav, footers | `POST /api/documents/scrape` only — never client-side |
| `node-fetch` | Fetch raw HTML from URLs server-side | URL scraper Route Handler only |
| `crypto` (Node built-in) | SHA-256 text hashing for comprehension cache | `lib/reading/textHash.ts` utility |

---

## RSVP Engine Rules

```
[ ] Animation loop uses requestAnimationFrame — never setInterval or setTimeout
[ ] WPM range: 100–1200 — enforced via constants MAX_SESSION_WPM and MIN_SESSION_WPM
[ ] Chunk size: 1 | 2 | 3 words — no other values accepted
[ ] Keyboard shortcuts registered in useEffect with cleanup on unmount
[ ] No RSVP logic in Server Components — RSVPPlayer is 'use client' only
```

---

## AI Temperature Rules

| Feature | Temperature | Reason |
|---------|------------|--------|
| Comprehension questions | `0.0` | Factual — must reference only the provided text |
| TL;DR summaries | `0.0` | Factual extraction — no creative interpretation |
| Diagnostic analysis | `0.2` | Slight flexibility for nuanced profile generation |
| Session builder | `0.4` | Variety in training content is desirable |
| Progress analysis / coaching | `0.4` | Coaching tone benefits from some variation |

**The `0.0` rule for comprehension and summaries is non-negotiable** — these features must never hallucinate content not present in the source text.

---

## Updated Constants (`src/lib/constants.ts`)

```typescript
export const MAX_SESSION_WPM = 1200;
export const MIN_SESSION_WPM = 100;
export const WPM_STEP_FINE = 10;
export const WPM_STEP_COARSE = 100;
export const CHUNK_SIZES = [1, 2, 3] as const;
export const MIN_COMPREHENSION_THRESHOLD = 0.60;
export const OPTIMAL_COMPREHENSION_TARGET = 0.75;
export const DIAGNOSTIC_PASSAGE_WORDS = 300;
export const DAILY_SESSION_MINUTES = 10;
export const COMPREHENSION_QUESTIONS_PER_SESSION = 5;
export const PROFILE_UPDATE_INTERVAL_DAYS = 14;
export const MAX_AI_CALLS_FREE_TIER_DAILY = 3;
export const MAX_DOCUMENT_SIZE_MB = 10;
export const QUIZ_PASS_SCORE = 0.75;
export const TARGET_DAU_RATE = 0.40;
export const XP_BASE_MULTIPLIER = 1.0; // multiplied by comprehension score
```
