import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './src/tests/e2e',
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}{ext}',
  fullyParallel: true,
  // The phase2 mock server stores auth and project data in process-global memory,
  // so cross-file parallel workers make admin/member snapshot flows race.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : [
        {
          command: 'pnpm dev:mock',
          port: 9090,
          reuseExistingServer: false,
        },
        {
          command: 'API_BASE_URL=http://localhost:9090 pnpm dev:next',
          port: 3000,
          reuseExistingServer: false,
        },
      ],
})
