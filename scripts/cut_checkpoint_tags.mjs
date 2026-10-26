#!/usr/bin/env node
/**
 * Rebuild linear checkpoint history and force-update tags 101-0-start … 101-6-new-joiner.
 * Idempotent: safe to run multiple times. Uses --allow-empty on commits.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const STAGES = [
  { tag: "101-0-start", add: [] },
  { tag: "101-1-test-plan", add: ["docs/plans/LT-1-test-plan.md"] },
  { tag: "101-2-test-cases", add: ["docs/test-cases/LT-1.md"] },
  { tag: "101-3-e2e", add: ["tests/e2e/lead-time-filter.spec.ts"] },
  {
    tag: "101-4-bug-report",
    add: [
      "docs/bugs/BUG-101-null-lead-time.md",
      "docs/bugs/part-null-lead-time-screenshot.png",
    ],
  },
  {
    tag: "101-5-capture",
    add: [
      ".cursor/rules/qa-test-cases.mdc",
      ".agents/skills/mouser-cursor101-story-review/SKILL.md",
      ".cursor/skills/mouser-cursor101-story-review/SKILL.md",
    ],
  },
  { tag: "101-6-new-joiner", add: ["docs/onboarding/NEW-JOINER.md"] },
];

function run(cmd, opts = {}) {
  execSync(cmd, { cwd: ROOT, stdio: "inherit", ...opts });
}

function runOut(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
}

function laterExclusivePaths(fromStageIndex) {
  const paths = new Set();
  for (let i = fromStageIndex + 1; i < STAGES.length; i++) {
    for (const f of STAGES[i].add) paths.add(f);
  }
  return paths;
}

function materializeStage0(snapshotRef) {
  run(`git checkout ${snapshotRef} -- .`);
  for (const rel of laterExclusivePaths(0)) {
    const full = path.join(ROOT, rel);
    if (fs.existsSync(full)) {
      try {
        run(`git rm -f "${rel}"`);
      } catch {
        fs.rmSync(full, { force: true, recursive: true });
      }
    }
  }
}

function main() {
  const returnBranch = runOut("git rev-parse --abbrev-ref HEAD");
  run("git add -A");
  try {
    run('git commit -m "checkpoint: snapshot before tag rebuild" --allow-empty');
  } catch {
    /* ignore */
  }
  const snapshotRef = runOut("git rev-parse HEAD");

  run("git checkout -f main");
  try {
    run("git branch -D checkpoint-rebuild");
  } catch {
    /* first run */
  }
  run("git checkout --orphan checkpoint-rebuild");
  try {
    run("git rm -rf .");
  } catch {
    /* empty */
  }

  for (let i = 0; i < STAGES.length; i++) {
    const { tag, add } = STAGES[i];
    if (i === 0) {
      materializeStage0(snapshotRef);
    } else {
      for (const f of add) {
        run(`git checkout ${snapshotRef} -- "${f}"`);
      }
    }
    run("git add -A");
    try {
      run(`git commit -m "checkpoint: ${tag}" --allow-empty`);
    } catch {
      run(`git commit -m "checkpoint: ${tag}" --allow-empty`);
    }
    run(`git tag -f ${tag}`);
  }

  run("git branch -f main 101-0-start");
  run("git checkout main");
  if (returnBranch !== "main" && returnBranch !== "checkpoint-rebuild") {
    try {
      run(`git branch -f ${returnBranch}`);
    } catch {
      /* ignore */
    }
  }
  console.log("Checkpoint tags rebuilt. main -> 101-0-start");
}

main();
