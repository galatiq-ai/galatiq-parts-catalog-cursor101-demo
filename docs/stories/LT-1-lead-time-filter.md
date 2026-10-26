# LT-1: Filter catalog by max lead time

**Company:** Brazos Ridge Electronics (fictional illustrative sample).  
**Status:** Ready for test planning  
**Persona:** Buyer at a contract manufacturer

## User story

As a buyer, I can limit catalog results by maximum lead time so I can focus on parts that can arrive within my schedule.

## Background

- Lead time is stored in whole weeks in the sample catalog.
- The catalog page already supports search text, category, and an **In stock only** checkbox.
- Linked requirement: REQ-CAT-034 (filters can be cleared).

## Acceptance criteria

- **AC1:** The catalog has a **Max lead time** control with: Any, 2 weeks or less, 4 weeks or less, 8 weeks or less, and 12 weeks or less.
- **AC2:** Selecting a max lead time shows only parts whose listed lead time is **that many weeks or less** (inclusive of the boundary week).
- **AC3:** Parts with **no lead time listed** do not appear when any max lead time option other than Any is selected.
- **AC4:** Max lead time works together with search, category, and In stock only (all active filters must match).
- **AC5:** Clearing filters resets max lead time to Any (REQ-CAT-034).
- **AC6:** If nothing matches, the page shows **No parts match your filters**.
- **AC7:** Each result row shows lead time (or **Not listed** when empty).

## Out of scope

- Changing how lead times are sourced in the ERP feed.
- Saved searches.
