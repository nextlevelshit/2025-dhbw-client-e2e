/// <reference types="cypress" />

Cypress.on("uncaught:exception", () => {
  return false;
});

Cypress.Commands.add("visitUrl", (url) => {
  return cy.visit(url, { log: false, timeout: 20_000 });
});

// TODO: Implement login command
// Cypress.Commands.add('login', (email, password) => {
//   cy.get('#login-username').type(email);
//   cy.get('#login-password').type(password);
//   cy.get('#login').click();
// });

// TODO: Implement cookie handling
// Cypress.Commands.add('acceptCookies', () => {
//   cy.get('#onetrust-reject-all-handler').click();
// });
