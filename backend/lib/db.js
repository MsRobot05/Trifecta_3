const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      repo_url TEXT NOT NULL,
      filename TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'professional',
      diff TEXT NOT NULL,
      overall_score INTEGER,
      grade TEXT,
      summary TEXT,
      tldr TEXT,
      comments JSONB,
      metrics JSONB,
      languages TEXT[],
      quick_wins TEXT[],
      badges TEXT[],
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Migration: add new columns if they don't exist (safe to run multiple times)
  const newCols = [
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS grade TEXT",
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS tldr TEXT",
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS metrics JSONB",
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS languages TEXT[]",
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS quick_wins TEXT[]",
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS badges TEXT[]",
  ];
  for (const sql of newCols) {
    await pool.query(sql).catch(() => {});
  }

  console.log("DB ready");
}

module.exports = { pool, initDB };
