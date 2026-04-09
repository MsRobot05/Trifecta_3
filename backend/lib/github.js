const axios = require("axios");

// Accepts: https://github.com/owner/repo/pull/123  OR  owner/repo/pull/123
async function fetchPRDiff(input) {
  const match = input.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/) ||
                input.match(/^([^/]+)\/([^/]+)\/pull\/(\d+)$/);
  if (!match) throw new Error("Invalid GitHub PR URL. Use: https://github.com/owner/repo/pull/123");

  const [, owner, repo, pull_number] = match;
  const headers = { Accept: "application/vnd.github.v3.diff" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;

  const { data: diff } = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`,
    { headers }
  );

  // Also get PR metadata
  const metaHeaders = { Accept: "application/vnd.github.v3+json" };
  if (process.env.GITHUB_TOKEN) metaHeaders.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  const { data: meta } = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`,
    { headers: metaHeaders }
  );

  return {
    diff,
    title: meta.title,
    author: meta.user.login,
    repo: `${owner}/${repo}`,
    pr_number: pull_number,
  };
}

// Accepts raw code paste directly
function codeToFakeDiff(code, filename = "code.js") {
  const lines = code.split("\n").map((l) => `+${l}`).join("\n");
  return {
    diff: `diff --git a/${filename} b/${filename}\n--- /dev/null\n+++ b/${filename}\n@@ -0,0 +1 @@\n${lines}`,
    title: "Direct code review",
    author: "anonymous",
    repo: "direct-paste",
    pr_number: "0",
  };
}

module.exports = { fetchPRDiff, codeToFakeDiff };
