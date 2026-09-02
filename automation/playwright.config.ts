import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the Shopware 6 guest-checkout E2E test.
 * Target environment: the public Shopware 6 demo storefront (Solution25).
 * Override with BASE_URL to point this suite at a local Shopware instance instead.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://www.shopware6-demo.development-s25.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Optional escape hatch for sandboxes that ship a browser build Playwright's
        // own version doesn't expect (e.g. a pre-baked CI image). Leave unset to use
        // Playwright's normal, version-matched browser resolution.
        ...(process.env.PLAYWRIGHT_LOCAL_CHROME_PATH
          ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_LOCAL_CHROME_PATH } }
          : {}),
      },
    },
  ],
});
