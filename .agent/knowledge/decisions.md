# 📋 Architecture Decision Records — Hakiread

---

## ADR-001: Diagnose Bottleneck Behaviorally, Not via Survey
**Date:** 2026-03-10
**Status:** Accepted

**Context:** We need to identify a user's reading bottleneck at onboarding. The obvious approach is a questionnaire ("do you hear words as you read?"). The problem: users self-report inaccurately — most subvocalizers don't know they're doing it.

**Decision:** Run a 3-minute behavioral calibration session. Observe actual reading behavior (speed variance, comprehension patterns, word-category hesitation) and infer the bottleneck from signals, not self-report.

**Reasoning:** Behavioral signals are more accurate than self-report for unconscious habits. The calibration session also doubles as the product demo — users experience the value before creating an account.

**Trade-offs:** More complex to build than a survey. Requires careful passage selection (narrative vs. technical) and a reliable signal → bottleneck mapping. Mitigated by: AI layer to handle edge cases in classification.

**Alternatives Considered:** Survey/questionnaire — fast to build, low accuracy. Eye-tracking — hardware-dependent, not viable for web.

---

## ADR-002: Always Show Comprehension Score Alongside Speed
**Date:** 2026-03-10
**Status:** Accepted

**Context:** Every speed reading product optimizes for WPM. This creates a perverse incentive: users push speed up, comprehension silently collapses, they feel like they're improving.

**Decision:** Speed (WPM) is never displayed without comprehension score alongside it. The UI enforces this at the component level — `SessionResult` requires both fields to render.

**Reasoning:** This is the core product integrity rule. Hakiread's value proposition is "read faster AND understand more." Showing speed alone would undermine that claim and harm users who chase a number.

**Trade-offs:** Slightly more complex UI. Some users will be frustrated when comprehension scores reveal they aren't retaining as much as they thought. This friction is intentional — it's honest.

**Alternatives Considered:** Show speed prominently, comprehension as secondary — rejected. Speed only — rejected entirely.

---

## ADR-003: Cache Comprehension Questions by Text Hash
**Date:** 2026-03-10
**Status:** Accepted

**Context:** Generating comprehension questions via LLM is the highest-cost AI operation in the product. If a user re-reads a document or two users read the same article, regenerating questions wastes credits.

**Decision:** Before calling the AI to generate questions, hash the source text (SHA-256), check `comprehension_sets` table for an existing set. If found, return cached questions. Only generate new questions on a cache miss.

**Reasoning:** LLM costs scale with usage. Caching is the single most impactful cost control for this feature. The same text should always produce acceptable questions — there's no need for variety on the same passage.

**Trade-offs:** Cached questions could theoretically be "learned" by a user who reads the same text repeatedly. Acceptable — the goal is comprehension training, not exam security. Cache can be invalidated manually if needed.

**Alternatives Considered:** Always regenerate — predictable but expensive. Per-user cache — more varied but loses the cost benefit of shared cache across users.

---

## ADR-004: Reading Profile Updates Every 14 Days (Not Every Session)
**Date:** 2026-03-10
**Status:** Accepted

**Context:** A user's Reading Profile (bottleneck diagnosis) should evolve as they improve. But updating it after every session creates noise — one bad session could incorrectly shift the training focus.

**Decision:** Reading Profile is recalculated every 14 days using a rolling average of the last 14 days of session data. Single sessions never override the profile.

**Reasoning:** 14 days provides enough data points to detect genuine improvement vs. daily variance. It also sets a clear expectation: "Your profile updates every 2 weeks" is a simple message users understand.

**Trade-offs:** A user who has a genuine breakthrough (e.g., consciously eliminates subvocalization overnight) won't see their training plan adjust for up to 14 days. Acceptable — training continues and will self-correct on the next update.

**Alternatives Considered:** Update every session — too noisy. Update on user request only — misses automatic drift detection.

---

## ADR-005: Next.js Route Handlers as the Only API Layer
**Date:** 2026-03-10
**Status:** Accepted

**Context:** Needed to decide: separate backend (Express, FastAPI) or Next.js Route Handlers only.

**Decision:** Next.js Route Handlers exclusively. No separate backend service for V1.

**Reasoning:** All server logic (AI calls, Supabase writes, document parsing) fits within Route Handler scope. Deploying to Vercel with no separate service simplifies infrastructure significantly. The 10s function timeout is acceptable — AI calls are the longest operation and should complete within 8-9s with streaming.

**Trade-offs:** Weekly progress cron jobs need a Vercel Cron configuration or Supabase Edge Function — not a standard Route Handler. Addressed per feature when needed.

**Alternatives Considered:** Separate Express backend — adds deployment complexity for no V1 benefit.

---

## ADR-006: Free Diagnostic Runs Before Account Creation
**Date:** 2026-03-10
**Status:** Accepted

**Context:** The diagnostic is the most compelling demo of the product. If we require account creation before running it, conversion will drop significantly.

**Decision:** The diagnostic runs fully without an account. Results (Reading Profile) are shown immediately. Account creation is prompted at the end: "Save your profile and start training."

**Reasoning:** "Show, don't tell" acquisition. A user who has just seen their personalized bottleneck diagnosis is far more motivated to create an account than a user who read a feature list. The diagnostic IS the marketing.

**Trade-offs:** Anonymous diagnostic sessions can't be linked to a user if they create an account later (unless we persist the result in localStorage and merge on account creation). This merge needs careful implementation.

**Alternatives Considered:** Require account first — lower conversion. Show a demo with fake results — dishonest, less compelling.

---

## ADR-007: requestAnimationFrame over setInterval for RSVP Loop
**Date:** 2026-03-10
**Status:** Accepted

**Context:** The RSVP word-advance loop needs to fire precisely at intervals as short as 50ms (1200 WPM). Two options: `setInterval` or `requestAnimationFrame`.

**Decision:** `requestAnimationFrame` exclusively. `setInterval` is prohibited for the word-advance loop.

**Reasoning:** At 1200 WPM, `setInterval` drifts by 5–15ms per tick under browser load — perceptible jitter that causes eye strain. `requestAnimationFrame` is frame-synchronized by the browser and drift-free. This is a non-negotiable performance constraint, not a style choice.

**Trade-offs:** Slightly more complex implementation (manual timestamp tracking vs. simple interval). Worth it unconditionally.

**Alternatives Considered:** `setInterval` — simpler but unacceptable jitter at high WPM. `setTimeout` recursive — same problem.

---

## ADR-008: Temperature 0.0 for Comprehension Questions and Summaries
**Date:** 2026-03-10
**Status:** Accepted

**Context:** The LLM hallucination risk for comprehension questions was identified as the highest-severity product risk: if AI generates questions whose answers aren't in the source text, users lose trust immediately.

**Decision:** Comprehension question generation and TL;DR summary generation always use temperature `0.0`. A strict system prompt is applied: "Only reference information explicitly present in the provided text. Do not infer, extrapolate, or add external knowledge."

**Reasoning:** Temperature `0.0` makes the model deterministic and maximally literal. Combined with the strict system prompt, it makes hallucination as unlikely as the model architecture allows. The cost — slightly less varied question phrasing — is irrelevant compared to the trust cost of hallucinated questions.

**Trade-offs:** Questions may feel slightly repetitive in phrasing across sessions on the same text. Mitigated by the text hash cache — same text returns same questions anyway, so variation doesn't apply.

**Alternatives Considered:** Temperature `0.2` with validation — rejected, hallucination risk still present. Post-generation fact-check — adds latency and cost for no guaranteed improvement.
