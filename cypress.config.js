const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: 'https://www.chess.com',
    },
    // supportFolder: false
    // experimentalWebKitSupport: true, // Für MacOS
    // chromeWebSecurity: false, // Für iFrames bspw. bei PayPal
})