# Cypress E2E Client Testing

Learn modern end-to-end testing with Cypress using ES6 modules and best practices.
This workshop follows the same architectural patterns as our [Express Cache API](https://github.com/nextlevelshit/node-cache-api).

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
│   ├── calculator.cy.js      # Network interception patterns
│   ├── chess.cy.js           # State management & cookie handling
│   ├── node-api.cy.js        # Node.js API testing
│   └── todo.cy.js            # CRUD operations (template)
├── fixtures/                 # Test data and configuration
│   ├── credentials.json      # Placeholder for auth credentials
│   └── userSettings.json     # Placeholder for user preferences
├── plugins/                  # Custom Cypress plugins
├── support/
│   ├── commands.js           # Custom Cypress commands
│   └── e2e.js                # Global setup
└── cypress.config.mjs        # ES6 configuration
```

## Key Characteristics

- **Real browser** - actual Chromium/Firefox instance
- **Real DOM** - genuine user interactions (clicks, typing, scrolling)
- **Real rendering** - CSS, JavaScript, async operations
- **Cross-origin requests** - client ↔ server communication
- **User perspective** - exactly what users see and do

## Key Patterns

### 1. Modern ES6 Configuration

```javascript
// cypress.config.mjs - ES6 style
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

### 2. Network Interception & Response Validation

```javascript
// Real-world API testing from calculator.cy.js
it("should perform basic math", () => {
  cy.intercept("/calc", (req) => {
    // Mock or modify requests/responses
  }).as("calcRequest");

  // Perform UI actions
  // ...

  // Validate network response
  cy.wait("@calcRequest").then(({ response }) => {
    expect(response.body.status).to.equal("ok");
    expect(response.body.results[0].in).to.equal("2+3");
    expect(response.body.results[0].out).to.equal("5");
  });
});
```

### 3. State Management & Session Handling

```javascript
// Reproducible test state from chess.cy.js
beforeEach(() => {
  // Full state reset for consistent tests
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();

  cy.visit("https://www.chess.com/play/online");

  // Handle dynamic consent dialogs
  cy.get("#onetrust-reject-all-handler", { timeout: 10_000 }).click();
});
```

### 4. Fixture-Driven Testing

```javascript
// Use fixtures for test data management
cy.fixture("credentials").then((creds) => {
  cy.login(creds.valid.email, creds.valid.password);
});

// Multiple fixtures for different scenarios
cy.fixture("userSettings").then((settings) => {
  cy.configureUserPreferences(settings.theme, settings.language);
});
```

### 5. Custom Commands

```javascript
// cypress/support/commands.js
Cypress.Commands.add("login", (email, password) => {
  cy.get("[data-cy=email]").type(email);
  cy.get("[data-cy=password]").type(password);
  cy.get("[data-cy=submit]").click();
});
```

## API Testing Integration

Test your Cache API using the hosted GUI interface:

**Live Demo**: https://nextlevelshit.github.io/node-cache-api/

```javascript
// Test your local API through the hosted interface
describe("Cache API Integration", () => {
  beforeEach(() => {
    cy.visit("https://nextlevelshit.github.io/node-cache-api/");
  });

  it("should perform CRUD operations", () => {
    // Test CREATE operation
    cy.get("#postData").type('{"test": "data"}');
    cy.get("button").contains("Create Item").click();

    // Verify success response
    cy.get("#postResponse")
      .should("be.visible")
      .and("contain", "Item created successfully");

    // Test READ operation
    cy.get("#getKey").type("generated-key-from-create");
    cy.get("button").contains("Fetch Item").click();

    // Verify data retrieval
    cy.get("#getResponse")
      .should("be.visible")
      .and("contain", "Retrieved data");
  });

  it("should handle API errors gracefully", () => {
    // Test error scenarios
    cy.get("#getKey").type("nonexistent-key");
    cy.get("button").contains("Fetch Item").click();

    // Verify error handling
    cy.get("#getResponse")
      .should("be.visible")
      .and("have.class", "error")
      .and("contain", "Key not found");
  });
});
```

## Testing Philosophy

Following the four-tier testing strategy from our Express API:

1. **Static Analysis** → ESLint for Cypress specs
2. **Unit Tests** → Individual command testing
3. **Integration Tests** → Component interaction
4. **E2E Tests** → Full user journeys ← **You are here**

## Common Patterns

### Error Handling & Visual Feedback

```javascript
// Test both success and error states
cy.get("#getResponse")
  .should("be.visible")
  .and("have.class", "error") // Visual error styling
  .and("contain", "Key not found"); // Error message content
```

### Dynamic Content & Timeouts

```javascript
// Handle dynamic loading with appropriate timeouts
cy.get("#guest-button", { timeout: 10_000 }).click();
```

### Comprehensive Test Scenarios

```javascript
// Real CRUD testing pattern
it("should handle full CRUD lifecycle", () => {
  // CREATE → READ → UPDATE → DELETE
  // Each step validates both UI and API responses
});
```

## Resources

- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [ES6 Modules in Cypress](https://docs.cypress.io/guides/references/configuration#module-api)
- [Network Interception Guide](https://docs.cypress.io/guides/guides/network-requests)
- [Cache API Live Demo](https://nextlevelshit.github.io/node-cache-api/)
- [Our Express API Testing Guide](https://github.com/nextlevelshit/node-cache-api/README.md) for comparison
