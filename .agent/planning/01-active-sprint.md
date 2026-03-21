# 🏃 Active Sprint — HakiRead

> Sprint Focus: Phase 0 Foundation — auth, DB schema with RLS, AI client
> abstraction, RSVP engine scaffold, and routing skeleton before any
> feature work begins.

---

## 🔄 Current Tasks — Phase 0 Foundation

### Project Setup
- [ ] `[BE]` `pnpm create next-app hakiread --typescript --tailwind --app`
- [ ] `[BE]` Install deps: `@supabase/ssr` `@supabase/supabase-js` `ai` `@ai-sdk/anthropic` `@ai-sdk/google` `zod` `server-only` `@mozilla/readability` `clsx` `tailwind-merge` `lucide-react`
- [ ] `[BE]` `src/lib/constants.ts` — ALL magic values: WPM limits, chunk sizes, thresholds, free tier AI limit, XP formula
- [ ] `[BE]` `src/shared/types/reading.ts` — `ReadingProfile`, `Bottleneck`, `SessionResult`
- [ ] `[BE]` `src/shared/types/session.ts` — `TrainingSession`, `Exercise`, `ComprehensionQuestion`
- [ ] `[BE]` `src/shared/types/progress.ts` — `ProgressPoint`, `WeeklyReport`, `DriftAlert`

### Database Schema
- [ ] `[BE]` Create all 6 tables: `reading_profiles` `training_sessions` `session_results` `comprehension_sets` `documents` `progress_snapshots`
- [ ] `[BE]` Enable RLS + `users can only access own data` policy on every table
- [ ] `[BE]` Supabase Storage bucket: `documents` (private, `/{user_id}/` path)

### Auth
- [ ] `[BE]` `src/lib/supabase/server.ts` — server client (respects RLS)
- [ ] `[BE]` `src/lib/supabase/browser.ts` — browser client
- [ ] `[BE]` `src/middleware.ts` — session refresh on all `(app)/` routes
- [ ] `[FE]` Login + Register pages (`src/app/(auth)/login/page.tsx` + `register/page.tsx`)

### AI Client
- [ ] `[BE]` `src/lib/ai/client.ts` — multi-provider factory (reads AI_PROVIDER env var) — use `templates/ai-client.ts.template`
- [ ] `[BE]` Prompt stub files: `diagnostic.ts` `comprehension.ts` `sessionBuilder.ts` `progressAnalysis.ts`

### Route + Page Scaffolding
- [ ] `[BE]` All Route Handlers scaffolded with 501 stubs
- [ ] `[FE]` All pages scaffolded with placeholder UI
- [ ] `[FE]` `RSVPPlayer` component stub — `use client` shell, no logic yet (`src/features/reader/components/RSVPPlayer.tsx`)

### Brain
- [ ] `[BRAIN]` Mark all Phase 0 tasks `[x]` when scaffold verified running
- [ ] `[BRAIN]` Add phase entry to `planning/03-history.md`

---

## ⏳ On Deck (Phase 1)
- `RSVPPlayer` — requestAnimationFrame loop, WPM/chunk controls, keyboard shortcuts
- URL scraper Route Handler + Readability.js + fallback
- Diagnostic calibration passage + `bottleneckDetector.ts`
- `POST /api/diagnostic` — behavioral analysis → ReadingProfile

---

## 🐛 Ad-Hoc / Side Quests
*(None — use `AD-HOC TASK:` prefix to add)*

---

## 🧪 UAT Checkpoints
*(No checkpoints yet — added when feature groups complete)*

---

## 🛑 Blocked / Waiting
- ADR-006 detail — anonymous diagnostic → account creation localStorage merge needs implementation plan before diagnostic UI is built. Not blocking Phase 0.

---

## 📝 Activity Log

| Date | Action |
|------|--------|
| 2026-03-10 | Agent brain v6 created. Phase 0 sprint initialized. |
| 2026-03-10 | Brain updated — PRD merged with Gemini brainstorm. RSVP engine, URL scraper, TL;DR, gamification, dynamic pacing added to scope. |
| 2026-03-21 | Brain rebuilt as v7. Synced to nextjs-supabase-v1.20. Added: AGENT.md with Project State machine, role files (BE/FE/Reviewer), numbered workflows 00-08 with Antigravity description frontmatter, UAT checkpoints, canonical sprint format, local-storage + multi-provider AI templates. |
