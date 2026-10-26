import { test, expect } from "@playwright/test";

test.describe("LT-1 max lead time filter", () => {
  test("TC-01: Any shows parts with and without listed lead time", async ({ page }) => {
    await page.goto("/index.html");
    await page.getByTestId("search-input").fill("BR-1013-47");
    await page.waitForTimeout(300);
    await expect(page.getByTestId("results-body").locator('[data-part-id="br-1013-47"]')).toBeVisible();
  });

  test("TC-02: 4 weeks or less hides a 6-week part but keeps a 3-week part", async ({ page }) => {
    await page.goto("/index.html");
    await page.getByTestId("search-input").fill("Halvorsen");
    await page.getByTestId("max-lead-time").selectOption("4");
    await page.waitForTimeout(300);
    await expect(page.getByTestId("results-body").locator('[data-part-id="br-2010-c2"]')).toBeVisible();
    await expect(page.getByTestId("results-body").locator('[data-part-id="br-2030-e3"]')).toHaveCount(0);
  });

  test("TC-03: 4 weeks or less includes a part at exactly 4 weeks (AC2 boundary)", async ({ page }) => {
    await page.goto("/index.html");
    await page.getByTestId("search-input").fill("BR-1002-47");
    await page.getByTestId("max-lead-time").selectOption("4");
    await page.waitForTimeout(300);
    await expect(page.getByTestId("results-body").locator('[data-part-id="br-1002-47"]')).toBeVisible();
  });
});
