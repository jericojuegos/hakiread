# 🧠 HakiRead — Agent Brain

**Project:** HakiRead — AI-powered personalized reading coach
**Web:** Next.js 14+ App Router · TypeScript · Supabase · Vercel AI SDK (multi-provider)
**Mobile:** N/A (Phase 1) — React Native / Expo Phase 3
**Architecture Pattern:** Pragmatic Feature-Driven Architecture (FDA)
**Master Brain:** nextjs-supabase
**Last synced:** nextjs-supabase-v1.20 — 2026-03-21

---

## 🚦 Project State

**Stage:** `scaffolded`
**Stage last updated:** `2026-03-21` by `02-scaffold.md`

| Stage | Meaning | Next Workflow |
|-------|---------|--------------|
| `not-started` | Brain exists, nothing else done | `01-init.md` |
| `initialized` | Init complete, scope locked, deps documented | `02-scaffold.md` |
| `scaffolded` | Both codebases running, DB deployed | `03-session-start.md` |
| `active` | Normal development in progress | `03-session-start.md` |

> ⚠️ Every workflow checks this field at Step 0 before doing anything.
> When a workflow completes, it updates this field and the last-updated line.

---

## Navigation

| Question | File |
|----------|------|
| What are we building? | `knowledge/spec.md` |
| How is it structured? | `knowledge/architecture.md` |
| What tools do we use? | `knowledge/tech-stack.md` |
| Why was X built this way? | `knowledge/decisions.md` |
| What are we doing right now? | `planning/01-active-sprint.md` |
| What's the full plan? | `planning/00-roadmap.md` |
| What are the coding rules? | `rules/coding-standards.md` |
| What are the structural rules? | `rules/architecture-rules.md` |
| How do I assess a risky change? | `workflows/change-impact.md` |
| Who does what in this project? | `roles/` |

---

## Role Lookup — Who Does What

| File Pattern | Role | Role File |
|-------------|------|-----------|
| `src/app/api/**` | Backend Engineer | `roles/backend-engineer.md` |
| `src/lib/**` | Backend Engineer | `roles/backend-engineer.md` |
| `src/features/**` | Frontend Engineer | `roles/frontend-engineer.md` |
| `src/app/**/page.tsx` | Frontend Engineer | `roles/frontend-engineer.md` |
| `src/shared/**` | Frontend Engineer | `roles/frontend-engineer.md` |
| `supabase/functions/**` | Backend Engineer | `roles/backend-engineer.md` |
| `.agent/planning/**` | Architect + Brain Keeper | `roles/architect.md` + `roles/brain-keeper.md` |
| `.agent/knowledge/**` | Architect / Backend Engineer | depends on section |
| `.agent/roles/**` | Brain Keeper | `roles/brain-keeper.md` |
| `.agent/workflows/**` | Brain Keeper | `roles/brain-keeper.md` |
| `.agent/rules/**` | Brain Keeper | `roles/brain-keeper.md` |

**Prefix overrides path:**

| Prefix | Role |
|--------|------|
| `[ARCH]` | Architect |
| `[BE]` | Backend Engineer |
| `[FE]` | Frontend Engineer |
| `[BRAIN]` | Brain Keeper |
| `[REVIEW]` | Reviewer |

---

## Development Workflows

| When | Workflow |
|------|---------|
| Returning after a break | `workflows/00-return.md` |
| Brand new project, zero code | `workflows/01-init.md` |
| First time writing code | `workflows/02-scaffold.md` |
| Starting any work session | `workflows/03-session-start.md` |
| Executing a task | `workflows/04-task-loop.md` |
| Just finished a task | `workflows/05-task-complete.md` |
| Ending a session | `workflows/06-session-end.md` |
| All sprint tasks are `[x]` | `workflows/07-phase-complete.md` |
| Something is broken | `workflows/08-debug.md` |
| Feature group FE + BE both `[x]` | `workflows/uat-checklist.md` |
| Changing shared code / schema / types | `workflows/change-impact.md` |
| Agent behaving unexpectedly / sprint drift | `workflows/context-check.md` |

---

## Agent Startup Sequence

Every session, in this exact order:

1. Read `planning/01-active-sprint.md` — what is the current task?
2. Identify the role — file path lookup table above, or prefix on the task
3. Read that role's file in `roles/`
4. Read `rules/` — hard constraints
5. Read relevant `knowledge/` section for today's task
6. Check `workflows/` — which workflow applies?
7. Execute

**State the role out loud before writing any code:**
> *"Today's task is `[file path]`. This matches `[pattern]` → [Role]. Loading `roles/[role].md`."*

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
- **AI_PROVIDER env var selects provider.** Anthropic (prod) / Google AI (dev, free tier). See `templates/ai-client.ts.template`.
- **requestAnimationFrame for RSVP loop — never setInterval.** At 1200 WPM a word flashes every 50ms. setInterval drifts; rAF does not.
- **Free tier AI cap enforced server-side.** Max 3 AI operations/day on free tier. Check before every AI call.

---

## Anti-Hallucination List

Do NOT build in Phase 1 (MVP):

- No leaderboards or social comparisons (Phase 3)
- No mobile native app (Phase 3 — React Native/Expo)
- No audio/text-to-speech reading mode
- No DRM-protected book imports (EPUB without DRM only)
- No custom fine-tuned models — hosted LLM APIs only
- No multiplayer or synchronous reading sessions
- No dynamic pacing (Phase 2)
- No weekly progress reports (Phase 2)
- No drift detection (Phase 2)
- No gamification/XP system (Phase 2)
- No document import PDF/EPUB (Phase 2)
- No vocabulary builder (Phase 2)
