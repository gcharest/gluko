import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Base config
  testDir: './e2e',

  // Run all tests in parallel by default
  fullyParallel: true,

  // Timeout settings
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },

  // CI specific settings
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Use HTML reporter
  reporter: 'html',

  // Common test settings
  use: {
    // No timeout for actions like click
    actionTimeout: 0,

    // Base URL for navigation
    baseURL: 'http://localhost:5173',

    // Collect traces only on retry
    trace: 'on-first-retry',

    // Always run headless in the dev container
    headless: true,

    // Viewport settings that ensure consistent testing
    viewport: { width: 1280, height: 720 }
  },

  // Browser configurations
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],

  // Local dev server configuration
  webServer: {
    command: process.env.CI ? 'vite preview --port 5173' : 'vite dev',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
})
