# galatiq-parts-catalog-cursor101-demo

Small **illustrative** parts catalog for the Cursor 101 live training (BAs, QA, new users). Company name, part numbers (`BR-xxxx-xx`), and `data/parts.json` are **fictional sample data** for workshop use only—not real product requirements.

## Prerequisites

- **Node.js 20+**
- **Cursor** (recommended for the exercises)

## Quick start

```bash
npm ci
npm start
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847).

Optional end-to-end tests:

```bash
npx playwright install chromium
npm run test:e2e
```

`npm run verify` checks every checkpoint tag (install Chromium first).

## Checkpoint tags

Jump to a step in the workshop (discards uncommitted changes; does **not** remove ignored files):

```bash
git checkout -f <tag>
git clean -fd
```

Use `git clean -fd` only—**never** `git clean -fdx` (that can remove `node_modules`).

| Tag | What it adds |
|-----|----------------|
| `101-0-start` | App, stories, templates, baseline `search.spec.ts` |
| `101-1-test-plan` | `docs/plans/LT-1-test-plan.md` |
| `101-2-test-cases` | `docs/test-cases/LT-1.md` |
| `101-3-e2e` | `lead-time-filter.spec.ts` (one expected failure) |
| `101-4-bug-report` | `docs/bugs/BUG-101-null-lead-time.md` + screenshot |
| `101-5-capture` | QA rule + `mouser-cursor101-story-review` skill |
| `101-6-new-joiner` | `docs/onboarding/NEW-JOINER.md` (handoff stand-in) |

The `main` branch matches **`101-0-start`**.
