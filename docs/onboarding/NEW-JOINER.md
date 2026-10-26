# New joiner handoff — LT-1 max lead time filter

> **Stand-in example:** Saved workshop output (same convention as tags `101-1` … `101-5`). Replace after a dry run with the pinned Cursor model.

You inherited **LT-1** (filter catalog by max lead time). This note summarizes what the feature does, where it lives, what the tests cover, what is still open, and what to check before you change anything.

## What the filter does

Buyers on the catalog page can cap results by **Max lead time** (Any, 2 / 4 / 8 / 12 weeks or less). The story is in `docs/stories/LT-1-lead-time-filter.md`. Active filters (search, category, in stock only, and max lead time) must all match (**AC4**). **Clear filters** resets max lead time to Any (**AC5**).

**UI:** `public/index.html` defines the `max-lead-time` select (`data-testid="max-lead-time"`). `public/app.js` → `initCatalog()` reads that control, builds query params (including `maxLeadTime`), calls `GET /api/parts`, and renders each row’s `leadTimeDisplay` in the results table.

**Server:** `server.js` → `handleApi()` reads `maxLeadTime` from the query string. `filterParts()` applies `matchesSearch`, `matchesCategory`, `matchesInStock`, and `matchesMaxLeadTime`. List rows use `formatLeadTimeList()` so missing lead time shows **Not listed** on the catalog (**AC7**).

## What LT-1 and the Playwright tests cover

Manual cases live in `docs/test-cases/LT-1.md` (tag `101-2-test-cases`). Automation is in `tests/e2e/lead-time-filter.spec.ts` (tag `101-3-e2e` onward):

| Test | Maps to | What it checks |
|------|---------|----------------|
| **TC-01** | TC-01 / AC3 | With **Any**, a part with no listed lead time (BR-1013-47) can appear. |
| **TC-02** | TC-02 / AC2 | **4 weeks or less** keeps a 3-week part (BR-2010-C2) and hides a 6-week part (BR-2030-E3) when search narrows to Halvorsen. |
| **TC-03** | TC-03 / AC2 boundary | **4 weeks or less** should include BR-1002-47 at **exactly** 4 weeks (inclusive max). |

`npm run verify` expects **four** Playwright tests and **one** failure (TC-03) from tag `101-3-e2e` through `101-6-new-joiner`.

## What is still open or broken

1. **Boundary failure (TC-03)** — Selecting **4 weeks or less** hides BR-1002-47 (4 weeks). `server.js` → `matchesMaxLeadTime()` uses `part.leadTimeWeeks < cap` instead of `<=`, which violates **AC2**. The failing test is **TC-03** in `tests/e2e/lead-time-filter.spec.ts`; case **TC-03** in `docs/test-cases/LT-1.md` documents the expected behavior.

2. **"null wk" on part detail** — Catalog list shows **Not listed** for missing lead time, but `public/app.js` → `initPart()` builds `leadText` as `part.leadTimeWeeks + " wk"`, so `/part.html?id=br-1013-47` shows **null wk**. Documented in `docs/bugs/BUG-101-null-lead-time.md` (tag `101-4-bug-report`).

3. **ST-2 quantity vs stock** — `docs/stories/ST-2-add-to-cart.md` does not cap quantity at stock on hand. `server.js` POST `/api/cart` accepts any quantity ≥ 1 with no `stockQty` check (e.g. BR-2021-D7, stock 410, quantity 5000). Segment 4 of the workshop calls this out as a story gap to refine with the BA.

Do **not** “fix” these for the demo unless you are intentionally ending the planted-defect storyline.

## Check before you change anything

- Re-read `docs/stories/LT-1-lead-time-filter.md` acceptance criteria, especially **AC2** (inclusive boundary) and **AC3** (hide unlisted lead time when capped).
- Run `npx playwright test tests/e2e/lead-time-filter.spec.ts` and confirm whether **TC-03** still fails; if you change `matchesMaxLeadTime`, expect that test to flip first.
- Grep for `leadTimeWeeks` and `maxLeadTime` in `server.js`, `public/app.js`, and `public/index.html` so UI, API, and filter logic stay aligned.
- If you touch display strings, compare catalog (`formatLeadTimeList` / `leadTimeDisplay`) with part detail (`initPart`) so missing lead time stays consistent.
- Run `npm run verify` before pushing; checkpoint tags must keep their expected pass/fail counts.
- For cart behavior, coordinate with **ST-2** (`docs/stories/ST-2-add-to-cart.md`) before adding validation in `server.js` or `public/app.js`.
