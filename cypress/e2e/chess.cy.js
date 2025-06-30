describe("Hacking chess.com", () => {
  beforeEach(() => {
    // Visit website
    cy.visit("/home");
    // Accecpt cookies and other stuff
    cy.get(".language-banner-close > .icon-font-chess").click();
    cy.get("#onetrust-reject-all-handler").click();
  });

  it("Sample login", () => {
    cy.fixture("credentials").then((credentials) => {
      cy.get("#login-username").type(credentials.email);

      // Pause the test to inspect the state
      cy.pause();

      cy.get("#login-password").type(credentials.password);

      cy.get("#login").should("be.visible");
    });
  });

  it.skip("Sign up account", () => {
    cy.get(".login-is-new").click();
  });
});
