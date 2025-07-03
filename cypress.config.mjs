import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    env: {
      // Set environment variables for tests
      API_BASE_URL: "http://localhost:1312/api",
    },
    baseUrl: "https://www.chess.com",
    viewportWidth: 1280,
    viewportHeight: 720,

    // Learning: Setup hooks for consistent test environment
    setupNodeEvents(on, config) {
      // TODO: Add custom tasks here
      // on('task', { ... })
    },

    // Disable video recording for faster local development
    video: false,

    // Keep screenshots only on failures
    screenshotOnRunFailure: true,
    screenshotFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
  },
});
