import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory (now relative from tests/)
  testDir: './',  // Changed from './tests'
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  
  use: {
    // Base URL still the same
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  webServer: {
    // Command stays the same (runs from project root)
    command: 'npx http-server src -p 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    cwd: '../',  // Run from project root
  },
});