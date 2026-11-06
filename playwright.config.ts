import { defineConfig, devices } from '@playwright/test';
const deploymentUrl = process.env.PLAYWRIGHT_BASE_URL;
const localUrl = `http://127.0.0.1:3100${process.env.NEXT_PUBLIC_BASE_PATH || ''}/`;
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 2,
  retries: 0,
  use: { baseURL: deploymentUrl || localUrl, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
        channel: process.env.CI ? undefined : 'chrome',
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        deviceScaleFactor: 1,
        defaultBrowserType: 'chromium',
        channel: process.env.CI ? undefined : 'chrome',
      },
    },
  ],
  webServer: deploymentUrl
    ? undefined
    : {
        command: 'npm start',
        url: localUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
