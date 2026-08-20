<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Beauty Business agent guide

## Mandatory project-rule loading

Before planning, reviewing, generating, or modifying code:

1. Recursively discover every text rule under `.cursor/rules/`.
2. Read every applicable rule completely, including its frontmatter.
3. Apply `alwaysApply: true` rules globally and scoped rules whenever the inspected or changed files match their `globs`.
4. Read every project document referenced by an applicable rule.
5. Repeat discovery if new rules appear or work moves into a more specific subtree.

Cursor rules are project rules for every coding agent, not editor-only suggestions.

Rule precedence is: platform/system instructions, explicit user instructions, the closest `AGENTS.md`, then the most specific applicable project rule. Report conflicts that cannot be resolved safely.

## Before implementing anything

Read, in order:

1. `docs/PRODUCT.md`
2. `docs/SCOPE.md`
3. `docs/DISCOVERY.md`
4. `docs/DOMAIN.md`
5. `docs/ARCHITECTURE.md`
6. `docs/DESIGN.md`
7. `docs/CODING_STANDARDS.md`
8. `docs/DECISIONS.md`
9. `docs/BACKLOG.md`

For feature work, also read the corresponding specification under `docs/features/` and any approved execution plan under `docs/plans/`.

The repository is currently in a documentation-first bootstrap stage. Do not implement a business feature unless its scope is documented and the requested task explicitly authorizes implementation.

## Product guardrails

- This is an operational data collector, not yet a POS, ERP, CRM, scheduler, payroll system, accounting system, or advanced inventory system.
- Preserve the distinction between gross sales, salon revenue, and provider earnings.
- Keep payment receiver, recorded outflows, and preliminary operating result distinct; never label a preliminary result as accounting profit or net income.
- Preserve historical transaction values. Never recalculate old transactions using a provider's current agreement.
- Capture operational events individually; do not replace them with manually entered daily totals.
- Minimize Andrea's capture effort. Prefer defaults, catalog values, and derived fields over asking her to calculate.
- Do not invent domain rules. Record unresolved behavior as an open question.

## Architecture guardrails

- Use TypeScript strict mode.
- Keep the product as a modular monolith until a documented need justifies separation.
- Domain and application code must not depend on UI or persistence details.
- UI handlers must call application use cases instead of accessing the database directly.
- Never represent money with floating-point arithmetic.
- Database schema changes require new migrations; never rewrite an applied migration.
- Use PostgreSQL as the system of record. JSONB is allowed for genuinely experimental metadata, not as a substitute for understood relationships.
- Local infrastructure dependencies must run through Docker Compose. The Next.js application itself runs on the host and must not be added to the development Compose stack.
- Treat every business route and operation as protected by default after `FND-002`; validate sessions server-side instead of relying only on middleware or hidden UI.
- Never store plaintext passwords, authentication tokens, session identifiers, or real credentials in Git, logs, browser storage, Compose, or example environment files.
- Add or update automated tests for every business rule changed.

## Documentation rules

- If a business term or invariant changes, update `docs/DOMAIN.md`.
- If product scope changes, update `docs/PRODUCT.md` and `docs/SCOPE.md`.
- If architecture changes, update `docs/ARCHITECTURE.md` and record the decision in `docs/DECISIONS.md`.
- If a visual, interaction, accessibility, loading, or user-facing error convention changes, update `docs/DESIGN.md` and its applicable `.cursor/rules/` enforcement rule.
- If a reusable coding convention changes, update `docs/CODING_STANDARDS.md` and its applicable `.cursor/rules/` enforcement rule.
- If acceptance criteria change, update the matching file under `docs/features/`.
- If a metric, filter, or reporting meaning changes, update `docs/DOMAIN.md`, the applicable `REP-*` specification, and the reporting enforcement rule.
- Keep current execution plans under `docs/plans/active/` and move finished plans to `docs/plans/completed/`.

## Completion checks

Run every available relevant check. At minimum, with the current scaffold:

```bash
npm run lint
npm run build
```

When `FND-001` adds type-check and test scripts, those checks also become mandatory.
