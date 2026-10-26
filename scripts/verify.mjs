#!/usr/bin/env node
/**
 * For each checkpoint tag, run Playwright and assert expected pass/fail counts.
 */
import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const TAG_EXPECTATIONS = {
  "101-0-start": { total: 1, failed: 0, screenshots: [] },
  "101-1-test-plan": { total: 1, failed: 0, screenshots: [] },
  "101-2-test-cases": { total: 1, failed: 0, screenshots: [] },
  "101-3-e2e": { total: 4, failed: 1, screenshots: [] },
  "101-4-bug-report": {
    total: 4,
    failed: 1,
    screenshots: ["docs/bugs/part-null-lead-time-screenshot.png"],
  },
  "101-5-capture": {
    total: 4,
    failed: 1,
    screenshots: ["docs/bugs/part-null-lead-time-screenshot.png"],
  },
  "101-6-new-joiner": {
    total: 4,
    failed: 1,
    screenshots: ["docs/bugs/part-null-lead-time-screenshot.png"],
  },
};

function run(cmd, cwd = ROOT) {
  return execSync(cmd, { cwd, encoding: "utf8" });
}

function parsePlaywrightSummary(output) {
  const passed = Number(output.match(/(\d+) passed/)?.[1] ?? 0);
  const failed = Number(output.match(/(\d+) failed/)?.[1] ?? 0);
  const skipped = Number(output.match(/(\d+) skipped/)?.[1] ?? 0);
  const total = passed + failed + skipped;
  return { total, failed, passed, skipped };
}

function verifyTag(tag) {
  const worktree = path.join(os.tmpdir(), `cursor101-verify-${tag}`);
  fs.rmSync(worktree, { recursive: true, force: true });
  run(`git worktree add "${worktree}" ${tag}`);
  try {
    const expected = TAG_EXPECTATIONS[tag];
    for (const shot of expected.screenshots) {
      if (!fs.existsSync(path.join(worktree, shot))) {
        throw new Error(`Missing ${shot} at tag ${tag}`);
      }
    }
    run("npm ci", worktree);
    const env = { ...process.env, CI: "1" };
    const result = spawnSync("npx", ["playwright", "test"], {
      cwd: worktree,
      encoding: "utf8",
      env,
    });
    const combined = `${result.stdout}\n${result.stderr}`;
    const summary = parsePlaywrightSummary(combined);
    const ok =
      summary.total === expected.total &&
      summary.failed === expected.failed &&
      (expected.failed > 0 ? result.status !== 0 : result.status === 0);
    return { ok, summary, expected, output: combined };
  } finally {
    run(`git worktree remove "${worktree}" --force`);
  }
}

function main() {
  let failed = false;
  for (const tag of Object.keys(TAG_EXPECTATIONS)) {
    try {
      const { ok, summary, expected, output } = verifyTag(tag);
      if (ok) {
        console.log(
          `OK ${tag}: ${summary.passed} passed, ${summary.failed} failed (expected total ${expected.total}, failed ${expected.failed})`,
        );
      } else {
        failed = true;
        console.error(`FAIL ${tag}: got total=${summary.total} failed=${summary.failed}`);
        console.error(output.slice(-2500));
      }
    } catch (e) {
      failed = true;
      console.error(`FAIL ${tag}:`, e.message);
    }
  }
  if (failed) process.exit(1);
  console.log("All checkpoint verifications passed.");
}

main();
