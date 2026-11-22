const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  workers: 3,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node scripts/serve-build.cjs",
      url: "http://127.0.0.1:4173/archive/",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm start",
      url: "http://127.0.0.1:4174/",
      reuseExistingServer: !process.env.CI,
      env: { BROWSER: "none", CI: "true", HOST: "127.0.0.1", PORT: "4174" },
      timeout: 180000,
    },
  ],
});
