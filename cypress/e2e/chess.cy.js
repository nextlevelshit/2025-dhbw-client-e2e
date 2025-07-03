describe("Hacking chess.com", () => {
  beforeEach(() => {
    // Clear cookies and local storage for reproducible state
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    // Visit website
    cy.visit("https://www.chess.com/play/online");
    // Accecpt cookies
    cy.get("#onetrust-reject-all-handler", { timeout: 10_000 }).click();
  });

  it("Initiate new game", () => {
    cy.get(".new-game-primary > button").click();

    cy.get("#guest-button", { timeout: 10_000 }).click();
  });
});
