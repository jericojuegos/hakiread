# 🧠 HakiRead — Agent Brain (`AGENTS.md`)

**Project:** HakiRead — AI-Powered Personalized Reading Coach
**Context:** Personal / Standalone
**Web Stack:** Next.js 16+ App Router · React 19 · TypeScript · Tailwind CSS v4 · Supabase (`@supabase/ssr`) · Vercel AI SDK (Anthropic / Google AI)
**Mobile Stack:** N/A (Phase 1–2) — React Native / Expo planned for Phase 3
**Architecture Pattern:** Pragmatic Feature-Driven Architecture (FDA)
**Master Brain:** `nextjs-supabase`
**Last synced:** `nextjs-supabase-v1.0` - 2026-11-10

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 🚦 Project State

**Stage:** `active` (Phase 2: V1 Polish & Retention — Auth, TL;DR Summaries & Progress/Drift Detection)
**Stage last updated:** `2026-11-09`

| Stage | Meaning | Next Action / Skill |
|-------|---------|---------------------|
| `active` | Feature wave development in progress | **`/next`** → **`/spec`** → **`/build`** → **`/verify`** → **`/ship`** |

---

## ⚡ Deterministic Verification Commands

Run these commands after every task before marking `[x]`:
- **Typecheck (Every task):** `pnpm tsc --noEmit`
- **Full Build (Feature completion / `/verify`):** `pnpm build`
- **Lint:** `pnpm lint`

---

## 🗺️ Context Map (`docs/INDEX.md`) & Skills (`.agents/skills/`)

> **Progressive Disclosure Rule:** Do not read all docs at once. Read [`docs/INDEX.md`](docs/INDEX.md) or use this quick table:

| Question / Action | File or Skill |
|-------------------|---------------|
| What should I work on next? | **`/next`** ([`.agents/skills/next/SKILL.md`](.agents/skills/next/SKILL.md)) |
| What is the phased roadmap & current sprint status? | [`docs/planning/roadmap.md`](docs/planning/roadmap.md) & [`docs/planning/01-active-sprint.md`](docs/planning/01-active-sprint.md) |
| Create or expand a feature spec (`requirements`, `design`, `tasks`, `uat`) | **`/spec`** ([`.agents/skills/spec/SKILL.md`](.agents/skills/spec/SKILL.md)) |
| Build Phase 0 scaffold or execute tasks/waves for a feature | **`/build`** ([`.agents/skills/build/SKILL.md`](.agents/skills/build/SKILL.md)) |
| Verify build, EARS acceptance criteria, and stack Hard Failures | **`/verify`** ([`.agents/skills/verify/SKILL.md`](.agents/skills/verify/SKILL.md)) |
| Ship completed feature, update `roadmap.md`, and generate PR summary | **`/ship`** ([`.agents/skills/ship/SKILL.md`](.agents/skills/ship/SKILL.md)) |
| What are we building overall & why? | [`docs/foundation/prd.md`](docs/foundation/prd.md) |
| Where do files live & what is the DB schema? | [`docs/foundation/architecture.md`](docs/foundation/architecture.md) |
| What packages, constants & env vars exist? | [`docs/foundation/tech-stack.md`](docs/foundation/tech-stack.md) |
| Why was X decided this way? | [`docs/foundation/decisions.md`](docs/foundation/decisions.md) |
| How do we execute tasks, waves & cross-model reviews? | [`.agents/rules/execution-protocol.md`](.agents/rules/execution-protocol.md) |
| What are the FDA layer & security rules? | [`.agents/rules/stack-rules.md`](.agents/rules/stack-rules.md) |

---

## ⚠️ Critical Constraints — Never Violate

- **All AI calls are server-side only.** No AI SDK imports in Client Components or hooks. Route Handlers only.
- **System prompts and prompt strings never leave the server.** Never returned in any API response.
- **All prompts in `src/lib/ai/prompts/`.** Never inline prompt strings in Route Handlers or services.
- **Supabase RLS required on all tables.** No table without a policy. `reading_profiles` uses `USING (auth.uid() = user_id)`.
- **`SUPABASE_SERVICE_ROLE_KEY` is server-only.** Never in `NEXT_PUBLIC_` vars or client code.
- **Reading Profile is the single source of truth.** All training session generation derives from it — never hardcode generic exercises.
- **Speed score NEVER shown without comprehension score alongside it.** Enforced at component level — not just convention.
- **Comprehension questions cached by text hash.** Never regenerate for the same passage. Check `comprehension_sets` before any AI call.
- **`AI_PROVIDER` env var selects provider.** Anthropic (prod) / Google AI (dev, free tier).
- **`requestAnimationFrame` for RSVP loop — never `setInterval`.** At 1200 WPM a word flashes every 50ms. `setInterval` drifts; `rAF` does not.
- **Free tier AI cap enforced server-side.** Max 3 AI operations/day on free tier. Check before every AI call.

---

## 🛡️ Code Review & Security Audit Gate (All AI Models)

When asked to review code, audit security, or evaluate another AI model's findings (even without invoking `/verify`):
1. **Contract First:** Read `docs/foundation/decisions.md`, `.agents/rules/stack-rules.md`, and the active feature's `docs/specs/<NN-feature-slug>/{requirements,design}.md` before flagging issues. Never contradict settled decisions or Non-Goals.
2. **Evidence-Only Severity Tiers (No Ping-Pong):** Only report **`[P0 — Blocker]`** (provable bug, auth/RLS/security exploit, broken EARS requirement, or `stack-rules.md` Hard Failure) and **`[P1 — Defect]`** (unhandled `design.md` Error Matrix case or race condition) with exact `file:line` and a concrete trigger path. Suppress **`[P2 — Style/Nitpick]`** opinions.
3. **Arbiter Mode for External Reviews:** When given findings from another developer's AI review, classify each item against `design.md` + `stack-rules.md` into **`ACCEPT (P0/P1)`** vs. **`REJECT (P2 / Settled Tradeoff / Guarded Upstream)`** before modifying any code.

---

## 🚫 Anti-Hallucination List (Out of Scope for Current Phase)

Do NOT build in Phase 2 (V1):
- No leaderboards or social comparisons (Phase 3)
- No mobile native app (Phase 3 — React Native/Expo)
- No audio/text-to-speech reading mode (Icebox)
- No DRM-protected book imports (EPUB without DRM only)
- No custom fine-tuned models — hosted LLM APIs only
- No multiplayer or synchronous reading sessions
- No dynamic sentence-level pacing (Phase 4)
