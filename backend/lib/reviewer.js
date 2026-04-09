const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPTS = {
  professional: `You are a principal software engineer at a top tech company, conducting a thorough and professional code review. 
Your reviews are precise, constructive, and focused on correctness, security, performance, and maintainability.
You give specific, actionable feedback. You acknowledge good practices when you see them.
Be direct, professional, and respectful. Use clear technical language.`,

  senior: `You are a grumpy but legendary senior engineer who has been burned by bad code too many times in production.
You've seen every possible catastrophe — SQL injections, race conditions, memory leaks at 3am.
You don't sugarcoat things, but you always explain WHY something is wrong and HOW to fix it properly.
You occasionally say things like "I've seen this exact bug cost a company $2M" or drop a disappointed sigh.
You are blunt but your goal is to genuinely make the developer better. Tough love.`,

  brutal: `You are a legendary 10x engineer who has zero patience for bad code and an unstoppable need to roast it.
You are savage, sarcastic, and brutally honest. Think: Gordon Ramsay meets Linus Torvalds after an all-nighter.
You WILL mock bad variable names with flair. You WILL describe obvious bugs with dramatic theatrical horror.
You say things like "What in the actual stack trace is THIS?" and "Did a sleep-deprived intern write this with oven mitts?"
BUT — and this is crucial — you always end each comment with the precise, correct fix. Savage but educational.
You are an entertainer who also genuinely teaches. Never just roast without fixing.`,
};

async function reviewCode(diff, mode = "professional") {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }

  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.professional;
  const truncatedDiff = diff.slice(0, 10000);

  const userPrompt = `Review this code and return a JSON object ONLY (no markdown fences, no explanation outside JSON):

\`\`\`diff
${truncatedDiff}
\`\`\`

Return exactly this JSON structure:
{
  "overall_score": <integer 0-100, where 100 is perfect production-ready code>,
  "grade": <"S" | "A" | "B" | "C" | "D" | "F">,
  "summary": "<2-3 sentence overall verdict, be specific about what you found>",
  "tldr": "<one punchy memorable headline verdict — like a newspaper headline for this code's fate>",
  "comments": [
    {
      "line": <line number integer or null>,
      "severity": <"critical" | "warning" | "nitpick" | "praise">,
      "title": "<short issue title, 5 words max>",
      "message": "<detailed explanation — what's wrong, why it matters, real-world impact>",
      "fix": "<corrected code snippet as a string, or null>"
    }
  ],
  "metrics": {
    "security": <0-100>,
    "performance": <0-100>,
    "readability": <0-100>,
    "best_practices": <0-100>
  },
  "languages": ["<detected programming languages>"],
  "quick_wins": ["<up to 3 short actionable fixes the dev can do RIGHT NOW — be specific>"],
  "badges": ["<relevant badges from ONLY this exact list: SQL Injection Risk, Memory Leak, No Tests, Eval Danger, Magic Numbers, Missing Error Handling, Good Naming, Well Documented, Clean Architecture, DRY Violation, God Function, Hardcoded Secrets>"]
}

Rules:
- Include 4-8 comments total.
- At least 1 comment must be "praise" if ANYTHING is done well. If nothing is good, skip praise.
- Be precise about line numbers when referencing specific lines.
- Score honestly: buggy/insecure code should score below 50. Perfect clean code is 90+.
- quick_wins should be concrete and immediately actionable, not generic advice.
- Only use badge names from the provided list exactly as written.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 2500,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error("AI returned an empty response");
  
  // Strip markdown fences if model accidentally included them
  const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned an invalid response format");
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  // Validate and sanitize
  if (typeof parsed.overall_score !== "number") parsed.overall_score = 50;
  parsed.overall_score = Math.max(0, Math.min(100, Math.round(parsed.overall_score)));
  if (!["S","A","B","C","D","F"].includes(parsed.grade)) parsed.grade = "C";
  if (!Array.isArray(parsed.comments)) parsed.comments = [];
  if (!parsed.metrics || typeof parsed.metrics !== "object") parsed.metrics = {};
  if (!Array.isArray(parsed.languages)) parsed.languages = [];
  if (!Array.isArray(parsed.quick_wins)) parsed.quick_wins = [];
  if (!Array.isArray(parsed.badges)) parsed.badges = [];

  return parsed;
}

module.exports = { reviewCode };
