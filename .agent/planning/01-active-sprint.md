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
- [>] `[FE]` Speed always paired with comprehension score in all result displays

### Daily Training Sessions
- [ ] `[BE]` `src/lib/ai/prompts/sessionBuilder.ts` — personalized session from ReadingProfile
- [ ] `[BE]` `POST /api/session/generate` — build today's session from profile
- [ ] `[BE]` `POST /api/session/complete` — save results + calculate XP
- [ ] `[BE]` XP formula: `wordsRead × comprehension_score × SESSION_XP_FACTOR`
- [ ] `[FE]` Dashboard (`/dashboard`) — "Today's Session", streak counter, XP display

---

## ⏳ On Deck (Phase 2)
*(Features to be planned after Phase 1)*

---

## 🐛 Ad-Hoc / Side Quests
*(None — use `AD-HOC TASK:` prefix to add)*

---

## 🧪 UAT Checkpoints
*(No checkpoints yet — added when feature groups complete)*

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
