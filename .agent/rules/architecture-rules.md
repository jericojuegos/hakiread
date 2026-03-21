---
trigger: always_on
---

# Architecture Rules

---

## Pattern: Pragmatic Feature-Driven Architecture (FDA)

This project uses FDA — business logic grouped by domain, pages as thin wrappers, lib as pure plumbing.

### Folder Responsibilities

| Folder | What Lives Here | What Does NOT Live Here |
|--------|----------------|------------------------|
| `app/` | Routes, pages (wrappers only), Route Handlers | Business logic, hooks, components |
| `features/[domain]/` | Domain components, hooks, domain types | Generic UI, server clients, AI calls |
| `lib/` | Supabase clients, AI prompts, image processing, export | JSX, React components, hooks |
| `shared/ui/` | Generic stateless UI (Button, Input, Modal) | Data fetching, Supabase calls, business logic |
| `shared/types/` | DB-generated types, global interfaces | Business logic, utility functions |

### Layer Boundaries (read by 04-task-loop.md Step 0b Q3)

| From layer | Can import | Cannot import |
|-----------|-----------|--------------|
| `app/**/page.tsx` | ONE feature component only | Multiple features, lib directly, shared/types logic |
| `features/[a]/` | `shared/` · `lib/` · own files | `features/[b]/` — any other feature |
| `shared/ui/` | Nothing project-specific | features/ · lib/ · Supabase · AI SDK |
| `shared/types/` | External type packages | Business logic, feature code |
| `lib/` | Server packages, Supabase server client | JSX · React · hooks · Client Components |
| `app/api/**/route.ts` | `lib/` · `shared/types/` | Client Components · features/ UI |

### The Three Golden Rules

**Rule 1 — Features don't import from other features.**
`features/receipts/` cannot import from `features/clients/`.
If two features need the same thing → move it to `shared/`.

**Rule 2 — Pages are wrappers only.**
```typescript
// ✅ Correct page.tsx
import { ReceiptDashboard } from '@/features/receipts/components/ReceiptDashboard';
export default function Page() { return <ReceiptDashboard />; }

// ❌ Wrong — logic in page.tsx
export default function Page() {
  const [receipts, setReceipts] = useState([]);
  useEffect(() => { fetch('/api/receipts')... }, []);
  return <div>{receipts.map(...)}</div>;
}
```

**Rule 3 — `lib/` has no JSX.**
If a file in `lib/` contains a React component → move it to `features/` or `shared/ui/`.
`lib/` is server-side plumbing only: Supabase clients, AI calls, image processing, PDF generation.

### FDA Quick Violation Checklist (run before marking any task `[x]`)

- [ ] `features/[a]/` imports from `features/[b]/` → move shared code to `shared/`
- [ ] Logic in `app/**/page.tsx` → extract to feature component
- [ ] JSX or React hooks in `src/lib/` → move to `features/` or `shared/ui/`
- [ ] `fs`, AI SDK, or service role key in a Client Component → move to Route Handler
- [ ] New component in `shared/ui/` used by only one feature → move to `features/[domain]/`
- [ ] Route Handler imports a Client Component or feature UI → wrong direction, fix import

> This checklist is pattern-specific to FDA.
> For other patterns (WP-OOP, Clean Architecture), read that master brain's `rules/architecture-rules.md`.

---

## Universal Rules (Every Project)

### 0. Local-First Before Database
For local-only single-user tools — use the file system before reaching for a database.
Individual JSON files per record + an index.json for metadata handles thousands of
records with zero setup overhead.

```
Use local file system when:       Use Supabase when:
─ Local-only tool (no cloud)      ─ Multi-user or cloud sync needed
─ Single user                     ─ AI features need vector search
─ <10,000 records                 ─ Complex relational queries needed
─ No complex queries needed       ─ Real-time subscriptions needed
```

→ Template: `templates/local-storage.ts.template`

### 1. All AI Calls Are Server-Side Only
No AI SDK imports in Client Components, mobile components, or any client-side code.
All AI calls go through Route Handlers.

### 2. Mobile Mutations Go Through the Web API
Mobile reads Supabase directly for non-sensitive reads.
All writes and AI operations go through the project's Next.js Route Handlers with JWT auth.

### 3. Service Role Key Is Server-Only
`SUPABASE_SERVICE_ROLE_KEY` never in `NEXT_PUBLIC_` variables or mobile env.
Any table requiring service role access uses `import 'server-only'`.

### 4. All New Tables Have RLS
Every Supabase table created must have RLS enabled with explicit policies.
Tables that should never be client-readable use `USING (false)`.

### 5. Secrets Never Leave the Server
OAuth tokens, API keys, webhook secrets — never returned in any API response.
Never logged. Read server-side only.

### 6. One Active Task at a Time
Only one `[>]` task in `planning/01-active-sprint.md` at any time.
Finish and verify before starting the next.

---

## Project-Specific Rules

→ Read `knowledge/architecture.md` → "Architecture Rules" or "Critical Constraints" section.
These are the rules specific to this project's domain logic and data flows.

---

## Change Impact Reference

| Change Type | Risk | Action Before Changing |
|-------------|------|----------------------|
| Auth flow | 🔴 Critical | Test full login + session refresh |
| RLS policies | 🔴 Critical | Verify with anon client after change |
| Payment / credit logic | 🔴 Critical | Test deduction + failure paths |
| Storage bucket permissions | 🔴 Critical | Verify private access after change |
| AI prompt | 🟡 Medium | Test with representative sample inputs |
| DB schema migration | 🟡 Medium | Verify existing data is unaffected |
| API response shape | 🟡 Medium | Check all consumers of the endpoint |
