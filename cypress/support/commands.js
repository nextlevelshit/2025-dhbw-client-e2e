/// <reference types="cypress" />

/**
 * Prevent log spam from uncaught exceptions.
 */
Cypress.on("uncaught:exception", () => {
  return false;
});

Cypress.Commands.add("visitUrl", (url) => {
  return cy.visit(url, { log: false, timeout: 20_000 });
});

/**
 * Clears all cookies, local storage, and session storage.
 */
Cypress.Commands.add("clearAll", () => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
});

/**
 * Accepts chess.com cookies by clicking the reject all button.
 */
Cypress.Commands.add("acceptCookies", () => {
  cy.get("#onetrust-reject-all-handler", {
    timeout: 10_000,
    log: false,
  }).click();
});

/**
 * Intercepts network requests and disables caching by removing the ETag header.
 */
Cypress.Commands.overwrite("intercept", (cyIntercept, method, url, cb) => {
  cyIntercept(method, url, (req) => {
    // cy.log("callback", cb);
    cy.pause();
    // Remove ETag header to prevent caching issues
    delete req?.headers["if-none-match"];
    // cb || cb(req);
  });
});

/**
 * Allways parse JSON correctly to string without replacing special character sequences.
 */
Cypress.Commands.overwrite("type", (cyType, subject, text, options) => {
  return cyType(subject, text, {
    parseSpecialCharSequences: false,
    ...options,
  });
});
