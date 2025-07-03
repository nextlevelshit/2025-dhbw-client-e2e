describe("TodoMVC Learning", () => {
  beforeEach(() => {
    cy.visit("https://todomvc.com/examples/react/dist/");
  });

  it("should add and complete todos", () => {
    cy.get("[data-testid=text-input]").type("Learn Cypress{enter}");
    cy.get("[data-testid=todo-item-toggle]").click();
    cy.get("[data-testid=todo-item]").should("have.class", "completed");
  });
});
