const express = require("express");
const router = express.Router();
const { pool } = require("../lib/db");

// GET /api/history
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const { rows } = await pool.query(
      `SELECT id, repo_url, filename, mode, overall_score, grade, summary, tldr, languages, badges, created_at
       FROM reviews
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error("History error:", err.message);
    res.status(500).json({ error: "Failed to load review history" });
  }
});

// GET /api/history/:id — single review detail
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM reviews WHERE id = $1",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Review not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("History detail error:", err.message);
    res.status(500).json({ error: "Failed to load review" });
  }
});

module.exports = router;
