import request from "supertest"; // Supertest for HTTP assertions
import app from "./server.js"; // Import the Express app

describe("API Endpoints", () => {
  // Test for the /api/exchange-rates endpoint
  describe("GET /api/exchange-rates", () => {
    it("should return exchange rates for a valid base currency", async () => {
      const response = await request(app)
        .get("/api/exchange-rates")
        .query({ base: "USD" });
      expect(response.status).toBe(200); // Expect HTTP status 200
      expect(response.body).toHaveProperty("conversion_rates"); // Check if response contains conversion rates
    });

    it("should return 400 if base currency is missing", async () => {
      const response = await request(app).get("/api/exchange-rates");
      expect(response.status).toBe(400); // Expect HTTP status 400
      expect(response.body).toHaveProperty(
        "message",
        "Base currency is required"
      );
    });
  });

  // Test for the /api/transactions endpoint
  describe("GET /api/transactions", () => {
    it("should return a list of transactions", async () => {
      const response = await request(app).get("/api/transactions");
      expect(response.status).toBe(200); // Expect HTTP status 200
      expect(Array.isArray(response.body)).toBe(true); // Check if response is an array
    });
  });

  // Test for the /api/transaction POST endpoint
  describe("POST /api/transaction", () => {
    it("should create a new transaction", async () => {
      const newTransaction = {
        title: "Test Transaction",
        money: 100,
        date: "2025-05-01",
        transactionCategoryId: "12345",
      };

      const response = await request(app)
        .post("/api/transaction")
        .send(newTransaction);
      expect(response.status).toBe(201); // Expect HTTP status 201
      expect(response.body).toHaveProperty("id"); // Check if response contains the transaction ID
      expect(response.body.title).toBe(newTransaction.title); // Verify the title
    });

    it("should return 400 if required fields are missing", async () => {
      const incompleteTransaction = {
        title: "Incomplete Transaction",
      };

      const response = await request(app)
        .post("/api/transaction")
        .send(incompleteTransaction);
      expect(response.status).toBe(400); // Expect HTTP status 400
      expect(response.body).toHaveProperty("message"); // Check for an error message
    });
  });
});
