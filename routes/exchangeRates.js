import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const router = express.Router();

// Retrieve the API key from environment variables
const apiKey = process.env.API_KEY;

// Replace with your chosen API's base URL
const EXCHANGE_RATES_API_URL = "https://v6.exchangerate-api.com/v6/";

router.get("/", async (req, res) => {
  const { base } = req.query; // Get the base currency from the query parameters

  if (!base) {
    return res.status(400).json({ message: "Base currency is required" });
  }

  try {
    // Make a GET request to the exchange rates API
    const response = await axios.get(
      `${EXCHANGE_RATES_API_URL}${apiKey}/latest/${base}`
    );
    res.status(200).json(response.data); // Send the exchange rates back to the frontend
  } catch (error) {
    // Improved error handling
    if (error.response) {
      console.error("Error response:", error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
      res.status(500).json({ message: "No response received from the API" });
    } else {
      console.error("Error setting up request:", error.message);
      res.status(500).json({ message: "Error setting up request" });
    }
  }
});

export default router;
