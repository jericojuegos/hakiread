# 🏃 Active Sprint — HakiRead

> Sprint Focus: Phase 2 (Sprint 3) V1 — Polish & Retention (TL;DR Summaries & Progress Tracking).

---

## 🔄 Current Tasks — Phase 2 (Sprint 3)

### TL;DR Summaries
- [ ] `[BE]` `src/lib/ai/prompts/summary.ts` — bulleted summary prompt (temperature 0.0, context-only)
- [ ] `[BE]` `POST /api/summary` — generate + cache alongside comprehension questions
- [ ] `[FE]` SummaryCard shown before "Start Reading" button — skippable

### Progress & Drift Detection
- [ ] `[BE]` `src/lib/reading/curveAnalyzer.ts` — plateau/drift/bottleneck-shift detection
- [ ] `[BE]` `src/lib/ai/prompts/progressAnalysis.ts` — coaching summary prompt (temperature 0.4)
- [ ] `[FE]` Speed/comprehension curve chart — last 30 days
- [ ] `[BE]` Weekly cron → `progress_snapshots` + notification
- [ ] `[FE]` Weekly report page

---

## ⏳ On Deck (Phase 2 - Continued)
*(Gamification, Document Import, Vocabulary Builder)*

---

## 🐛 Ad-Hoc / Side Quests
- [>] `[FE/BE]` Build Login and Register UI (Supabase Auth) to remove Dev Bypasses.

---

## 🧪 UAT Checkpoints
*(None yet)*

---

## 🛑 Blocked / Waiting
- ADR-006 detail — anonymous diagnostic → account creation localStorage merge needs implementation plan.

---

## 📝 Activity Log

| Date | Action |
|------|--------|
| 2026-03-22 | Phase 1 MVP archived to history. Commencing Phase 2 (Sprint 3): Polish & Retention. |
