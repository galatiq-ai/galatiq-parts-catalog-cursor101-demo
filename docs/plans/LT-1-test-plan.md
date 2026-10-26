# LT-1 test plan (Plan mode stand-in)

> **Note:** Plausible workshop output. Replace after a dry run with the pinned Cursor model.

## Scope

Test the **Max lead time** filter on the catalog page (`public/index.html`, `server.js` filter logic) against `docs/stories/LT-1-lead-time-filter.md`.

## Clarifying questions (answered for the demo)

| Question | Answer |
|----------|--------|
| Units for lead time? | Whole weeks only; UI shows `N wk` or **Not listed**. |
| Parts with no lead time when a cap is selected? | Hidden (AC3). |
| Combine with in-stock and category? | AND logic (AC4). |
| Inclusive boundary for “N weeks or less”? | Yes — exactly N weeks is included (AC2). |

## Test areas

1. Filter options present (AC1).
2. Boundary weeks 2, 4, 8, 12 — inclusive max (AC2).
3. Missing lead time behavior (AC3).
4. Combined filters (AC4).
5. Clear filters (AC5).
6. Empty state copy (AC6).
7. Row display of lead time (AC7).

## Automation approach

- Manual cases first in `docs/test-cases/LT-1.md`.
- Automate priority cases with Playwright following `tests/e2e/search.spec.ts`.
- Use `data-testid` selectors; do not change a failing test to match a bug — file a defect.

## Risks

- Boundary math errors in server filter.
- Regression when adding cart stories (ST-2).
