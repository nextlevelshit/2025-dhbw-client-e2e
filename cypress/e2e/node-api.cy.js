// cypress/e2e/node-api.cy.js

describe("Node Cache API GUI Tests", () => {
  const API_URL = Cypress.env("API_URL");
  const GUI_URL = "https://nextlevelshit.github.io/node-cache-api/";

  beforeEach(() => {
    // Clear all browser state for reproducible tests
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();

    // Visit the hosted GUI
    cy.visit(GUI_URL);

    // Wait for page to be fully loaded
    cy.get("h1").should("contain", "Cache API Interface");
  });

  describe.only("🗂️ GET Operations", () => {
    it.only("should fetch all keys successfully", () => {
      // Intercept the API call
      cy.intercept("GET", `${API_URL}`).as("getAllKeys");

      cy.log(API_URL);
      cy.pause({ log: false });

      // Click fetch all keys button
      cy.get("button").contains("Fetch All Keys").click();

      // Wait for API response
      cy.wait("@getAllKeys").then(({ response }) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.have.property("keys");
        expect(response.body.keys).to.be.an("array");
      });

      // Verify response display
      cy.get("#keysResponse").should("be.visible").and("have.class", "success");
    });

    it("should handle empty cache gracefully", () => {
      // Mock empty response
      cy.intercept("GET", `${API_URL}`, {
        statusCode: 200,
        body: { keys: [] },
      }).as("getEmptyKeys");

      cy.get("button").contains("Fetch All Keys").click();
      cy.wait("@getEmptyKeys");

      cy.get("#keysResponse")
        .should("be.visible")
        .and("contain", "Cache is empty 🗑️");
    });

    it("should fetch single item successfully", () => {
      const testKey = "1751559870911"; // Use timestamp-style key like the real API
      const testData = {
        payload: "test_data_1751559870886",
        meta: { created: "2025-07-03T16:24:30.886Z", test: true },
      };

      // Mock successful single item response
      cy.intercept("GET", `${API_URL}/${testKey}`, {
        statusCode: 200,
        body: testData,
      }).as("getSingleItem");

      // Enter key and fetch
      cy.get("#getKey").type(testKey);
      cy.get("button").contains("Fetch Item").click();

      cy.wait("@getSingleItem");

      // Verify response
      cy.get("#getResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", `Retrieved data for key: ${testKey}`)
        .and("contain", "test_data_1751559870886");

      // Verify auto-population of update field
      cy.get("#updateData").should("contain.value", "test_data_1751559870886");
    });

    it("should handle key not found error", () => {
      const nonexistentKey = "9999999999999"; // Timestamp that doesn't exist

      // Mock 404 response
      cy.intercept("GET", `${API_URL}/${nonexistentKey}`, {
        statusCode: 404,
        body: { error: "Key not found" },
      }).as("getNotFound");

      cy.get("#getKey").type(nonexistentKey);
      cy.get("button").contains("Fetch Item").click();

      cy.wait("@getNotFound");

      cy.get("#getResponse")
        .should("be.visible")
        .and("have.class", "error")
        .and("contain", "Key not found");
    });

    it("should validate required key input", () => {
      // Try to fetch without entering a key
      cy.get("button").contains("Fetch Item").click();

      cy.get("#getResponse")
        .should("be.visible")
        .and("have.class", "error")
        .and("contain", "Please enter a key");
    });
  });

  describe("📝 CREATE Operations", () => {
    it("should create new item successfully", () => {
      const testData = {
        payload: "test creation",
        meta: { created: new Date().toISOString() },
      };
      const generatedKey = Date.now().toString(); // API generates timestamp keys

      // Mock successful creation
      cy.intercept("POST", `${API_URL}`, {
        statusCode: 200,
        body: { key: generatedKey, data: testData },
      }).as("createItem");

      // Mock keys refresh after creation
      cy.intercept("GET", `${API_URL}`, {
        statusCode: 200,
        body: { keys: [generatedKey] },
      }).as("refreshKeys");

      // Enter JSON data
      cy.get("#postData").type(JSON.stringify(testData));
      cy.get("button").contains("Create Item").click();

      cy.wait("@createItem").then(({ request }) => {
        expect(request.body).to.deep.equal(testData);
      });

      // Verify success response
      cy.get("#postResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "Item created successfully")
        .and("contain", generatedKey);

      // Verify form is cleared
      cy.get("#postData").should("have.value", "");

      // Verify keys are auto-refreshed
      cy.wait("@refreshKeys");
    });

    it("should handle invalid JSON gracefully", () => {
      const invalidJson = '{"invalid": json}';

      cy.get("#postData").type(invalidJson);
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

      // Verify sample data is populated
      cy.get("#postData")
        .should("not.have.value", "")
        .then(($textarea) => {
          const value = $textarea.val();
          expect(() => JSON.parse(value)).to.not.throw();
        });
    });

    it("should handle server errors", () => {
      const testData = { test: "data" };

      // Mock server error
      cy.intercept("POST", `${API_URL}`, {
        statusCode: 500,
        body: "Internal Server Error",
      }).as("createError");

      cy.get("#postData").type(JSON.stringify(testData));
      cy.get("button").contains("Create Item").click();

      cy.wait("@createError");

      cy.get("#postResponse")
        .should("be.visible")
        .and("have.class", "error")
        .and("contain", "HTTP 500");
    });
  });

  describe("✏️ UPDATE Operations", () => {
    it("should update existing item successfully", () => {
      const testKey = "1751559870911"; // Use realistic timestamp key
      const updatedData = {
        message: "updated content",
        timestamp: Date.now(),
      };

      // Mock successful update
      cy.intercept("PUT", `${API_URL}/${testKey}`, {
        statusCode: 200,
        body: { key: testKey, data: updatedData },
      }).as("updateItem");

      // Mock GET request for verification (when GET key field matches)
      cy.intercept("GET", `${API_URL}/${testKey}`, {
        statusCode: 200,
        body: updatedData,
      }).as("verifyUpdate");

      // Enter key and data
      cy.get("#updateKey").type(testKey);
      cy.get("#updateData").type(JSON.stringify(updatedData));
      cy.get("button").contains("Update Item").click();

      cy.wait("@updateItem").then(({ request }) => {
        expect(request.body).to.deep.equal(updatedData);
      });

      // Verify success response
      cy.get("#updateResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "Item updated successfully")
        .and("contain", testKey);
    });

    it("should load existing data for update", () => {
      const testKey = "1751559870911";
      const existingData = {
        payload: "test_data_1751559870886",
        meta: { created: "2025-07-03T16:24:30.886Z", test: true },
      };

      // Mock GET request for loading
      cy.intercept("GET", `${API_URL}/${testKey}`, {
        statusCode: 200,
        body: existingData,
      }).as("loadData");

      // Enter key and load data
      cy.get("#updateKey").type(testKey);
      cy.get("button").contains("Load Selected Key").click();

      cy.wait("@loadData");

      // Verify data is loaded into update field
      cy.get("#updateData").should("contain.value", "test_data_1751559870886");
      cy.get("#updateResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", `Loaded current data for key: ${testKey}`);
    });

    it("should handle key not found on load", () => {
      const nonexistentKey = "9999999999999";

      // Mock 404 response
      cy.intercept("GET", `${API_URL}/${nonexistentKey}`, {
        statusCode: 404,
      }).as("loadNotFound");

      cy.get("#updateKey").type(nonexistentKey);
      cy.get("button").contains("Load Selected Key").click();

      cy.wait("@loadNotFound");

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
      cy.get("#updateKey").type("1751559870911");
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
  });

  describe("📊 Cache Management", () => {
    it("should display cache statistics", () => {
      const mockStats = {
        keys: ["1751559870911", "1751559870912", "1751559870913"],
      };

      cy.intercept("GET", `${API_URL}`, {
        statusCode: 200,
        body: mockStats,
      }).as("getStats");

      cy.get("button").contains("Refresh Stats").click();

      cy.wait("@getStats");

      cy.get("#statsResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "Cache Statistics")
        .and("contain", "Total items: 3")
        .and("contain", "1751559870911, 1751559870912, 1751559870913");
    });

    it("should clear cache with confirmation", () => {
      // Mock successful cache clear
      cy.intercept("DELETE", `${API_URL}`, {
        statusCode: 200,
        body: { message: "Cache cleared" },
      }).as("clearCache");

      // Mock empty keys after clear
      cy.intercept("GET", `${API_URL}`, {
        statusCode: 200,
        body: { keys: [] },
      }).as("refreshAfterClear");

      // Click clear cache and confirm
      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(true);
      });

      cy.get("button").contains("Clear Cache").click();

      cy.wait("@clearCache");

      cy.get("#statsResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "Cache cleared successfully");

      // Verify keys are refreshed
      cy.wait("@refreshAfterClear");
    });

    it("should cancel cache clear on user rejection", () => {
      // Stub confirmation dialog to return false
      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(false);
      });

      cy.get("button").contains("Clear Cache").click();

      // Should not make any API calls
      cy.get("#statsResponse").should("not.be.visible");
    });

    it("should run comprehensive CRUD test", () => {
      // Use realistic timestamp keys that API would generate
      const testKey = Date.now().toString();
      const originalData = { message: "original", created: Date.now() };
      const updatedData = { message: "updated", modified: Date.now() };

      // Mock CREATE - API generates the key
      cy.intercept("POST", `${API_URL}`, {
        statusCode: 200,
        body: { key: testKey, data: originalData },
      }).as("crudCreate");

      // Mock READ operations
      cy.intercept("GET", `${API_URL}/${testKey}`, {
        statusCode: 200,
        body: originalData,
      }).as("crudRead");

      // Mock UPDATE
      cy.intercept("PUT", `${API_URL}/${testKey}`, {
        statusCode: 200,
        body: { key: testKey, data: updatedData },
      }).as("crudUpdate");

      // Mock verification READ - return updated data
      cy.intercept("GET", `${API_URL}/${testKey}`, {
        statusCode: 200,
        body: updatedData,
      }).as("crudVerify");

      // Mock keys refresh
      cy.intercept("GET", `${API_URL}`, {
        statusCode: 200,
        body: { keys: [testKey] },
      }).as("crudRefresh");

      cy.get("button").contains("Test CRUD Operations").click();

      // Verify all operations are called
      cy.wait("@crudCreate");
      cy.wait("@crudRead");
      cy.wait("@crudUpdate");
      cy.wait("@crudVerify");
      cy.wait("@crudRefresh");

      cy.get("#statsResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "CRUD test completed")
        .and("contain", "✅ Created with key")
        .and("contain", "✅ Retrieved data successfully")
        .and("contain", "✅ Updated successfully")
        .and("contain", "✅ Update verified: true");
    });

    it("should run quick comprehensive test", () => {
      const testKey = Date.now().toString();
      const testData = {
        payload: "test_data_" + Date.now(),
        meta: { created: new Date().toISOString(), test: true },
      };

      // Mock initial state
      cy.intercept("GET", `${API_URL}`, {
        statusCode: 200,
        body: { keys: [] },
      }).as("initialState");

      // Mock POST
      cy.intercept("POST", `${API_URL}`, {
        statusCode: 200,
        body: { key: testKey },
      }).as("quickPost");

      // Mock GET
      cy.intercept("GET", `${API_URL}/${testKey}`, {
        statusCode: 200,
        body: testData,
      }).as("quickGet");

      // Mock final state
      cy.intercept("GET", `${API_URL}`, {
        statusCode: 200,
        body: { keys: [testKey] },
      }).as("finalState");

      // Mock keys refresh
      cy.intercept("GET", `${API_URL}`, {
        statusCode: 200,
        body: { keys: [testKey] },
      }).as("quickRefresh");

      cy.get("button").contains("Run Full Test").click();

      cy.wait("@initialState");
      cy.wait("@quickPost");
      cy.wait("@quickGet");
      cy.wait("@finalState");
      cy.wait("@quickRefresh");

      cy.get("#statsResponse")
        .should("be.visible")
        .and("have.class", "success")
        .and("contain", "Test sequence completed")
        .and("contain", "POST successful")
        .and("contain", "GET successful");
    });
  });

  describe("🔄 User Interactions", () => {
    it("should support Enter key for GET operations", () => {
      const testKey = "1751559870911";

      cy.intercept("GET", `${API_URL}/${testKey}`, {
        statusCode: 200,
        body: { test: "data" },
      }).as("enterKeyGet");

      cy.get("#getKey").type(`${testKey}{enter}`);

      cy.wait("@enterKeyGet");

      cy.get("#getResponse").should("be.visible").and("have.class", "success");
    });

    it("should support Enter key for loading update data", () => {
      const testKey = "1751559870911";

      cy.intercept("GET", `${API_URL}/${testKey}`, {
        statusCode: 200,
        body: { existing: "data" },
      }).as("enterKeyLoad");

      cy.get("#updateKey").type(`${testKey}{enter}`);

      cy.wait("@enterKeyLoad");

      cy.get("#updateResponse")
        .should("be.visible")
        .and("have.class", "success");
    });

    it("should auto-load keys on page load", () => {
      cy.intercept("GET", `${API_URL}`, {
        statusCode: 200,
        body: { keys: ["1751559870911"] },
      }).as("autoLoad");

      // Refresh page to trigger auto-load
      cy.reload();

      cy.wait("@autoLoad");

      cy.get("#keysResponse")
        .should("be.visible")
        .and("contain", "1751559870911");
    });

    it("should handle clickable key selection", () => {
      const clickableKey = "1751559870911";

      // Mock keys with clickable key
      cy.intercept("GET", `${API_URL}`, {
        statusCode: 200,
        body: { keys: [clickableKey] },
      }).as("getClickableKeys");

      // Mock GET for selected key
      cy.intercept("GET", `${API_URL}/${clickableKey}`, {
        statusCode: 200,
        body: {
          payload: "test_data_1751559870886",
          meta: { created: "2025-07-03T16:24:30.886Z", test: true },
        },
      }).as("selectKey");

      // Load keys first
      cy.get("button").contains("Fetch All Keys").click();
      cy.wait("@getClickableKeys");

      // Click on the key
      cy.get(".key-item").contains(clickableKey).click();

      cy.wait("@selectKey");

      // Verify key is populated in input fields
      cy.get("#getKey").should("have.value", clickableKey);
      cy.get("#updateKey").should("have.value", clickableKey);
    });
  });

  describe("🚨 Error Scenarios", () => {
    it("should handle network errors gracefully", () => {
      // Force network error
      cy.intercept("GET", `${API_URL}`, { forceNetworkError: true }).as(
        "networkError",
      );

      cy.get("button").contains("Fetch All Keys").click();

      cy.wait("@networkError");

      cy.get("#keysResponse")
        .should("be.visible")
        .and("have.class", "error")
        .and("contain", "Network error");
    });

    it("should handle server timeouts", () => {
      // Mock slow response
      cy.intercept("GET", `${API_URL}`, (req) => {
        req.reply({ delay: 30000, statusCode: 408 });
      }).as("timeout");

      cy.get("button").contains("Fetch All Keys").click();

      cy.wait("@timeout");

      cy.get("#keysResponse").should("be.visible").and("have.class", "error");
    });

    it("should handle malformed API responses", () => {
      // Mock invalid JSON response
      cy.intercept("GET", `${API_URL}`, {
        statusCode: 200,
        body: "invalid json response",
      }).as("malformedResponse");

      cy.get("button").contains("Fetch All Keys").click();

      cy.wait("@malformedResponse");

      cy.get("#keysResponse").should("be.visible").and("have.class", "error");
    });
  });
});
