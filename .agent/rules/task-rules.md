---
trigger: always_on
---

# Task Management Protocol

## 0. Role Prefix Convention

Every task in `01-active-sprint.md` activates a role. The role is determined by this order:

**Step 1 — Does the task have a prefix?** Prefix wins.

| Prefix | Role Activated |
|--------|---------------|
| `[ARCH]` | Architect — planning, scope, ADRs, roadmap |
| `[BE]` | Backend Engineer — when path is ambiguous |
| `[FE]` | Frontend Engineer — when path is ambiguous |
| `[BRAIN]` | Brain Keeper — all `.agent/` file updates |
| `[REVIEW]` | Reviewer — code review after a feature is complete |

**Step 2 — No prefix? Infer from the file path in the task.**

| Path in the task | Role |
|-----------------|------|
| `src/app/api/**` | Backend Engineer |
| `src/lib/**` | Backend Engineer |
| `mobile/lib/api/**` | Backend Engineer |
| `src/components/**` | Frontend Engineer |
| `src/app/**/page.tsx` | Frontend Engineer |
| `mobile/app/**` | Frontend Engineer |

**Step 3 — No prefix, no clear path?** The task is written wrong. Add a prefix before executing it.

### Rules for writing tasks

- Tasks that build a file → write the exact file path. No prefix needed.
  ```
  ✅ - [ ] `src/lib/image/compress.ts` — HEIC→JPEG + resize to 1600px
  ❌ - [ ] Build the image compressor
  ```
- Tasks that are planning or decisions → use `[ARCH]`
  ```
  ✅ - [ARCH] Review Phase 1 scope before sprint begins
  ✅ - [ARCH] Write ADR-007 — HEIC conversion approach
  ```
- Tasks that update the brain → use `[BRAIN]`
  ```
  ✅ - [BRAIN] Update decisions.md with ADR-007
  ✅ - [BRAIN] Mark Phase 0 complete, set up Phase 1 sprint
  ```
- Tasks that review completed work → use `[REVIEW]`
  ```
  ✅ - [REVIEW] Review POST /api/extract — credit guard + extraction order
  ```

### When to add a new role

> Add a role only when a new human joins with a distinct domain, or when an existing role file exceeds 150 lines. Never add a role to represent a checklist or a workflow.

QA, Security, DevOps, and Database are not roles in this project — they are checklists inside the Reviewer role, constraints inside the Backend Engineer role, and workflow steps. Do not create role files for them.

The next role to add, if needed, is **Mobile Engineer** — when the `mobile/` codebase grows large enough that Frontend Engineer can no longer absorb it cleanly (Expo-specific patterns, native modules, push notifications, deep linking). Not before.

### One role per session
Activate one role per work session. If today's sprint has tasks across multiple roles (Backend Engineer + Brain Keeper), finish the Backend Engineer task first, then explicitly switch roles before the Brain Keeper task.

---

## 1. Task Updating Syntax
- **Never** mark a parent task as `[x]` unless ALL sub-tasks are complete.
- **Skipped/Deferred:** Use `[-]` or append `(Deferred)` to the text. Keep the box unchecked `[ ]`.
- **Sync Timing:** Update `.agent/planning/01-active-sprint.md` *immediately* after verifying a step.

## 2. Partial Completion (The "Half-Done" Rule)
If a task involves full-stack work (Backend + UI) and you only complete one side:
1.  **Do NOT** check the main item.
2.  **Explicitly break it down**:
    - `[x] Backend Logic`
    - `[ ] Frontend UI`

## 3. Verification Requirement (Definition of Done)
A task is considered **complete** `[x]` ONLY when:
1.  The implementation exists in the codebase.
2.  The expected behavior is **verified** (manual test, API test, or unit test).
3.  **Evidence:** If asked, you must be able to state *how* it was verified.
4.  **UAT Checklist:** At end-of-sprint, generate a UAT checklist per `workflows/uat-checklist.md`. The agent handles Levels 1–2 (automated tests + checklist); the user handles Level 3 (judgment).

## 4. Moving & Refinement (The "Drift" Protocol)
If a task cannot be completed in the current Sprint/Phase:
1.  **Create a New Section** in `01-active-sprint.md` (e.g., "## Sprint 2: UI Polish").
2.  **Move the Task:** Cut and paste the task to the new section.
3.  **Leave a Marker:** In the original location, mark it as `[->]` and write `(Moved to Sprint 2)`.
    - *Example:* `[->] Create Wizard UI (Moved to Sprint 2)`

## 5. Scope Creep & Discovery
- **Blocked Tasks:** Mark as `[!]` and add reason.
    - *Example:* `[!] Payment API (Blocked: waiting for credentials)`
- **New Discoveries:** If you discover new work that is not in the plan:
    1.  **Do NOT** secretly do it.
    2.  **Add it** to the `## 🐛 Ad-Hoc / Side Quests` section of `01-active-sprint.md` ONLY if the user explicitly uses the phrase **"AD-HOC TASK:"** or asks for a small UI/config tweak.
    3.  **STOP & ASK** if the task implies **high complexity** (e.g., would take a human >30 mins, or touches >5 files).

## 6. Source of Truth
- **Active Tasks:** `.agent/planning/01-active-sprint.md` is the Living Document.
- **Long Term:** `.agent/planning/00-roadmap.md` is the Vision.
- **Conflict:** If `Active Tasks` contradicts `Roadmap`, `Active Tasks` wins for *today*, but flag it for *tomorrow*.
