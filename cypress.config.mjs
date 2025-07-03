import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    env: {
      // Set environment variables for tests
      API_BASE_URL: "http://localhost:1312/api",
      GUI_URL: "https://nextlevelshit.github.io/node-cache-api/",
    },
    baseUrl: "https://www.chess.com",
    viewportWidth: 1280,
    viewportHeight: 720,
    scrollBehavior: "center",

    setupNodeEvents(on, config) {
      // NOTE: Everything in cypress/support/commands.js can also be handled here
      // on("uncaught:exception", () => {
      //   return false;
      // });
    },

    // Disable video recording for faster local development
    video: false,

    // Keep screenshots only on failures
    screenshotOnRunFailure: true,
    screenshotFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
  },
});
