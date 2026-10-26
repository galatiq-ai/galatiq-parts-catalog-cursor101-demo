import { test, expect } from "@playwright/test";

test("catalog search finds a part by number", async ({ page }) => {
  await page.goto("/index.html");
  await page.getByTestId("search-input").fill("BR-2020-D1");
  await page.waitForTimeout(300);

  const row = page.getByTestId("results-body").locator('[data-part-id="br-2020-d1"]');
  await expect(row).toBeVisible();
  await expect(row.getByTestId("cell-lead-time")).toHaveText("2 wk");
});
