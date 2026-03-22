# 🏃 Active Sprint — HakiRead

> Sprint Focus: Phase 1 (Sprint 2) MVP — Comprehension Engine, Daily Training Sessions, and Library Management.

---

## 🔄 Current Tasks — Phase 1 (Sprint 2)

### Content Importer & Library
- [x] `[FE]` Text paste → immediate RSVP session (UI + state)
- [x] `[FE]` User library page (`/library`) — saved articles + completion percentage
- [x] `[BE]` Reading position remembered per document (Supabase sync)

### Comprehension Engine
- [x] `[BE]` `src/lib/ai/prompts/comprehension.ts` — multi-level question prompt
- [x] `[BE]` `POST /api/comprehension` — generate + cache questions by SHA-256 text hash
- [x] `[FE]` Comprehension UI — question display, multiple choice, score reveal
- [x] `[FE]` Speed always paired with comprehension score in all result displays

### Daily Training Sessions
- [x] `[BE]` `src/lib/ai/prompts/sessionBuilder.ts` — personalized session from ReadingProfile
- [x] `[BE]` `POST /api/session/generate` — build today's session from profile
- [x] `[BE]` `POST /api/session/complete` — save results + calculate XP
- [x] `[BE]` XP formula: `wordsRead × comprehension_score × SESSION_XP_FACTOR`
- [x] `[FE]` Dashboard (`/dashboard`) — "Today's Session", streak counter, XP display

---

## ⏳ On Deck (Phase 2)
*(Features to be planned after Phase 1)*

---

## 🐛 Ad-Hoc / Side Quests
- [x] Fix RSVPPlayer jumping/resizing by giving the text window a fixed height and hidden overflow
- [x] Fix RSVPPlayer width adjustment by setting a rigid desktop width of 768px

---

## 🧪 UAT Checkpoints
- [x] `Comprehension Engine` feature group complete. `/uat-checklist` passed.

---

## 🛑 Blocked / Waiting
- ADR-006 detail — anonymous diagnostic → account creation localStorage merge needs implementation plan.

---

## 📝 Activity Log

| Date | Action |
|------|--------|
| 2026-03-21 | Phase 1 (Sprint 1 - Core MVP Engines) archived to history. Commencing Sprint 2: Comprehension & Content. |
| 2026-03-21 | Text Paste -> RSVP Session (`QuickRead` component) implemented and wired to Dashboard. |
| 2026-03-21 | User library page (`/library`) UI grid and empty states implemented. |
| 2026-03-21 | Reading position sync — DB migration, Supabase server client, and `/api/progress` route completed. |
| 2026-03-21 | Comprehension AI prompt (Recall/Inference/Synthesis) built at `src/lib/ai/prompts/comprehension.ts`. |
| 2026-03-21 | `POST /api/comprehension` endpoint with SHA-256 cache-first lookup and AI generation completed. |
| 2026-03-21 | Comprehension Quiz UI (`ComprehensionQuiz.tsx`) built and integrated into Dashboard flow. |
| 2026-03-21 | WPM speed successfully threaded into Comprehension results UI. Comprehension Engine feature group complete. |
| 2026-03-22 | Comprehension Engine UAT (Level 1, 2, 3) successfully passed. |
| 2026-03-22 | \`sessionBuilder.ts\` prompt created — translates ReadingProfile into localized daily training texts and parameters. |
| 2026-03-22 | \`POST /api/session/generate\` route handler built to stream daily personalized reading sessions with Gemini. |
| 2026-03-22 | Added \`xp\`, \`streak\`, \`last_session_at\` to \`reading_profiles\` DB schema via MCP migration tool. |
| 2026-03-22 | \`POST /api/session/complete\` route handler implemented to safely persist session results and evaluate XP math. |
| 2026-03-22 | Dashboard UI built — displays XP, streak, and entry to Daily Session (DailySessionFlow frontend complete). Daily Training Sessions feature group complete. |
