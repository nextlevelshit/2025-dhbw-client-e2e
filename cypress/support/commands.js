/// <reference types="cypress" />

Cypress.on("uncaught:exception", () => {
  return false;
});

Cypress.Commands.add("visitUrl", (url) => {
  return cy.visit(url, { log: false, timeout: 20_000 });
});

Cypress.Commands.add("clearAll", () => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
});

Cypress.Commands.add("acceptCookies", () => {
  cy.get("#onetrust-reject-all-handler", {
    timeout: 10_000,
    log: false,
  }).click();
});
