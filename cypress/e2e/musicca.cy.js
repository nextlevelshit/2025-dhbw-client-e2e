describe("Telekom Sound on Musicca Piano", () => {
  beforeEach(() => {
    cy.visit("https://www.musicca.com/piano");
    cy.get("[data-note]").should("be.visible");
  });

  it("should play the iconic Telekom jingle", () => {
    // Actual T-Mobile melody from the sheet music
    const telekomSequence = [
      { note: "3c", duration: 80 },
      { note: "3c", duration: 80 },
      { note: "3c", duration: 80 },
      { note: "3e", duration: 80 },
      { note: "3c", duration: 300 },
    ];

    telekomSequence.forEach((step) => {
      cy.get(`[data-note="${step.note}"]`).click({ force: true });
      cy.wait(step.duration);
    });

    // Mark the notes
    cy.contains("Mark").click({ force: true });
    telekomSequence.forEach((step) => {
      cy.get(`[data-note="${step.note}"]`).click({ force: true });
      cy.wait(step.duration);
    });
  });
});
