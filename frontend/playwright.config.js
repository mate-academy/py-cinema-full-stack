import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:5173', viewport: { width: 1600, height: 1000 }, trace: 'retain-on-failure' },
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI
  }
});
