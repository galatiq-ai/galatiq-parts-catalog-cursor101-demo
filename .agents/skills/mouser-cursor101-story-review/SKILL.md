---
name: mouser-cursor101-story-review
description: Review a Brazos Ridge user story for gaps, ambiguous acceptance criteria, and missing edge cases before testing. Use when asked to review LT-1, ST-2, or similar docs/stories files.
---

# Cursor 101 — story review

## Steps

1. Read the story in `docs/stories/` and list each acceptance criterion by id.
2. Mark each AC as clear, ambiguous, or untestable as written.
3. Cross-check `data/parts.json` for realistic examples (missing lead time, zero stock, boundary weeks).
4. Suggest edge cases and **open questions** without inventing product decisions.
5. Flag references to requirements not present in the story.

## Output

- Short summary
- Table: AC | clarity | notes
- Edge cases to discuss
- Open questions

Do not write full test cases unless the user asks.
