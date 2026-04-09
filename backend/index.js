require("dotenv").config();
const express = require("express");
const cors = require("cors");
const reviewRoutes = require("./routes/review");
const historyRoutes = require("./routes/history");
const { initDB } = require("./lib/db");

const app = express();

// CORS — allow frontend origins
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"]
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "2mb" }));

// Health check
app.get("/", (req, res) => res.json({
  status: "GhostPR backend alive",
  version: "2.0.0",
  timestamp: new Date().toISOString(),
}));

app.get("/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/api/review", reviewRoutes);
app.use("/api/history", historyRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`👻 GhostPR backend running on port ${PORT}`);
      console.log(`   OPENAI_API_KEY:    ${process.env.OPENAI_API_KEY ? "✓ set" : "✗ MISSING"}`);
      console.log(`   DATABASE_URL:      ${process.env.DATABASE_URL ? "✓ set" : "✗ MISSING"}`);
    });
  })
  .catch(err => {
    console.error("Failed to initialize database:", err.message);
    console.error("Server will start anyway — DB features will be unavailable");
    app.listen(PORT, () => console.log(`👻 GhostPR backend running on port ${PORT} (no DB)`));
  });
