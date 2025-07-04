describe("Pattern Sketch Drum Machine", () => {
  beforeEach(() => {
    cy.visit("https://patternsketch.com/");
  });

  it("should play default pattern", () => {
    cy.get("#divPlayPause").click();
  });
});
