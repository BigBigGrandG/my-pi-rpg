# Domain Docs

How engineering skills consume this repository's domain documentation.

## Before exploring, read these

- `CONTEXT.md` at the repository root.
- Relevant decisions under `docs/adr/`.

If these files do not exist, proceed silently. The domain-modeling workflow creates them lazily when terminology or architectural decisions are resolved.

## File structure

This is a single-context repository:

```text
/
├── CONTEXT.md
├── docs/
│   └── adr/
└── src/
```

Do not introduce `CONTEXT-MAP.md` or context-scoped ADR directories unless the repository becomes a genuine multi-context monorepo.

## Use the glossary's vocabulary

Use domain terms exactly as defined in `CONTEXT.md` in issue titles, implementation plans, tests, refactoring proposals, and documentation.

If a needed concept is absent, reconsider whether existing vocabulary already covers it. Otherwise record the gap for domain modeling.

## Flag ADR conflicts

If proposed work contradicts an existing ADR, surface the conflict explicitly instead of silently overriding the decision.
