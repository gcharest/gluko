import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Base config
  testDir: './e2e',

  // Run all tests in parallel by default (dev) or sequential (CI for faster feedback)
  fullyParallel: !process.env.CI,

  // Timeout settings
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },

  // CI specific settings
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Reduce from 2 to 1 to save time
  workers: process.env.CI ? 1 : 4, // Use 4 workers in dev for parallelism
  maxFailures: process.env.CI ? 5 : undefined, // Stop after 5 failures to save resources

  // Use blob reporter in CI for sharding support, HTML elsewhere
  reporter: process.env.CI
    ? [['blob'], ['list']]
    : [['html'], ['list']],

  // Common test settings
  use: {
    // No timeout for actions like click
    actionTimeout: 0,

    // Base URL for navigation (using preview server in CI)
    baseURL: process.env.CI ? 'http://localhost:4173/gluko' : 'http://localhost:5173',

    // Collect traces only on failure (saves disk space)
    trace: 'on-first-retry',

    // Screenshots on failure
    screenshot: 'only-on-failure',

    // Always run headless (no X server available in this environment)
    headless: true,

    // Viewport settings that ensure consistent testing
    viewport: { width: 1280, height: 720 }
  },

  // Browser configurations
  projects: process.env.CI
    ? [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] }
      }
      // In CI, run only Chromium by default. Use --project=firefox/webkit to test others
    ]
    : [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] }
      },
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] }
      }
    ],  // Dev server configuration
  webServer: process.env.CI
    ? {
      command: 'npm run preview',
      port: 4173,
      reuseExistingServer: false,
      timeout: 120000
    }
    : {
      command: 'npm run dev',
      port: 5173,
      reuseExistingServer: true
    }
})
