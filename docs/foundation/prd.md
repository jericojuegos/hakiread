# Hakiread — Product Specification

> **Goal:** An AI-powered reading coach that diagnoses *why* you read slowly, builds a personalized daily training plan to fix your specific bottleneck, and proves it's working through integrated comprehension measurement.
>
> **See also:** [Architecture](./architecture.md) · [Tech Stack](./tech-stack.md)

---

## 1) Product Summary

Hakiread is not a speed reading flasher. It's a coach. The core insight: slow reading is not one problem — it's four distinct problems that look identical from the outside. Generic RSVP tools help everyone a little. Hakiread diagnoses your specific bottleneck and targets it precisely — then proves it's working by tracking your speed/comprehension curve.

### The Four Bottlenecks Hakiread Diagnoses

| Bottleneck | What It Is | Impact | How AI Detects It |
|-----------|-----------|--------|-------------------|
| **Subvocalization** | "Saying words in your head" | Limits speed to ~250 WPM regardless of training | Speed plateau; rhythm disruption patterns under fast RSVP |
| **Regression** | Unconsciously re-reading already-seen text | Wastes 10–30% of reading time | Comprehension misses that don't correlate with vocabulary gaps |
| **Vocabulary Gaps** | Unknown words force the brain to decode | Sudden speed drops + comprehension failures | Speed drops sharply on specific word categories |
| **Topic Unfamiliarity** | No mental scaffolding for new information | Comprehension collapses on concept-heavy passages | Fails on technical passages, not narrative ones |

### Key Capabilities

**P0 — MVP**
- **RSVP engine** — 100–1,200 WPM, chunk size 1/2/3 words, Play/Pause/Rewind/FF, 60fps, keyboard shortcuts
- **Behavioral diagnostic** — 3-minute calibration infers bottleneck from behavior, not a survey
- **Reading Profile** — primary bottleneck, severity, baseline WPM, vocabulary percentile
- **Personalized daily training** — 5–10 min sessions targeting the specific bottleneck
- **Comprehension engine** — AI generates 3–5 questions (recall + inference + application) on any text read
- **Content importer** — text paste + URL scraper (Readability.js) + user library with completion tracking

**P1 — V1**
- **AI TL;DR summaries** — bulleted pre-read summary primes the brain before RSVP starts
- **Speed/comprehension curve** — personal chart tracking the optimal speed trade-off over time
- **Drift detection** — alerts when improvement stalls or a bad habit returns under pressure
- **Weekly progress reports** — WPM trend, comprehension trend, bottleneck update, next focus
- **Gamification** — daily streaks, XP system (Words Read × Comprehension Multiplier), personal badges
- **Document import** — PDF/EPUB upload, train on your own real materials
- **Vocabulary builder** — pre-loads words from the user's actual upcoming reading material

**P2 — V2**
- **Dynamic pacing** — AI automatically slows RSVP on dense vocabulary, speeds up on simple passages
- **Leaderboards** — top WPM + comprehension score rankings (social feature, deferred from V1)

### Non-Goals (V1)
- No leaderboards or social comparisons in V1 — Phase 3 only
- No mobile native app in V1 — responsive web only; React Native/Expo in Phase 3
- No audio/TTS reading mode
- No DRM-protected book imports (EPUB without DRM only)
- No custom fine-tuned models — hosted LLM APIs only
- No multiplayer or synchronous reading sessions

---

## 2) Success Metrics

| Goal | Target |
|------|--------|
| Speed improvement | 30%+ average WPM gain after 2 weeks of daily use |
| Comprehension standard | 75%+ average AI quiz passing score across all sessions |
| Daily retention | 40% DAU rate (aided by streaks + personalized coaching) |
| Diagnostic conversion | 50%+ of users who complete the free diagnostic create an account |

---

## 3) Users & Use Cases

### Primary Users
- **Students** — exam prep, textbooks, research papers — need speed + retention simultaneously
- **Professionals** — reports, documentation, emails — reading volume is a daily bottleneck
- **Filipino English readers** — strong secondary market where vocabulary pre-loading and topic priming are particularly high-value for non-native readers

### Core Use Case Flow
1. User runs **3-minute diagnostic** (no account needed) → sees their Reading Profile
2. Creates account to save profile and start daily training
3. Each day: opens Hakiread → optional TL;DR summary → today's personalized RSVP session → comprehension check → speed + comprehension score shown together
4. Weekly report surfaces progress, updated bottleneck ranking, next focus
5. After 2–4 weeks: measurable speed gain + comprehension maintained = retention hook

---

## 4) Delivery Phases

| Phase | Goal | Key Deliverables |
|-------|------|-----------------|
| **Phase 0** *(current)* | Foundation | Auth, DB schema, routing skeleton, AI client abstraction, RSVP engine scaffold |
| **Phase 1 MVP** | Core loop | RSVP engine, diagnostic, Reading Profile, daily training, comprehension engine, URL scraper, content library |
| **Phase 2 V1** | Polish + retention | TL;DR summaries, speed/comprehension curve, drift detection, weekly reports, document import, vocab builder, streaks + XP |
| **Phase 3** | Monetization + growth | Pro tier (Stripe), leaderboards, Teams/Schools dashboard, React Native mobile, lifetime offer, referral |

---

## 5) Known Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| LLM hallucinates questions not in the text | Temperature 0.0 + strict system prompt: "reference only the provided context window." Beta QA sample. |
| URL scraper fails on SPAs, paywalls, dynamic sites | Readability.js primary; robust fallback to manual paste; user informed when scrape fails |
| Diagnostic misidentifies bottleneck | Profile recalculated every 14 days; user can flag "this doesn't feel right" to trigger early re-diagnosis |
| Users push WPM, comprehension silently collapses | Speed never shown without comprehension alongside it — enforced at component type level |
| LLM costs spiral with heavy free usage | Question cache by text hash; max 3 AI ops/day on free tier; auth check before every AI call |
| 60fps RSVP fails on low-end devices | CSS animation over JS timers; requestAnimationFrame fallback; performance budget enforced |
| Retention drops after initial improvement plateau | Drift detection re-engages users; weekly report shows trend; training shifts to secondary bottleneck |
