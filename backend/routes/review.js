const express = require("express");
const router = express.Router();
const { fetchPRDiff, codeToFakeDiff } = require("../lib/github");
const { reviewCode } = require("../lib/reviewer");
const { pool } = require("../lib/db");

const MAX_INPUT_LENGTH = 50000;
const VALID_MODES = ["professional", "senior", "brutal"];

// POST /api/review
router.post("/", async (req, res) => {
  try {
    const { type = "code", input, mode = "professional", filename = "code.js" } = req.body;

    // Validation
    if (!input || typeof input !== "string") {
      return res.status(400).json({ error: "input is required and must be a string" });
    }
    if (input.trim().length === 0) {
      return res.status(400).json({ error: "input cannot be empty" });
    }
    if (input.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({ error: `Input too large. Maximum ${MAX_INPUT_LENGTH.toLocaleString()} characters allowed.` });
    }
    if (!VALID_MODES.includes(mode)) {
      return res.status(400).json({ error: `Invalid mode. Must be one of: ${VALID_MODES.join(", ")}` });
    }
    if (type === "pr" && !input.includes("github.com") && !input.match(/^[^/]+\/[^/]+\/pull\/\d+$/)) {
      return res.status(400).json({ error: "Invalid GitHub PR URL format. Use: https://github.com/owner/repo/pull/123" });
    }

    let diffData;
    if (type === "pr") {
      diffData = await fetchPRDiff(input);
    } else {
      diffData = codeToFakeDiff(input, filename);
    }

    if (!diffData.diff || diffData.diff.trim().length === 0) {
      return res.status(400).json({ error: "No code content found to review" });
    }

    const review = await reviewCode(diffData.diff, mode);

    // Persist to DB (don't fail the request if DB write fails)
    let dbRow = null;
    try {
      const { rows } = await pool.query(
        `INSERT INTO reviews 
          (repo_url, filename, mode, diff, overall_score, grade, summary, tldr, comments, metrics, languages, quick_wins, badges)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING id, created_at`,
        [
          diffData.repo,
          diffData.title || filename,
          mode,
          diffData.diff.slice(0, 5000),
          review.overall_score,
          review.grade,
          review.summary,
          review.tldr || null,
          JSON.stringify(review.comments),
          JSON.stringify(review.metrics),
          review.languages || [],
          review.quick_wins || [],
          review.badges || [],
        ]
      );
      dbRow = rows[0];
    } catch (dbErr) {
      console.error("DB write failed (non-fatal):", dbErr.message);
    }

    res.json({
      id: dbRow?.id || null,
      created_at: dbRow?.created_at || new Date().toISOString(),
      meta: {
        repo: diffData.repo,
        title: diffData.title,
        author: diffData.author,
        pr_number: diffData.pr_number,
      },
      mode,
      ...review,
    });
  } catch (err) {
    console.error("Review error:", err.message);

    // Friendly error messages
    let message = err.message;
    if (err.message?.includes("OPENAI_API_KEY")) {
      message = "API key is not configured. Add OPENAI_API_KEY to backend .env";
    } else if (err.message?.includes("rate_limit")) {
      message = "Rate limit reached. Please wait a moment and try again.";
    } else if (
      err.message?.toLowerCase().includes("incorrect api key") ||
      err.message?.toLowerCase().includes("invalid api key") ||
      err.message?.toLowerCase().includes("invalid_api_key") ||
      err.code === "invalid_api_key" ||
      err.status === 401
    ) {
      message = "Invalid API key. Update OPENAI_API_KEY in backend/.env, then restart backend.";
    } else if (err.message?.includes("GitHub")) {
      message = err.message;
    } else if (err.message?.includes("JSON")) {
      message = "AI returned an unexpected response. Please try again.";
    }

    res.status(500).json({ error: message });
  }
});

module.exports = router;
