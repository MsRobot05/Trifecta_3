# 👻 GhostPR — AI Code Reviewer v2.0

> AI that reviews your code like a brutal senior engineer — catches bugs, security holes, and bad practices before your teammates do.

![GhostPR](https://img.shields.io/badge/Built%20with-Claude%20AI-8264ff?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node%20%2B%20PostgreSQL-blue?style=flat-square)
![Hackathon](https://img.shields.io/badge/Trifecta%20Challenge-2026-b090ff?style=flat-square)

---

## What it does

Paste any code (or drop a GitHub PR URL) → select a review mode → get instant AI-powered code review with:

- **TL;DR headline verdict** — punchy one-line summary of your code's fate
- **Overall score** (0–100) + letter grade (S/A/B/C/D/F) with animated score ring
- **Inline comments** by severity: Critical / Warning / Nitpick / Praise
- **Fix suggestions** — collapsible code snippets for each issue, with copy button
- **Metrics**: Security, Performance, Readability, Best Practices (animated bars)
- **Issue Badges** — auto-detected tags like "SQL Injection Risk", "Hardcoded Secrets"
- **Quick Wins** — 3 concrete things you can fix right now
- **Language detection** from filename extension
- **Comment filter** — drill into just Criticals or just Praises
- **Share result** — copies a shareable one-liner to clipboard
- **Drag & drop file upload** — drop any code file into the textarea
- **Review History** — past reviews with grade orbs, animated score bars, avg stats
- **3 review modes**:
  - 💼 Professional — clean, constructive, respectful
  - 😤 Senior Dev — blunt, experienced, no BS
  - 💀 Brutal — Gordon Ramsay meets Linus Torvalds

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Fonts | Space Grotesk + Syne + JetBrains Mono |
| Backend | Node.js + Express |
| Database | PostgreSQL (Neon free tier) |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## ⚡ Local Setup

### Prerequisites
- Node.js 18+ (`node -v` to check)
- PostgreSQL or free [Neon](https://neon.tech) account
- Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
- GitHub Personal Access Token (optional, for PR URL reviews)

---

### Step 1 — Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```env
OPENAI_API_KEY=your-api-key-here
DATABASE_URL=postgresql://user:password@host:5432/ghostpr
GITHUB_TOKEN=ghp_optional_for_private_pr_reviews
PORT=4000
FRONTEND_URL=http://localhost:5173
```

Start:
```bash
npm run dev
```

You should see:
```
👻 GhostPR backend running on port 4000
   OPENAI_API_KEY:    ✓ set
   DATABASE_URL:      ✓ set
DB ready
```

---

### Step 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

### Step 3 — Verify

1. Click **🐛 Load buggy sample**
2. Select **💀 Brutal** mode
3. Hit **Roast My Code**
4. Watch it catch SQL injection, off-by-one, null dereference, and more

---

## Project Structure

```
ghostpr/
├── backend/
│   ├── index.js              # Express server (CORS, error handling, startup logs)
│   ├── .env.example
│   ├── lib/
│   │   ├── db.js             # PostgreSQL connection + auto-schema
│   │   ├── github.js         # GitHub PR diff fetcher
│   │   └── reviewer.js       # Claude AI prompts + validation
│   └── routes/
│       ├── review.js         # POST /api/review (with input validation)
│       └── history.js        # GET /api/history, GET /api/history/:id
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css         # Design system (Space Grotesk + Syne + CSS variables)
│   │   ├── pages/
│   │   │   ├── Home.jsx      # Mode selector, drag-drop, animated submit
│   │   │   ├── Results.jsx   # Animated score ring, metric bars, comment cards
│   │   │   └── History.jsx   # Grade orbs, score bars, aggregate stats
│   │   └── components/
│   │       └── Layout.jsx    # Nav + ambient glow orbs + footer
│   └── index.html            # Meta tags, OG tags, font preconnects
└── README.md
```

---

## API Reference

### POST /api/review

```json
{
  "type": "code",
  "input": "function bad() { var x = eval(userInput) }",
  "mode": "brutal",
  "filename": "utils.js"
}
```

**Response:**
```json
{
  "id": 42,
  "overall_score": 18,
  "grade": "F",
  "tldr": "A security disaster wearing the costume of JavaScript.",
  "summary": "Three critical vulnerabilities including RCE via eval...",
  "comments": [...],
  "metrics": { "security": 5, "performance": 55, "readability": 40, "best_practices": 20 },
  "languages": ["JavaScript"],
  "quick_wins": ["Replace eval() with JSON.parse()", "Use const instead of var", "Add try/catch"],
  "badges": ["Eval Danger", "Missing Error Handling"]
}
```

### GET /api/history?limit=50

Returns array of past reviews (most recent first).

### GET /api/history/:id

Returns full review by ID.

---

## Built at Trifecta Challenge 2026

Track 1: Blueprint to Build — Full Stack Development  
Theme 2: Next-Gen Platforms & Digital Experiences

**Good luck. Ship fast. 👻**
