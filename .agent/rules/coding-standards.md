---
trigger: always_on
---

# Coding Standards

---

## Style Rules

| Rule | Value |
|------|-------|
| Semicolons | Required |
| Quotes | Single quotes |
| Trailing commas | Always |
| Indent | 2 spaces |
| `any` type | Forbidden |
| `console.log` | Not in committed code |
| Strict mode | `"strict": true` in tsconfig |

---

## Universal Patterns

### Route Handler structure
```typescript
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const InputSchema = z.object({ /* ... */ });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  // logic
}
```

### Supabase server client — always use in Route Handlers
```typescript
import 'server-only';
import { createServerClient } from '@supabase/ssr';
// Never use browser client in Route Handlers
```

### Supabase admin client — service role operations only
```typescript
import 'server-only';
// Used for operations that bypass RLS
// Never expose SUPABASE_SERVICE_ROLE_KEY to client
```

### AI prompt — always external, never inline
```typescript
// ✅ Correct
import { myPrompt } from '@/lib/ai/prompts/myPrompt';

// ❌ Wrong — inline prompt string
const prompt = `You are a helpful assistant...`;
```

---

## Project-Specific Patterns

→ Read `knowledge/tech-stack.md` → "Project-Specific Patterns" section.
These are documented per project, not here.

---

## Pre-Commit Checklist

### Universal (every project)
- [ ] No AI SDK imports in Client Components or mobile
- [ ] `SUPABASE_SERVICE_ROLE_KEY` not in `NEXT_PUBLIC_` vars
- [ ] `server-only` on all files using service role or AI SDK
- [ ] All Route Handlers validate input with Zod
- [ ] All new Supabase tables have RLS policies
- [ ] No `any` TypeScript types
- [ ] No `console.log`
- [ ] All AI prompts in `src/lib/ai/prompts/`
- [ ] No prompts inlined in Route Handlers

### Project-specific
→ Read `rules/architecture-rules.md` pre-commit section for this project's additional checks.
