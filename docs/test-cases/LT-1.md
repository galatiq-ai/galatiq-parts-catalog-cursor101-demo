# LT-1 test cases (stand-in)

> Replace after dry run. Format follows `docs/test-cases/TEMPLATE.md`.

## TC-01: Any shows parts without lead time

- **Type:** Positive
- **Priority:** High
- **Source:** AC3
- **Given:** the catalog is open
- **When:** the buyer searches for BR-1013-47 with Max lead time **Any**
- **Then:** BR-1013-47 appears with lead time **Not listed**
- **Not in story:** none

## TC-02: 4 weeks or less excludes a 6-week part but keeps a 3-week part

- **Type:** Positive
- **Priority:** High
- **Source:** AC2
- **Given:** a manufacturer filter via search "Halvorsen" returns BR-2010-C2 (3 wk) and BR-2030-E3 (6 wk)
- **When:** the buyer selects **4 weeks or less**
- **Then:** BR-2010-C2 is shown and BR-2030-E3 is not shown
- **Not in story:** none

## TC-03: 4 weeks or less includes exactly 4 weeks

- **Type:** Boundary
- **Priority:** High
- **Source:** AC2
- **Given:** BR-1002-47 has a listed lead time of 4 weeks
- **When:** the buyer selects **4 weeks or less**
- **Then:** BR-1002-47 appears in the results
- **Not in story:** none

## TC-04: Missing lead time hidden when capped

- **Type:** Negative
- **Priority:** Medium
- **Source:** AC3
- **Given:** BR-1013-47 has no listed lead time
- **When:** the buyer selects **2 weeks or less**
- **Then:** BR-1013-47 is not shown
- **Not in story:** none

## Open questions

- Should "Not listed" parts count as infinite lead time for sorting? (Out of LT-1 scope.)
