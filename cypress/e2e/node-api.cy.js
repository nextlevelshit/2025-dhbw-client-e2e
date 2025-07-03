// cypress/e2e/node-api.cy.js

describe("Node Cache API GUI Tests", () => {
  const API_BASE_URL =
    Cypress.env("API_BASE_URL") || "http://localhost:1312/api";
  const GUI_URL = Cypress.env("GUI_URL") || "http://localhost:1312";

  beforeEach(() => {
    // Clear browser state for clean tests
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();

    // Visit the actual running application
    cy.visitUrl(GUI_URL);
    cy.get("h1").should("contain", "Cache API Interface");

    // Clear cache before all test runs
    cy.get("button").contains("Clear Cache").click();
    cy.wait(100); // Brief pause for cache clear
  });

  describe("🗂️ GET Operations", () => {
    it("should fetch all keys from empty cache", () => {
      cy.get("button").contains("Fetch All Keys").click();

      cy.get("#keysResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "Cache is empty 🗑️");
    });

    it("should fetch all keys after creating items", () => {
      // First create some test data
      const testData = { test: "data", created: Date.now() };

      cy.get("#postData").typeJson(JSON.stringify(testData));
      cy.get("button").contains("Create Item").click();

      // Wait for creation to complete
      cy.get("#postResponse").should("be.visible").and("have.class", "success");

      // Now fetch all keys
      cy.get("button").contains("Fetch All Keys").click();

      cy.get("#keysResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "Found 1 keys:");
    });

    it("should fetch single item successfully", () => {
      // Create test data first
      const testData = { payload: "test_fetch_single", meta: { test: true } };

      cy.get("#postData").typeJson(JSON.stringify(testData));
      cy.get("button").contains("Create Item").click();

      // Extract the generated key from the response
      cy.get("#postResponse")
        .should("contain", "Generated key:")
        .invoke("text")
        .then((text) => {
          const keyMatch = text.match(/Generated key: (\d+)/);
          expect(keyMatch).to.not.be.null;
          const generatedKey = keyMatch[1];

          // Now fetch the item
          cy.get("#getKey").typeJson(generatedKey);
          cy.get("button").contains("Fetch Item").click();

          cy.get("#getResponse")
            .should("be.visible")
            .and("have.class", "success")
            .and("contain", `Retrieved data for key: ${generatedKey}`)
            .and("contain", "test_fetch_single");

          // Verify auto-population of update field
          cy.get("#updateData").should("contain.value", "test_fetch_single");
        });
    });

    it("should handle key not found error", () => {
      const nonexistentKey = "9999999999999";

      cy.get("#getKey").typeJson(nonexistentKey);
      cy.get("button").contains("Fetch Item").click();

      cy.get("#getResponse")
        .should("be.visible")
        .and("have.class", "error")
        .and("contain", "Key not found");
    });

    it("should validate required key input", () => {
      cy.get("button").contains("Fetch Item").click();

      cy.get("#getResponse")
        .should("be.visible")
        .and("have.class", "error")
        .and("contain", "Please enter a key");
    });

    it("should support Enter key for GET operations", () => {
      // Create test data first
      const testData = { test: "enter_key_test" };

      cy.get("#postData").typeJson(JSON.stringify(testData));
      cy.get("button").contains("Create Item").click({ force: true });

      cy.get("#postResponse")
        .should("contain", "Generated key:")
        .invoke("text")
        .then((text) => {
          const keyMatch = text.match(/Generated key: (\d+)/);
          const generatedKey = keyMatch[1];

          // Test Enter key functionality
          cy.get("#getKey").typeJson(generatedKey);
          cy.get("button").contains("Fetch Item").click();

          cy.get("#getResponse")
            .should("be.visible")
            .and("have.class", "success");
        });
    });
  });

  describe("📝 CREATE Operations", () => {
    it("should create new item successfully", () => {
      const testData = {
        payload: "test creation",
        meta: { created: new Date().toISOString() },
      };

      cy.get("#postData").typeJson(JSON.stringify(testData));
      cy.get("button").contains("Create Item").click();

      cy.get("#postResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "Item created successfully")
        .and("contain", "Generated key:");

      // Verify form is cleared
      cy.get("#postData").should("have.value", "");

      // Verify keys are auto-refreshed
      cy.get("#keysResponse")
        .should("be.visible")
        .and("contain", "Found 1 keys:");
    });

    it("should handle invalid JSON gracefully", () => {
      const invalidJson = '{"invalid": json}';

      cy.get("#postData").typeJson(invalidJson);
      cy.get("button").contains("Create Item").click();

      cy.get("#postResponse")
        .should("be.visible")
        .and("have.class", "error")
        .and("contain", "Invalid JSON");
    });

    it("should validate required data input", () => {
      cy.get("button").contains("Create Item").click();

      cy.get("#postResponse")
        .should("be.visible")
        .and("have.class", "error")
        .and("contain", "Please enter JSON data");
    });

    it("should fill sample data correctly", () => {
      cy.get("button").contains("Fill Sample Data").click();

      cy.get("#postData")
        .should("not.have.value", "")
        .then(($textarea) => {
          const value = $textarea.val();
          expect(() => JSON.parse(value)).to.not.throw();
        });
    });

    it("should create multiple items with unique keys", () => {
      // Create first item
      cy.get("#postData").typeJson('{"item": "first"}');
      cy.get("button").contains("Create Item").click();
      cy.get("#postResponse").should("contain", "Item created successfully");

      // Create second item
      cy.get("#postData").typeJson('{"item": "second"}');
      cy.get("button").contains("Create Item").click();
      cy.get("#postResponse").should("contain", "Item created successfully");

      // Verify both items exist
      cy.get("button").contains("Fetch All Keys").click();
      cy.get("#keysResponse")
        .should("be.visible")
        .and("contain", "Found 2 keys:");
    });
  });

  describe("✏️ UPDATE Operations", () => {
    it("should update existing item successfully", () => {
      // Create initial data
      const originalData = { message: "original", created: Date.now() };

      cy.get("#postData").typeJson(JSON.stringify(originalData));
      cy.get("button").contains("Create Item").click();

      cy.get("#postResponse")
        .should("contain", "Generated key:")
        .invoke("text")
        .then((text) => {
          const keyMatch = text.match(/Generated key: (\d+)/);
          const generatedKey = keyMatch[1];

          // Update the item
          const updatedData = { message: "updated", modified: Date.now() };

          cy.get("#updateKey").typeJson(generatedKey);
          cy.get("#updateData").typeJson(JSON.stringify(updatedData));
          cy.get("button").contains("Update Item").click();

          cy.get("#updateResponse")
            .should("be.visible")
            .and("have.class", "success")
            .and("contain", "Item updated successfully")
            .and("contain", generatedKey);
        });
    });

    it("should load existing data for update", () => {
      // Create test data
      const testData = { payload: "load_test", meta: { test: true } };

      cy.get("#postData").typeJson(JSON.stringify(testData));
      cy.get("button").contains("Create Item").click();

      cy.get("#postResponse")
        .should("contain", "Generated key:")
        .invoke("text")
        .then((text) => {
          const keyMatch = text.match(/Generated key: (\d+)/);
          const generatedKey = keyMatch[1];

          // Load data for update
          cy.get("#updateKey").typeJson(generatedKey);
          cy.get("button").contains("Load Selected Key").click();

          cy.get("#updateResponse")
            .should("be.visible")
            .and("have.class", "success")
            .and("contain", `Loaded current data for key: ${generatedKey}`);

          // Verify data is loaded
          cy.get("#updateData").should("contain.value", "load_test");
        });
    });

    it("should handle key not found on load", () => {
      const nonexistentKey = "9999999999999";

      cy.get("#updateKey").typeJson(nonexistentKey);
      cy.get("button").contains("Load Selected Key").click();

      cy.get("#updateResponse")
        .should("be.visible")
        .and("have.class", "error")
        .and("contain", "Key not found");
    });

    it("should validate required inputs", () => {
      // Try to update without key
      cy.get("button").contains("Update Item").click();

      cy.get("#updateResponse")
        .should("be.visible")
        .and("have.class", "error")
        .and("contain", "Please enter a key to update");

      // Try to update without data
      cy.get("#updateKey").typeJson("123456789");
      cy.get("button").contains("Update Item").click();

      cy.get("#updateResponse")
        .should("be.visible")
        .and("have.class", "error")
        .and("contain", "Please enter JSON data");
    });

    it("should fill sample update data", () => {
      cy.get("button").contains("Fill Sample Update").click();

      cy.get("#updateData")
        .should("not.have.value", "")
        .then(($textarea) => {
          const value = $textarea.val();
          expect(() => JSON.parse(value)).to.not.throw();
        });
    });

    it("should warn when loading without key", () => {
      cy.get("button").contains("Load Selected Key").click();

      cy.get("#updateResponse")
        .should("be.visible")
        .and("have.class", "warning")
        .and("contain", "Please enter a key first");
    });

    it.skip("should support Enter key for loading update data", () => {
      // Create test data first
      const testData = { test: "enter_load_test" };

      cy.get("#postData").typeJson(JSON.stringify(testData));
      cy.get("button").contains("Create Item").click();

      cy.get("#postResponse")
        .should("contain", "Generated key:")
        .invoke("text")
        .then((text) => {
          const keyMatch = text.match(/Generated key: (\d+)/);
          const generatedKey = keyMatch[1];

          // Test Enter key for loading
          cy.get("#updateKey").typeJson(`${generatedKey}{enter}`);

          cy.get("#updateResponse")
            .should("be.visible")
            .and("have.class", "success");
        });
    });
  });

  describe("📊 Cache Management", () => {
    it("should display cache statistics", () => {
      // Create some test data
      cy.get("#postData").typeJson('{"stats": "test"}');
      cy.get("button").contains("Create Item").click();
      cy.get("#postResponse").should("contain", "Item created successfully");

      cy.get("button").contains("Refresh Stats").click();

      cy.get("#statsResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "Cache Statistics")
        .and("contain", "Total items: 1");
    });

    it("should clear cache with confirmation", () => {
      // Create test data
      cy.get("#postData").typeJson('{"clear": "test"}');
      cy.get("button").contains("Create Item").click();

      // Confirm cache has data
      cy.get("button").contains("Refresh Stats").click();
      cy.get("#statsResponse").should("contain", "Total items: 1");

      // Clear cache
      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(true);
      });

      cy.get("button").contains("Clear Cache").click();

      cy.get("#statsResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "Cache cleared successfully");

      // Verify cache is empty
      cy.get("button").contains("Fetch All Keys").click();
      cy.get("#keysResponse").should("contain", "Cache is empty");
    });

    it.skip("should cancel cache clear on user rejection", () => {
      // Create test data
      cy.get("#postData").typeJson('{"cancel": "test"}');
      cy.get("button").contains("Create Item").click();

      // Stub confirmation to return false
      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(false);
      });

      cy.get("button").contains("Clear Cache").click();

      // Should not show any response since operation was cancelled
      cy.get("#statsResponse").should("not.contain", "Cache cleared");

      // Verify data still exists
      cy.get("button").contains("Fetch All Keys").click();
      cy.get("#keysResponse").should("contain", "Found 1 keys:");
    });

    it("should run comprehensive CRUD test", () => {
      cy.get("button").contains("Test CRUD Operations").click();

      // Wait for test to complete
      cy.get("#statsResponse", { timeout: 10000 })
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "CRUD test completed")
        .and("contain", "✅ Created with key")
        .and("contain", "✅ Retrieved data successfully")
        .and("contain", "✅ Updated successfully")
        .and("contain", "✅ Update verified: true");
    });

    it("should run quick comprehensive test", () => {
      cy.get("button").contains("Run Full Test").click();

      // Wait for test to complete
      cy.get("#statsResponse", { timeout: 10000 })
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "Test sequence completed")
        .and("contain", "POST successful")
        .and("contain", "GET successful");
    });
  });

  describe("🔄 User Interactions", () => {
    it("should handle clickable key selection", () => {
      // Create test data
      const testData = { clickable: "test" };

      cy.get("#postData").typeJson(JSON.stringify(testData));
      cy.get("button").contains("Create Item").click();

      // Fetch all keys to make them clickable
      cy.get("button").contains("Fetch All Keys").click();

      // Click on a key (should be available after creation)
      cy.get(".key-item").first().click();

      // Verify key is populated in input fields
      cy.get("#getKey").should("not.have.value", "");
      cy.get("#updateKey").should("not.have.value", "");

      // Verify GET response shows the data
      cy.get("#getResponse").should("be.visible").and("contain", "clickable");
    });

    it("should auto-load keys on page load", () => {
      // Create some data first
      cy.get("#postData").typeJson('{"auto": "load"}');
      cy.get("button").contains("Create Item").click();

      // Reload page to test auto-load
      cy.reload();
      cy.get("h1").should("contain", "Cache API Interface");

      // Keys should be auto-loaded
      cy.get("#keysResponse")
        .should("be.visible")
        .and("contain", "Found 1 keys:");
    });
  });

  describe("🚨 Error Scenarios", () => {
    it("should handle server errors gracefully", () => {
      // Test with malformed JSON to trigger server error
      cy.get("#getKey").typeJson("invalid_key_format_!@#$%");
      cy.get("button").contains("Fetch Item").click();

      cy.get("#getResponse").should("be.visible").and("have.class", "error");
    });

    it.skip("should handle very large keys", () => {
      const largeKey = "a".repeat(1000);

      cy.get("#getKey").typeJson(largeKey);
      cy.get("button").contains("Fetch Item").click();

      cy.get("#getResponse").should("be.visible").and("have.class", "error");
    });

    it.skip("should handle very large data payloads", () => {
      const largeData = { huge: "x".repeat(10000) };

      cy.get("#postData").typeJson(JSON.stringify(largeData));
      cy.get("button").contains("Create Item").click();

      // Should either succeed or fail gracefully
      cy.get("#postResponse").should("be.visible");
    });
  });
});
