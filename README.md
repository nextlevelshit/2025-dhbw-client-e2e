# Cypress E2E Testing Workshop 🎯

Learn modern end-to-end testing with Cypress using ES6 modules and best practices.
This workshop follows the same architectural patterns as our [Express Cache API](../node-cache-api).

## TL;DR

```bash
npm install
npm run open   # Interactive development
npm run test   # Headless execution
```

## Architecture Overview

```
cypress/
├── e2e/                      # Example test scenarios
│   ├── calculator.cy.js
│   ├── chess.cy.js
│   ├── chess-login.cy.js
│   └── todo.cy.js
├── fixtures/
│   └── credentials.json      # Test data
├── support/
│   ├── commands.js           # Custom Cypress commands
│   └── e2e.js                # Global setup
└── cypress.config.js         # ES6 configuration
```

## Key Patterns

### 1. Modern ES6 Configuration

```javascript
// cypress.config.js - ES6 style
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://your-app.com",
    setupNodeEvents(on, config) {
      // Custom tasks here
    },
  },
});
```

### 2. Fixture-Driven Testing (JSON)

```javascript
// Use fixtures for test data management
cy.fixture("credentials").then((creds) => {
  cy.login(creds.valid.email, creds.valid.password);
});
```

### 3. Custom Commands

```javascript
// cypress/support/commands.js
Cypress.Commands.add("login", (email, password) => {
  cy.get("[data-cy=email]").type(email);
  cy.get("[data-cy=password]").type(password);
  cy.get("[data-cy=submit]").click();
});
```

## Testing Philosophy

Following the four-tier testing strategy from our Express API:

1. **Static Analysis** → ESLint for Cypress specs
2. **Unit Tests** → Individual command testing
3. **Integration Tests** → Component interaction
4. **E2E Tests** → Full user journeys ← **You are here**

## Common Patterns

### Setup and Teardown

```javascript
beforeEach(() => {
  cy.visit("/");
  cy.acceptCookies(); // Custom command
});
```

### Assertions

```javascript
// Chain assertions for better error messages
cy.get("[data-cy=welcome]")
  .should("be.visible")
  .and("contain.text", "Welcome back");
```

### Error Handling

```javascript
// Test negative scenarios
cy.get("[data-cy=error]")
  .should("contain.text", "Invalid credentials")
  .and("have.class", "error-message");
```

## Resources

- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [ES6 Modules in Cypress](https://docs.cypress.io/guides/references/configuration#module-api)
- [Our Express API Testing Guide](../express-api-project/README.md) for comparison
