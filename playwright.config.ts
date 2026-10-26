import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT || "3847";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node server.js",
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: true,
    env: { PORT },
  },
});
