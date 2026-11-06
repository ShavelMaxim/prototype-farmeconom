import { defineConfig, devices } from '@playwright/test';
const deploymentUrl = process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  use: { baseURL: deploymentUrl || 'http://127.0.0.1:3100', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
        channel: 'chrome',
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        deviceScaleFactor: 1,
        defaultBrowserType: 'chromium',
        channel: 'chrome',
      },
    },
  ],
  webServer: deploymentUrl
    ? undefined
    : {
        command: 'npm run start -- -p 3100',
        url: 'http://127.0.0.1:3100',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
