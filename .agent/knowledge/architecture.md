# Hakiread — Architecture

> System design, data flows, and component boundaries for the Hakiread platform.

---

## High-Level Topology

```
Browser (Client Components)
  └── React UI (reading interface, session player, dashboard)
  └── Calls Next.js Route Handlers via fetch

Next.js App Router (Server)
  ├── Server Components       → read Supabase directly (non-sensitive data)
  ├── Route Handlers (API)    → all AI calls, all mutations, all sensitive reads
  │     └── AIClient          → Vercel AI SDK → OpenAI / Anthropic
  │     └── Supabase Admin    → service role for privileged operations
  └── Middleware              → Supabase Auth session validation

Supabase
  ├── PostgreSQL              → all persistent data
  ├── Auth                    → email/password + session management
  ├── Storage                 → user-uploaded documents (PDF, EPUB)
  └── RLS Policies            → row-level security on every table
```

---

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── dashboard/page.tsx          ← daily session entry point
│   │   ├── diagnostic/page.tsx         ← 3-min onboarding diagnostic
│   │   ├── session/[id]/page.tsx       ← active training session player
│   │   ├── profile/page.tsx            ← Reading Profile + progress curve
│   │   ├── library/page.tsx            ← user's imported documents
│   │   └── reports/page.tsx            ← weekly progress reports
│   └── api/
│       ├── diagnostic/route.ts         ← POST: run behavioral analysis → Reading Profile
│       ├── session/generate/route.ts   ← POST: build today's training session
│       ├── session/complete/route.ts   ← POST: save session results
│       ├── comprehension/route.ts      ← POST: generate questions for a text passage
│       ├── progress/route.ts           ← GET: fetch speed/comprehension curve data
│       └── documents/route.ts          ← POST: upload + parse document
├── features/
│   ├── reader/                     ← RSVP player, text highlighter, speed controls
│   ├── diagnostic/                 ← calibration session UI
│   ├── training/                   ← daily training session UI
│   ├── comprehension/              ← question display + answer UI
│   ├── profile/                    ← Reading Profile card, bottleneck chart
│   └── progress/                   ← speed/comprehension curve chart
├── shared/
│   └── ui/                         ← Button, Card, Modal, ProgressBar, etc.
├── lib/
│   ├── ai/
│   │   ├── client.ts                   ← AIClient factory (reads AI_PROVIDER env var)
│   │   ├── adapters/
│   │   │   ├── openai.ts
│   │   │   └── anthropic.ts
│   │   └── prompts/
│   │       ├── diagnostic.ts           ← behavioral analysis prompt
│   │       ├── comprehension.ts        ← question generation prompt
│   │       ├── sessionBuilder.ts       ← training session content prompt
│   │       └── progressAnalysis.ts     ← drift detection + coaching feedback prompt
│   ├── supabase/
│   │   ├── server.ts                   ← createServerClient (Route Handlers, Server Components)
│   │   └── browser.ts                  ← createBrowserClient (Client Components)
│   ├── reading/
│   │   ├── bottleneckDetector.ts       ← behavioral signal → bottleneck classification
│   │   ├── profileBuilder.ts           ← builds/updates ReadingProfile from session data
│   │   └── curveAnalyzer.ts            ← speed/comprehension time series analysis
│   └── constants.ts                    ← all magic values live here
├── types/
│   ├── reading.ts                      ← ReadingProfile, Bottleneck, SessionResult
│   ├── session.ts                      ← TrainingSession, Exercise, ComprehensionQuestion
│   └── progress.ts                     ← ProgressPoint, WeeklyReport, DriftAlert
└── middleware.ts                        ← Supabase Auth session refresh
```

---

## Database Schema

```sql
-- Supabase Auth handles users table

-- User's diagnosed reading profile
CREATE TABLE reading_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users NOT NULL UNIQUE,
  primary_bottleneck     TEXT NOT NULL,  -- 'subvocalization' | 'regression' | 'vocabulary' | 'topic_unfamiliarity'
  bottleneck_severity    NUMERIC(3,2),   -- 0.0 to 1.0
  secondary_bottleneck   TEXT,
  baseline_wpm           INTEGER,
  baseline_comprehension NUMERIC(3,2),
  vocabulary_percentile  INTEGER,
  last_diagnosed_at      TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

-- Each daily training session
CREATE TABLE training_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users NOT NULL,
  session_type  TEXT NOT NULL,  -- 'diagnostic' | 'training' | 'reading'
  bottleneck_targeted TEXT,
  exercises     JSONB,          -- array of exercise configs
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Results from each completed session
CREATE TABLE session_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID REFERENCES training_sessions NOT NULL,
  user_id         UUID REFERENCES auth.users NOT NULL,
  wpm_achieved    INTEGER,
  comprehension_score NUMERIC(3,2),  -- 0.0 to 1.0
  questions_total INTEGER,
  questions_correct INTEGER,
  exercise_scores JSONB,
  notes           TEXT,             -- AI coaching feedback for this session
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Comprehension questions generated per text passage
CREATE TABLE comprehension_sets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users NOT NULL,
  text_hash    TEXT NOT NULL,       -- SHA-256 of source text (for caching)
  source_text  TEXT,
  questions    JSONB NOT NULL,      -- [{question, options, correct_index, level}]
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- User-uploaded documents
CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users NOT NULL,
  title        TEXT NOT NULL,
  file_type    TEXT,               -- 'pdf' | 'epub' | 'text' | 'url'
  storage_path TEXT,              -- Supabase Storage path
  extracted_text TEXT,            -- parsed plain text content
  word_count   INTEGER,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Weekly progress snapshots
CREATE TABLE progress_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users NOT NULL,
  week_start      DATE NOT NULL,
  avg_wpm         INTEGER,
  avg_comprehension NUMERIC(3,2),
  sessions_completed INTEGER,
  drift_detected  BOOLEAN DEFAULT false,
  drift_details   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policies Required (All Tables)
```sql
-- Pattern for every table:
ALTER TABLE reading_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can only access own data"
  ON reading_profiles FOR ALL
  USING (auth.uid() = user_id);
-- Repeat for: training_sessions, session_results, comprehension_sets, documents, progress_snapshots
```

---

## Core Data Flows

### 1. Diagnostic Flow
```
User reads calibration passage (timed, in-app reader)
  → Passage ends → comprehension micro-check (3 questions)
  → POST /api/diagnostic {
      wpm_recorded, comprehension_score,
      speed_variance, word_category_hesitations,
      passage_type: 'narrative' | 'technical'
    }
  → bottleneckDetector.ts analyzes behavioral signals
  → LLM prompt (prompts/diagnostic.ts) refines classification
  → profileBuilder.ts creates ReadingProfile
  → Upsert reading_profiles table
  → Return ReadingProfile to client
```

### 2. Daily Session Generation Flow
```
User opens dashboard
  → GET reading_profiles (Server Component, direct Supabase read)
  → POST /api/session/generate { profile_id, date }
  → Fetch ReadingProfile from DB
  → prompts/sessionBuilder.ts → AIClient.generate()
  → Returns structured TrainingSession JSON
  → Insert training_sessions record
  → Return session to client
```

### 3. Comprehension Check Flow
```
User finishes reading a passage
  → POST /api/comprehension { text_passage, session_id }
  → Hash text → check comprehension_sets cache (text_hash lookup)
  → Cache hit: return cached questions
  → Cache miss:
      → prompts/comprehension.ts → AIClient.generate()
      → Parse JSON response → validate with Zod
      → Insert comprehension_sets record
      → Return questions to client
  → User answers → score calculated client-side
  → POST /api/session/complete { session_id, wpm, comprehension_score, answers }
  → Insert session_results
  → curveAnalyzer.ts checks for drift
  → Return coaching feedback (from prompts/progressAnalysis.ts)
```

### 4. Progress Analysis Flow
```
Weekly cron (Supabase Edge Function or Vercel Cron)
  → Aggregate last 7 days of session_results per user
  → curveAnalyzer.ts detects: plateau, drift, bottleneck shift
  → prompts/progressAnalysis.ts → AIClient.generate() coaching summary
  → Insert progress_snapshots record
  → Trigger weekly report notification
```

---

## AI Layer Design

All AI calls go through `lib/ai/client.ts`. Provider is set by `AI_PROVIDER` env var.

```typescript
// lib/ai/client.ts — the only place provider SDKs are imported
export function getAIClient(): AIClient {
  const provider = process.env.AI_PROVIDER ?? 'anthropic';
  if (provider === 'openai') return new OpenAIAdapter();
  return new AnthropicAdapter();
}
```

**Switching providers = changing one env var. Zero code changes.**

### AI Functions Summary

| Function | Prompt File | Input | Output |
|---------|------------|-------|--------|
| Diagnostic analysis | `prompts/diagnostic.ts` | Behavioral signals JSON | ReadingProfile JSON |
| Session builder | `prompts/sessionBuilder.ts` | ReadingProfile + date | TrainingSession JSON |
| Comprehension generator | `prompts/comprehension.ts` | Text passage | Question array JSON |
| Progress analyzer | `prompts/progressAnalysis.ts` | Session history | Coaching summary + drift flag |

All AI outputs are validated with Zod schemas before use. If parsing fails, the Route Handler returns a 500 and logs the raw output.

---

## Key Architecture Boundaries

| Boundary | Rule |
|----------|------|
| AI calls | Server-side Route Handlers only — never in Client Components or browser hooks |
| Prompts | `src/lib/ai/prompts/` only — never inline strings in Route Handlers |
| Supabase server client | Route Handlers + Server Components only |
| Supabase browser client | Client Components only, non-sensitive reads |
| `system_prompt` / prompts | Never returned in any API response |
| Reading Profile | Single source of truth — all session generation derives from it |
| Comprehension questions | Always cached by text hash — never re-generate for the same passage |
| Speed score alone | Never shown without comprehension score alongside it |


---

## RSVP Engine Design

The RSVP player is a Client Component (`'use client'`) — it manages its own animation state.

```
RSVPPlayer (Client Component)
  ├── wordQueue: string[][]     ← pre-chunked array of word groups
  ├── currentIndex: number
  ├── wpm: number               ← 100–1200, controlled by user
  ├── chunkSize: 1 | 2 | 3      ← words per flash
  ├── isPlaying: boolean
  └── requestAnimationFrame loop  ← 60fps — no setInterval
```

**60fps constraint:** The animation loop must use `requestAnimationFrame`, not `setInterval`. At 1200 WPM a word flashes every 50ms — `setInterval` drifts; `rAF` does not.

**Keyboard shortcuts** (registered via `useEffect` on mount/unmount):
- `Space` — Play/Pause
- `←` — Rewind one sentence
- `→` — Fast forward one sentence
- `↑ / ↓` — WPM +10 / -10

---

## URL Scraper Flow

```
User pastes URL
  → POST /api/documents/scrape { url }
  → Server: fetch raw HTML via node-fetch
  → Pass HTML to Readability.js → extract article body
  → Strip: ads, nav menus, footers, cookie banners
  → Return { title, content, wordCount }
  → On failure (SPA, paywall, JS-rendered): return { error: 'scrape_failed' }
  → Client: show fallback "Paste text manually" with error message
```

**Readability.js** is the only approved library for URL scraping. Never write custom HTML stripping logic.

---

## TL;DR Summary Flow

```
User imports text → summary generated before RSVP starts
  → POST /api/summary { text_hash, text_excerpt }
  → Check comprehension_sets cache (same text_hash used for questions)
  → Cache miss: prompts/summary.ts → AIClient.generate()
  → Store alongside question cache in comprehension_sets
  → Return { bullets: string[] }  ← 3–7 bullet points
  → Shown in SummaryCard before "Start Reading" button
  → User can skip — summary is optional
```

---

## Dynamic Pacing Flow (Phase 2)

```
Pre-processing step before RSVP starts:
  → POST /api/session/pace { text }
  → Split text into sentences
  → Score each sentence: vocabulary density + avg word length + clause complexity
  → Return pacing_map: [{ sentence_index, wpm_modifier }]
      e.g. [{ index: 4, modifier: 0.7 }] = slow to 70% of current WPM
  → RSVPPlayer reads pacing_map, applies modifier per sentence during playback
```
