describe("Hacking chess.com", () => {
  beforeEach(() => {
    // Clear cookies and local storage for reproducible state
    cy.clearAll();
    // Visit website
    cy.visit("https://www.chess.com/play/online");
    // Accecpt cookies
    cy.acceptCookies();
  });

  it("Initiate new game", () => {
    cy.get(".new-game-primary > button").click();

    cy.get("#guest-button", { timeout: 10_000 }).click();
  });
});
