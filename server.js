// Import necessary modules
import express from "express";
import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import route handlers
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import exchangeRatesRouter from "./routes/exchangeRates.js";

// Import Prisma client for database operations
import prisma from "./constats/config.js";

const app = express(); // Initialize the Express application
const port = process.env.SERVER_PORT || 3001; // Set the server port from environment variables or default to 3001

// Resolve the current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, "clientBuild")));

// Enable CORS (Cross-Origin Resource Sharing)
// Add allowed origins for frontend communication
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://budgetly-0ige.onrender.com",
    ], // Allowed origins
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE", "PATCH"], // Allowed HTTP methods
    credentials: true, // Allow cookies and credentials
  })
);

app.options("*", cors()); // Handle preflight requests

// Configure session management
app.use(
  expressSession({
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict", // Set cookie policy
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time (7 days)
    },
    secret: "a santa at nasa", // Secret key for signing the session ID
    resave: true, // Force session to be saved even if not modified
    saveUninitialized: true, // Save uninitialized sessions
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // Period to check and remove expired sessions (2 minutes)
      dbRecordIdIsSessionId: true, // Use session ID as the database record ID
      dbRecordIdFunction: undefined, // Custom function for generating session IDs (optional)
    }),
  })
);

// Middleware to parse JSON and URL-encoded data
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Register API routes
app.use("/api", authRoutes); // Authentication routes
app.use("/api", userRoutes); // User-related routes
app.use("/api", transactionRoutes); // Transaction-related routes
app.use("/api", categoriesRoutes); // Categories-related routes
app.use("/api/exchange-rates", exchangeRatesRouter); // Exchange rates routes

// Catch-all route to serve the React app for any unmatched routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "clientBuild", "index.html"));
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`🚀 Server running at: http://localhost:${port}`);
});
