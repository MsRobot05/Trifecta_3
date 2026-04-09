import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MODES = [
  {
    id: "professional",
    label: "Professional",
    icon: "💼",
    desc: "Clean, constructive, respectful",
    color: "#4d9fff",
    glow: "rgba(77,159,255,0.15)",
  },
  {
    id: "senior",
    label: "Senior Dev",
    icon: "😤",
    desc: "Blunt, experienced, no BS",
    color: "#ff7d3b",
    glow: "rgba(255,125,59,0.15)",
  },
  {
    id: "brutal",
    label: "Brutal",
    icon: "💀",
    desc: "Gordon Ramsay × Linus Torvalds",
    color: "#ff4d6a",
    glow: "rgba(255,77,106,0.15)",
  },
];

const SAMPLE_CODE = `function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  const result = db.execute(query);
  var data = result[0]
  if (data != null) {
    return data
  }
}

function calculateTotal(items) {
  let total = 0;
  for (var i = 0; i <= items.length; i++) {
    total = total + items[i].price * items[i].qty;
  }
  return total;
}`;

const LANGUAGE_HINTS = {
  ".js": "JS", ".jsx": "JSX", ".ts": "TS", ".tsx": "TSX",
  ".py": "Python", ".go": "Go", ".rs": "Rust", ".java": "Java",
  ".cs": "C#", ".cpp": "C++", ".rb": "Ruby", ".php": "PHP",
  ".swift": "Swift", ".kt": "Kotlin",
};

function LoadingOverlay({ mode }) {
  const msgs = {
    professional: ["Analyzing code structure…", "Checking security patterns…", "Reviewing best practices…"],
    senior:       ["Sighing deeply at your code…", "Counting the mistakes…", "Preparing a stern review…"],
    brutal:       ["Sharpening the roast…", "Finding every single flaw…", "Preparing savage feedback…"],
  };
  const [idx] = useState(() => Math.floor(Math.random() * 3));
  const modeColor = MODES.find(m => m.id === mode)?.color || "var(--accent)";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(8,8,16,0.92)",
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 24,
      animation: "fadeIn 0.2s ease",
    }}>
      {/* Ghost */}
      <div style={{
        fontSize: 72,
        animation: "ghostFloat 1.4s ease-in-out infinite, ghostGlow 1.4s ease-in-out infinite",
        display: "inline-block",
      }}>👻</div>

      {/* Message */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text)", marginBottom: 8 }}>
          {msgs[mode]?.[idx] || "Reviewing your code…"}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted2)" }}>This usually takes 5–10 seconds</div>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 9, height: 9, borderRadius: "50%",
            background: modeColor,
            animation: `dotBounce 1.4s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [mode, setMode]       = useState("senior");
  const [type, setType]       = useState("code");
  const [input, setInput]     = useState("");
  const [filename, setFilename] = useState("index.js");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const charCount    = input.length;
  const lineCount    = input ? input.split("\n").length : 0;
  const selectedMode = MODES.find(m => m.id === mode);
  const ext          = filename.match(/\.[^.]+$/)?.[0];
  const detectedLang = ext ? LANGUAGE_HINTS[ext] : null;

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setInput(ev.target.result);
    reader.readAsText(file);
  }

  async function handleSubmit() {
    if (!input.trim()) return setError("Paste some code or enter a GitHub PR URL.");
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/review", { type, input, mode, filename });
      navigate("/results", { state: { review: data } });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Check your API keys and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      {loading && <LoadingOverlay mode={mode} />}
      <section style={{
        marginBottom: 30,
        padding: "24px 24px 22px",
        borderRadius: 18,
        border: "1px solid rgba(130,100,255,0.14)",
        background: "linear-gradient(135deg, rgba(130,100,255,0.08), rgba(77,159,255,0.05) 48%, rgba(13,13,26,0.72))",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{
            fontSize: 54,
            animation: "ghostFloat 4s ease-in-out infinite, ghostGlow 3s ease-in-out infinite",
            lineHeight: 1,
          }}>👻</div>
          <div style={{ flex: 1, minWidth: 250 }}>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(32px, 7vw, 50px)",
              letterSpacing: "-1.8px",
              lineHeight: 1.08,
              marginBottom: 10,
            }} className="gradient-text">GhostPR</h1>
            <p style={{ color: "var(--muted2)", fontSize: 15, marginBottom: 14, lineHeight: 1.7, maxWidth: 650 }}>
              Review code in seconds with AI feedback that is easy to act on: score, top risks, inline comments, and practical fixes.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Paste code", "Select tone", "Get instant review"].map((step, i) => (
                <span key={step} style={{
                  fontSize: 12,
                  color: "var(--text)",
                  border: "1px solid rgba(130,100,255,0.22)",
                  background: "rgba(8,8,16,0.55)",
                  borderRadius: 999,
                  padding: "5px 11px",
                }}>
                  {i + 1}. {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{
        background: "rgba(13,13,26,0.78)",
        border: "1px solid rgba(130,100,255,0.12)",
        borderRadius: 18,
        padding: "20px 18px",
        marginBottom: 20,
      }}>
        <p style={{
          color: "var(--muted)", fontSize: 11, marginBottom: 12,
          textTransform: "uppercase", letterSpacing: 1.8, fontWeight: 700,
        }}>Choose reviewer tone</p>
        <div className="home-mode-grid">
          {MODES.map(m => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  padding: "16px 15px",
                  borderRadius: 12,
                  border: `1px solid ${active ? m.color + "50" : "rgba(130,100,255,0.10)"}`,
                  background: active ? m.glow : "rgba(8,8,16,0.52)",
                  color: "var(--text)",
                  textAlign: "left",
                  transition: "all 0.2s",
                  boxShadow: active ? `0 0 22px ${m.color}22, inset 0 1px 0 ${m.color}20` : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8, lineHeight: 1 }}>{m.icon}</div>
                <div style={{
                  fontWeight: 700, fontSize: 13, marginBottom: 4,
                  color: active ? m.color : "var(--text)",
                }}>{m.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.45 }}>{m.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Input Type Toggle ── */}
      <div style={{
        display: "inline-flex",
        gap: 0,
        marginBottom: 16,
        background: "var(--bg3)",
        borderRadius: 10,
        padding: 4,
        border: "1px solid rgba(130,100,255,0.10)",
      }}>
        {[
          { id: "code", label: "Paste Code", icon: "📋" },
          { id: "pr",   label: "GitHub PR",  icon: "🔗" },
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setType(id)}
            style={{
              padding: "7px 18px",
              borderRadius: 7,
              border: "none",
              background: type === id ? "rgba(130,100,255,0.18)" : "transparent",
              color: type === id ? "#c4b0ff" : "var(--muted)",
              fontSize: 13, fontWeight: 600,
              transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span style={{ fontSize: 12 }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      {type === "code" ? (
        <div style={{ marginBottom: 18, background: "rgba(13,13,26,0.7)", border: "1px solid rgba(130,100,255,0.12)", borderRadius: 16, padding: 14 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                value={filename}
                onChange={e => setFilename(e.target.value)}
                placeholder="filename.js"
                style={{
                  background: "var(--bg3)",
                  border: "1px solid rgba(130,100,255,0.15)",
                  borderRadius: 8,
                  padding: "7px 52px 7px 10px",
                  color: "var(--text)", fontSize: 12,
                  width: 180, outline: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
              {detectedLang && (
                <span style={{
                  position: "absolute", right: 8,
                  fontSize: 10, fontWeight: 700,
                  color: "var(--accent3)",
                  background: "rgba(130,100,255,0.15)",
                  padding: "2px 6px", borderRadius: 4,
                  pointerEvents: "none",
                }}>{detectedLang}</span>
              )}
            </div>

            <button
              onClick={() => { setInput(SAMPLE_CODE); setFilename("utils.js"); }}
              style={{
                fontSize: 12, fontWeight: 600,
                color: "var(--muted2)",
                background: "transparent",
                border: "1px solid rgba(130,100,255,0.15)",
                borderRadius: 8, padding: "7px 14px",
                transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              🐛 Load buggy sample
            </button>
            <button
              onClick={() => {
                setInput("");
                textareaRef.current?.focus();
              }}
              style={{
                fontSize: 12, fontWeight: 600,
                color: "var(--muted2)",
                background: "transparent",
                border: "1px solid rgba(130,100,255,0.15)",
                borderRadius: 8, padding: "7px 12px",
              }}
            >
              Clear
            </button>

            {charCount > 0 && (
              <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>
                {charCount.toLocaleString()} chars · {lineCount} lines
              </span>
            )}
          </div>

          {/* Textarea with drag zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{ position: "relative" }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste your code here… or drag & drop a file"
              rows={18}
              style={{
                width: "100%",
                background: dragOver ? "rgba(130,100,255,0.06)" : "rgba(13,13,26,0.8)",
                border: `1px solid ${dragOver ? "rgba(130,100,255,0.4)" : "rgba(130,100,255,0.12)"}`,
                borderRadius: 14,
                padding: "18px 18px",
                color: "var(--text)",
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                resize: "vertical", outline: "none",
                lineHeight: 1.8,
                transition: "border-color 0.2s, background 0.2s",
                letterSpacing: "0.02em",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(130,100,255,0.35)"}
              onBlur={e => e.target.style.borderColor = dragOver ? "rgba(130,100,255,0.4)" : "rgba(130,100,255,0.12)"}
            />
            {!input && (
              <div style={{
                position: "absolute", bottom: 14, right: 18,
                fontSize: 11, color: "var(--muted)",
                pointerEvents: "none",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ fontSize: 14 }}>⬆</span> drag & drop to load file
              </div>
            )}
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, paddingLeft: 2 }}>
            Tip: set the correct filename extension so GhostPR can infer the language.
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: 18, background: "rgba(13,13,26,0.7)", border: "1px solid rgba(130,100,255,0.12)", borderRadius: 16, padding: 14 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="https://github.com/owner/repo/pull/123"
            style={{
              width: "100%",
              background: "rgba(13,13,26,0.8)",
              border: "1px solid rgba(130,100,255,0.12)",
              borderRadius: 14, padding: "14px 18px",
              color: "var(--text)", fontSize: 14, outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(130,100,255,0.4)"}
            onBlur={e => e.target.style.borderColor = "rgba(130,100,255,0.12)"}
          />
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, paddingLeft: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <span>💡</span>
            Requires <code style={{ color: "var(--accent3)", fontSize: 11, background: "rgba(130,100,255,0.1)", padding: "1px 5px", borderRadius: 4 }}>GITHUB_TOKEN</code> in backend .env for private repos
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: "rgba(255,77,106,0.07)",
          border: "1px solid rgba(255,77,106,0.25)",
          borderRadius: 10, padding: "12px 16px",
          marginBottom: 16, color: "#ff9dae", fontSize: 13,
          display: "flex", alignItems: "center", gap: 8,
          animation: "fadeUp 0.2s ease",
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* ── Submit ── */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: 14,
          background: loading
            ? "rgba(130,100,255,0.15)"
            : `linear-gradient(135deg, ${selectedMode?.color || "#8264ff"}, #6040e0)`,
          border: "none",
          color: "#fff",
          fontSize: 15, fontWeight: 700,
          transition: "all 0.25s",
          opacity: loading ? 0.6 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: loading ? "none" : `0 6px 32px ${selectedMode?.color || "#8264ff"}40`,
          letterSpacing: 0.3,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {loading ? (
          <>
            <span style={{ animation: "spin 0.8s linear infinite", display: "inline-block", fontSize: 16 }}>⚙</span>
            Ghost is reviewing…
          </>
        ) : (
          <>
            {selectedMode?.icon} {mode === "brutal" ? "Roast My Code" : "Review My Code"}
          </>
        )}
      </button>

      {/* Stats strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14,
        marginTop: 40, padding: "28px 0",
        borderTop: "1px solid rgba(130,100,255,0.08)",
      }}>
        {[
          { val: "3", label: "Review Modes", icon: "🎭", color: "#b090ff" },
          { val: "8+", label: "Issue Types", icon: "🔍", color: "#4d9fff" },
          { val: "A→F", label: "Code Grading", icon: "📊", color: "#22d67a" },
        ].map(s => (
          <div key={s.label} style={{
            textAlign: "center",
            padding: "16px 12px",
            background: "rgba(13,13,26,0.5)",
            border: "1px solid rgba(130,100,255,0.08)",
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 22, fontWeight: 800,
              color: s.color, marginBottom: 3,
            }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
