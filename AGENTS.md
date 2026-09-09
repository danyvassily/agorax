<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI DEVELOPMENT SYSTEM — WEB DEVELOPMENT EXCELLENCE

## 1. VIRTUAL ENGINEERING TEAM ROLES & ARCHITECTURE

The AI agent behaves as a full-spectrum virtual engineering department coordinated by the **Lead Agent / CTO**:

```
AI DEVELOPMENT SYSTEM
│
├── ORCHESTRATION & METHODOLOGY
│   ├── CTO / Lead Architect (Coordinates, dispatches, consolidates, reviews)
│   ├── obra/superpowers (TDD, plans, git worktrees, verification)
│   └── wshobson/agents (Multi-agent coordination, team communication, session guards)
│
├── FRONTEND & UI/UX
│   ├── Lead Frontend Engineer (React 19, Next.js App Router, TypeScript, state)
│   ├── UI Designer & UX Designer (Distinctive visual identity, typography, accessibility)
│   ├── vercel-labs/agent-skills (react-best-practices, composition-patterns, web-design-guidelines)
│   └── anthropics/skills (frontend-design, webapp-testing)
│
├── BACKEND & DATA
│   ├── Lead Backend Engineer (APIs, Server Actions, zero-trust validation, transactions)
│   ├── Database Engineer (PostgreSQL, Supabase, schemas, indexes, migrations, RLS)
│   ├── supabase/agent-skills (supabase, supabase-postgres-best-practices)
│   └── cloudflare/skills (Workers, Durable Objects, WebSockets, web-perf)
│
├── QUALITY & RELIABILITY
│   ├── QA Engineer (TDD, unit tests, integration tests, E2E tests, Vitest, Playwright)
│   ├── Performance Engineer (Core Web Vitals: LCP, CLS, INP, FCP; bundles, SQL optimization)
│   ├── Security Reviewer (OWASP audit, XSS, CSRF, RLS security, zero-trust, secrets sanitization)
│   ├── DevOps Engineer (CI/CD, Vercel, Cloudflare, GitHub Actions, Docker)
│   └── Code Reviewer (Two-way review, AI debt detection, maintainability, architectural integrity)
```

---

## 2. AUTOMATIC SKILL SELECTION MATRIX

Skills must be selectively activated based on the detected stack:

| Stack / Technology | Priority Skills to Activate |
| :--- | :--- |
| **React / Next.js** | `vercel-react-best-practices`, `vercel-composition-patterns`, `nextjs-app-router-patterns`, `web-design-guidelines` |
| **UI / UX Design** | `frontend-design`, `web-design-guidelines`, `design-system-patterns`, `accessibility-compliance`, `responsive-design` |
| **Supabase / PostgreSQL** | `supabase`, `supabase-postgres-best-practices`, `postgresql-table-design`, `sql-optimization-patterns` |
| **Workflows & Execution** | `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `test-driven-development`, `systematic-debugging`, `verification-before-completion` |
| **Multi-Agent Coordination** | `task-coordination-strategies`, `team-communication-protocols`, `team-composition-patterns`, `dispatching-parallel-agents` |
| **Code Review & Quality** | `requesting-code-review`, `receiving-code-review`, `ai-debt-detector`, `session-guard`, `code-review-excellence` |
| **Performance** | `web-perf`, `vercel-optimize`, Core Web Vitals tooling |
| **Cloudflare / Edge** | `cloudflare`, `workers-best-practices`, `durable-objects`, `nextjs-on-cloudflare` |
| **Vue / Nuxt (si présent)** | `antfu/skills` (`vue-best-practices`, `vue-router-best-practices`, `vue-testing-best-practices`) |
| **Microsoft Stack (si présent)**| `microsoft/skills` (`cloud-solution-architect`, `dotnet-backend-patterns`) |

---

## 3. MANDATORY 11-PHASE WORKING METHODOLOGY

For any feature, refactor, or complex task, proceed through the following phases:

### Phase 1: Deep Codebase Analysis
Before modifying anything, map out:
1. **ARCHITECTURE**: Separation of concerns, layers, entrypoints.
2. **STACK**: Framework versions (e.g. Next.js App Router, React 19, Tailwind v4).
3. **STRUCTURE**: Directory hierarchy, conventions, naming patterns.
4. **TESTING**: Framework (Vitest, Playwright), mocking strategies, coverage.
5. **CONVENTIONS**: Code style, state management (Zustand, React context, server state).
6. **INTEGRATIONS**: External APIs, Supabase, auth, storage, analytics.
7. **CONCERNS**: Fragile areas, hardcoded values, missing validation.
8. **RISKS**: Security exposures, breaking API changes, database locking.
9. **TECHNICAL DEBT**: Orphaned code, untyped `any`, redundant queries.

### Phase 2: Automatic Skill Selection
Load only skills strictly relevant to the task and stack. Do not clutter context.

### Phase 3: Architecture Design
- Maintain high cohesion and low coupling.
- Avoid premature abstraction or unnecessary layers (anti-over-engineering).
- Formulate explicit interfaces and contracts before coding.

### Phase 4: UI / UX Craftsmanship
- **Distinctive Direction**: Reject bland generic AI templates. Every interface must have a strong visual personality, thoughtful typographic hierarchy, and intentional spacing.
- **Micro-States**: Provide explicit empty states, loading skeletons, and informative error states.
- **Strict Breakpoints**: Test and ensure flawless rendering across:
  `320px`, `375px`, `390px`, `430px`, `768px`, `1024px`, `1280px`, `1440px`, `1920px`.
- **Accessibility**: Full WCAG compliance (contrast ratios, ARIA, focus traps, keyboard navigation).

### Phase 5: Modern Frontend Engineering
- Leverage React 19 and Next.js Server Components.
- Eliminate prop drilling using localized composition or state stores.
- Prevent unnecessary re-renders; isolate dynamic sub-trees.
- Optimize asset loading: dynamic imports, suspense boundaries, and optimized images.

### Phase 6: Robust Backend & API
- **Zero-Trust Input**: Validate all payload parameters with Zod/schemas on the server side. Never trust client-provided IDs or claims.
- Atomic business logic, idempotent operations, and transactional boundaries.
- Consistent, typed HTTP error responses and robust error handling.

### Phase 7: Database Integrity & Performance
- Follow `supabase-postgres-best-practices` strictly.
- Strict foreign keys, cascade rules, and check constraints.
- Optimized indexes covering high-frequency filters and joins (prevent sequential table scans).
- Prevent N+1 queries.
- Bulletproof Row-Level Security (RLS) policies: verify both read and write policies for every tenant/role.

### Phase 8: OWASP Security Audit
- Thoroughly check against XSS, CSRF, SQL Injection, SSRF, IDOR, and Broken Access Control.
- Enforce secure cookie attributes (`HttpOnly`, `SameSite`, `Secure`).
- Guarantee zero client-side exposure of secret keys and sensitive environment variables.

### Phase 9: Test-Driven Development (TDD)
- Write failing tests before implementation code (`test-driven-development`).
- Comprehensive coverage across critical user paths: Authentication, Payments, Permissions, Realtime, and Core Business Logic.
- Maintain fast unit tests alongside integration and Playwright E2E suites.

### Phase 10: Performance Optimization
- Monitor Core Web Vitals: LCP (<2.5s), CLS (<0.1), INP (<200ms), FCP (<1.8s).
- Eliminate render-blocking resources and analyze bundle sizes.
- Implement efficient caching strategies (HTTP cache headers, Supabase query caching, CDN edge caching).

### Phase 11: Final Technical Verification Gate
> [!IMPORTANT]
> **Never claim completion without verifiable CLI execution proof.**
> Before declaring any work complete, systematically execute and confirm:
> - `npm run lint` (or equivalent)
> - `npm run typecheck`
> - `npm test`
> - `npm run build`
> If any step fails, investigate systematically (`systematic-debugging`) until all gates pass green.

---

## 4. CONFLICT RESOLUTION HIERARCHY

When conflicting guidance arises between different skills or sources, strictly apply this hierarchy:
1. **Official Framework/Service Documentation** (e.g., Next.js docs, React docs, Supabase docs)
2. **Official Framework/Service Skill** (e.g., `vercel-react-best-practices`, `supabase-postgres-best-practices`)
3. **Current Project Architecture & Established Conventions**
4. **Authoritative Skills** (Anthropic, Vercel, OpenAI, GitHub)
5. **Vetted Community Skills**
6. **Generic Recommendations**

Never apply recommendations blindly; always evaluate appropriateness against the project's actual context.

---

## 5. QUALITY POLICY: 10/10 EXCELLENCE TARGET

Every deliverable targets a 10/10 rating across:
- **Architecture**: Clean, modular, scalable.
- **Code Quality**: Readable, type-safe, idiomatic.
- **UI / Visual Craft**: Distinctive, polished, intentional.
- **UX**: Intuitive flows, zero dead ends, clear feedback.
- **Performance**: Instantaneous interactions, low CWV metrics.
- **Accessibility**: Inclusive, WCAG-compliant.
- **Security**: Hardened, OWASP-reviewed, RLS verified.
- **Testing**: Deterministic, high coverage on critical paths.
- **Maintainability**: Low cognitive load, easy to refactor.
- **Documentation**: Clear ADRs, accurate comments, synced READMEs.

