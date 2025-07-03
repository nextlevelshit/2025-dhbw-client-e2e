import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
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
  },
});
