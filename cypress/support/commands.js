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
 * Allways parse JSON correctly to string without replacing special character sequences.
 */
Cypress.Commands.overwrite("type", (cyType, subject, text, options) => {
  return cyType(subject, text, {
    parseSpecialCharSequences: false,
    ...options,
  });
});
