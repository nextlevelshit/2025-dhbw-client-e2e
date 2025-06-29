/// <reference types="cypress" />

Cypress.on("uncaught:exception", () => {
    return false;
});

Cypress.Commands.add("visitUrl", (url) => {
    return cy.visit(url, { log: false, timeout: 20_000 });
});