import { defineConfig } from '@playwright/test'

export default defineConfig({
  projects: [
    {
      name: 'pages',
      testDir: './pages',
      snapshotPathTemplate: '{snapshotDir}/{testFileDir}/.snapshots/{testFileName}/{arg}{ext}',
      use: {
        baseURL: 'http://127.0.0.1:5200',
        browserName: 'chromium',
      },
    },

    {
      name: 'storybook',
      testDir: './.storybook',
      testMatch: 'snapshots.ts',
      snapshotPathTemplate: '{arg}{ext}',
      use: {
        baseURL: 'http://127.0.0.1:6200',
        browserName: 'chromium',
      },
    },
  ],

  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1',
      url: 'http://127.0.0.1:5200',
      reuseExistingServer: !process.env.CI,
    },

    {
      command: 'npm run stories -- --host 127.0.0.1',
      url: 'http://127.0.0.1:6200',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
