# 🗺️ Hakiread — Roadmap

> **Vision:** The first reading coach that diagnoses *why* you read slowly and proves it's working through comprehension measurement.
> **North Star:** Users finish their first week knowing their exact bottleneck, seeing measurable WPM improvement, with comprehension scores proving they actually understood what they read.

## 📌 Legend
- `[ ]` Pending · `[>]` Current Focus · `[x]` Completed · `[-]` Deferred · `[!]` Blocked

---

## [>] Phase 0: Foundation
*Goal: Stable scaffold with auth, DB schema, and routing — ready to build features on.*

- [ ] Initialize Next.js 14 (App Router) with TypeScript + Tailwind using `pnpm`
- [ ] Set up Supabase project + connect environment variables
- [ ] Configure Supabase Auth (email/password)
- [ ] Create all DB tables with RLS policies enabled
- [ ] Implement `lib/ai/client.ts` abstraction (Anthropic default, OpenAI adapter)
- [ ] Scaffold all Route Handlers (return 501 until implemented)
- [ ] Implement base routing: `/diagnostic`, `/dashboard`, `/session/[id]`, `/profile`, `/library`
- [ ] Middleware: Supabase session refresh on all `(app)` routes
- [ ] `src/lib/constants.ts` — all WPM limits, thresholds, and config values defined

---

## Phase 1: MVP — The Core Loop
*Goal: A user can run the diagnostic, get a Reading Profile, do a daily training session, read content via RSVP, and see their comprehension score.*

### RSVP Engine
- [x] `RSVPPlayer` Client Component — `requestAnimationFrame` loop (never setInterval)
- [x] WPM control: 100–1200, steps of 10 and 100
- [x] Chunk size control: 1, 2, 3 words per flash
- [x] Play / Pause / Rewind (one sentence back) / Fast Forward (one sentence ahead)
- [x] Keyboard shortcuts: Space, ←, →, ↑, ↓
- [x] Progress indicator: position + estimated time remaining
- [x] 60fps performance validation across target devices

### Content Importer & Library
- [x] Text paste → immediate RSVP session
- [x] `POST /api/documents/scrape` — Readability.js URL scraper
- [x] Scrape failure → graceful `scrape_failed` response + manual paste fallback
- [x] User library page — saved articles + completion percentage
- [x] Reading position remembered per document

### Diagnostic Engine
- [x] `lib/reading/bottleneckDetector.ts` — behavioral signal → bottleneck classification
- [x] `lib/ai/prompts/diagnostic.ts` — AI profile generation (temperature 0.2)
- [x] `POST /api/diagnostic` — full diagnostic flow → upsert `reading_profiles`
- [x] Diagnostic UI — calibration passage + comprehension micro-check
- [x] Reading Profile display — bottleneck card, baseline WPM, vocabulary percentile
- [ ] Anonymous diagnostic → localStorage → account creation merge flow

### Comprehension Engine
- [x] `lib/ai/prompts/comprehension.ts` — multi-level question prompt (temperature 0.0, context-only)
- [x] `POST /api/comprehension` — generate + cache questions by SHA-256 text hash
- [x] Comprehension UI — question display, multiple choice, score reveal
- [x] Speed always paired with comprehension score in all result displays

### Daily Training Sessions
- [x] `lib/ai/prompts/sessionBuilder.ts` — personalized session from ReadingProfile (temperature 0.4)
- [x] `POST /api/session/generate` — build today's session from profile
- [x] `POST /api/session/complete` — save results + calculate XP
- [x] XP formula: `wordsRead × comprehension_score × SESSION_XP_FACTOR`
- [x] Dashboard — "Today's Session", streak counter, XP display

---

## Phase 2: V1 — Polish + Retention
*Goal: Users come back daily. Drift detection keeps them engaged when improvement stalls.*

### TL;DR Summaries
- [ ] `lib/ai/prompts/summary.ts` — bulleted summary prompt (temperature 0.0, context-only)
- [ ] `POST /api/summary` — generate + cache alongside comprehension questions
- [ ] SummaryCard shown before "Start Reading" button — skippable

### Progress & Drift Detection
- [ ] `lib/reading/curveAnalyzer.ts` — plateau/drift/bottleneck-shift detection
- [ ] `lib/ai/prompts/progressAnalysis.ts` — coaching summary prompt (temperature 0.4)
- [ ] Speed/comprehension curve chart — last 30 days
- [ ] Weekly cron → `progress_snapshots` + notification
- [ ] Weekly report page

### Document Import
- [ ] PDF/EPUB upload → text extraction → Supabase Storage
- [ ] Train on user's own documents (work reports, textbooks, articles)

### Vocabulary Builder
- [ ] Pre-session vocab scan — AI identifies likely unknown words from upcoming text
- [ ] 2-minute flashcard warm-up before reading session
- [ ] Personal word list per user

### Gamification
- [ ] Daily streak with grace day (one miss per week allowed)
- [ ] Personal achievement badges: first 300/500 WPM, 14-day streak, perfect quiz
- [ ] XP history chart

---

## Phase 3: Monetization + Growth
*Goal: Sustainable revenue. Teams, schools, and mobile as growth channels.*

- [ ] Free tier enforcement — `MAX_AI_CALLS_FREE_TIER_DAILY` gating
- [ ] Pro tier paywall (Stripe integration)
- [ ] Lifetime access offer (launch promotion)
- [ ] Leaderboards — top WPM + comprehension score, weekly reset
- [ ] Teams/Schools dashboard — admin view, assign reading material, export comprehension scores
- [ ] React Native / Expo mobile app
- [ ] Referral mechanic — invite a friend, both get 7 days Pro

---

## Phase 4: V2 — Advanced Intelligence

- [ ] Dynamic pacing — AI slows RSVP on dense vocabulary, speeds up on simple passages
- [ ] `POST /api/session/pace` — sentence-level complexity scoring + pacing map
- [ ] Per-sentence WPM modifier applied in RSVPPlayer during playback

---

## 🧊 Icebox
- Audio/TTS hybrid reading mode
- Eye-tracking via mobile camera
- Custom fine-tuned model on user's personal reading history
- Multiplayer synchronous reading sessions
