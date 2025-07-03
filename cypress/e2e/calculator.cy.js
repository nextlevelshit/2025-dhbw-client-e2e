describe("Calculator Tests", () => {
  beforeEach(() => {
    cy.visit("https://web2.0calc.com/");
  });

  it("should perform basic math", () => {
    cy.intercept("/calc", (req) => {
      // NOTE: This is a mock request handler and can be used to modify
      // the request itself or the replying response: https://docs.cypress.io/app/guides/network-requests#Modifying-a-Query-or-Mutation-Response
    }).as("calcRequest");
    // TODO: Click buttons for "2 + 3 ="
    cy.get("#Btn2").click();
    cy.get("#BtnPlus").click();
    cy.get("#Btn3").click();
    cy.get("#BtnCalc").click();
    cy.wait("@calcRequest").then(({ response }) => {
      // NOTE: Previously we were able to modify the requests and response with `cy.intercept()`
      // and now we can listen for the actual results, response headers etc.
      expect(response.body.status).to.equal("ok");
      expect(response.body.results[0].in).to.equal("2+3");
      expect(response.body.results[0].out).to.equal("5");
    });
  });
});
