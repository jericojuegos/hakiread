# 🏃 Active Sprint — HakiRead

> Sprint Focus: Phase 1 (Sprint 2) MVP — Comprehension Engine, Daily Training Sessions, and Library Management.

---

## 🔄 Current Tasks — Phase 1 (Sprint 2)

### Content Importer & Library
- [x] `[FE]` Text paste → immediate RSVP session (UI + state)
- [>] `[FE]` User library page (`/library`) — saved articles + completion percentage
- [ ] `[BE]` Reading position remembered per document (Supabase sync)

### Comprehension Engine
- [ ] `[BE]` `src/lib/ai/prompts/comprehension.ts` — multi-level question prompt
- [ ] `[BE]` `POST /api/comprehension` — generate + cache questions by SHA-256 text hash
- [ ] `[FE]` Comprehension UI — question display, multiple choice, score reveal
- [ ] `[FE]` Speed always paired with comprehension score in all result displays

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
