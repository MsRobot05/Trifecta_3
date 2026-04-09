import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const SEVERITY = {
  critical: { color: "#ff4d6a", bg: "rgba(255,77,106,0.07)", border: "rgba(255,77,106,0.22)", label: "CRITICAL", icon: "🔴" },
  warning:  { color: "#ff7d3b", bg: "rgba(255,125,59,0.07)", border: "rgba(255,125,59,0.22)", label: "WARNING",  icon: "🟠" },
  nitpick:  { color: "#f5c542", bg: "rgba(245,197,66,0.07)", border: "rgba(245,197,66,0.22)", label: "NITPICK",  icon: "🟡" },
  praise:   { color: "#22d67a", bg: "rgba(34,214,122,0.07)", border: "rgba(34,214,122,0.22)", label: "PRAISE",   icon: "🟢" },
};

const GRADE_C = { S: "#b090ff", A: "#22d67a", B: "#4d9fff", C: "#f5c542", D: "#ff7d3b", F: "#ff4d6a" };
const GRADE_BG = { S:"rgba(176,144,255,0.10)", A:"rgba(34,214,122,0.10)", B:"rgba(77,159,255,0.10)", C:"rgba(245,197,66,0.10)", D:"rgba(255,125,59,0.10)", F:"rgba(255,77,106,0.10)" };

const BADGE_C = {
  "SQL Injection Risk":"#ff4d6a","Memory Leak":"#ff7d3b","No Tests":"#f5c542",
  "Eval Danger":"#ff4d6a","Magic Numbers":"#f5c542","Missing Error Handling":"#ff7d3b",
  "Good Naming":"#22d67a","Well Documented":"#22d67a","Clean Architecture":"#22d67a",
  "DRY Violation":"#ff7d3b","God Function":"#ff7d3b","Hardcoded Secrets":"#ff4d6a",
};

function ScoreRing({ score }) {
  const [animated, setAnimated] = useState(0);
  const r = 40, circ = 2 * Math.PI * r;
  const color = score >= 80 ? "#22d67a" : score >= 60 ? "#f5c542" : score >= 40 ? "#ff7d3b" : "#ff4d6a";

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const fill = (animated / 100) * circ;

  return (
    <div style={{ position: "relative", width: 104, height: 104 }}>
      <svg width="104" height="104" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="52" cy="52" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <circle cx="52" cy="52" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 8px ${color}99)` }}
        />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
        <span style={{ fontSize:24, fontWeight:800, color, fontFamily:"'Syne',sans-serif", lineHeight:1 }}>{score}</span>
        <span style={{ fontSize:10, color:"var(--muted)", fontWeight:500 }}>/ 100</span>
      </div>
    </div>
  );
}

function MetricBar({ label, value }) {
  const [animated, setAnimated] = useState(0);
  const color = value >= 80 ? "#22d67a" : value >= 60 ? "#f5c542" : "#ff4d6a";
  useEffect(() => { const t = setTimeout(() => setAnimated(value), 150); return () => clearTimeout(t); }, [value]);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:12 }}>
        <span style={{ color:"var(--muted2)", textTransform:"capitalize", fontWeight:500 }}>{label.replace(/_/g," ")}</span>
        <span style={{ color, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>{value}</span>
      </div>
      <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:4, overflow:"hidden" }}>
        <div style={{
          height:4, width:`${animated}%`,
          background:`linear-gradient(90deg, ${color}66, ${color})`,
          borderRadius:4,
          transition:"width 1.4s cubic-bezier(0.22,1,0.36,1)",
          boxShadow:`0 0 8px ${color}55`,
        }} />
      </div>
    </div>
  );
}

function CommentCard({ c, i }) {
  const cfg = SEVERITY[c.severity] || SEVERITY.nitpick;
  const [showFix, setShowFix] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyFix() {
    navigator.clipboard.writeText(c.fix);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 14,
      padding: "18px 20px",
      marginBottom: 10,
      borderLeft: `3px solid ${cfg.color}`,
      animation: `fadeUp 0.35s ease ${i * 0.06}s both`,
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 24px ${cfg.color}15`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
        <span style={{
          fontSize:10, fontWeight:800, color:cfg.color,
          letterSpacing:1.2, display:"flex", alignItems:"center", gap:4,
          background:`${cfg.color}15`,
          padding:"2px 8px", borderRadius:4,
        }}>
          {cfg.icon} {cfg.label}
        </span>
        {c.line && (
          <span style={{
            fontSize:11, color:"var(--muted2)",
            fontFamily:"'JetBrains Mono',monospace",
            background:"rgba(255,255,255,0.05)",
            padding:"2px 8px", borderRadius:4,
          }}>line {c.line}</span>
        )}
        <span style={{ fontSize:14, fontWeight:600, color:"var(--text)", flex:1 }}>{c.title}</span>
        {c.fix && (
          <button
            onClick={() => setShowFix(!showFix)}
            style={{
              fontSize:11, fontWeight:600,
              color: showFix ? cfg.color : "var(--accent3)",
              background: showFix ? `${cfg.color}10` : "rgba(130,100,255,0.10)",
              border: `1px solid ${showFix ? cfg.color+"30" : "rgba(130,100,255,0.20)"}`,
              borderRadius:6, padding:"4px 10px",
              transition:"all 0.15s",
              display:"flex", alignItems:"center", gap:4,
            }}
          >
            {showFix ? "▲ Hide fix" : "💡 Show fix"}
          </button>
        )}
      </div>

      <p style={{ fontSize:13, color:"var(--text)", lineHeight:1.78, opacity:0.88 }}>{c.message}</p>

      {showFix && c.fix && (
        <div style={{ marginTop:14, position:"relative", animation:"fadeUp 0.2s ease" }}>
          <pre style={{
            background:"rgba(0,0,0,0.4)",
            borderRadius:10, padding:"14px 16px",
            fontSize:12, color:"#86efac",
            fontFamily:"'JetBrains Mono',monospace",
            overflowX:"auto", lineHeight:1.7,
            border:"1px solid rgba(34,214,122,0.15)",
          }}>{c.fix}</pre>
          <button
            onClick={copyFix}
            style={{
              position:"absolute", top:10, right:10,
              fontSize:11, fontWeight:600,
              background:"rgba(0,0,0,0.5)",
              border:"1px solid rgba(255,255,255,0.10)",
              borderRadius:6, padding:"3px 10px",
              color: copied ? "#22d67a" : "var(--muted2)",
              transition:"all 0.15s",
            }}
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Results() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [shareMsg, setShareMsg] = useState("");

  if (!state?.review) { navigate("/"); return null; }

  const { review } = state;
  const { overall_score, grade, summary, tldr, comments=[], metrics={}, mode, meta, languages=[], quick_wins=[], badges=[] } = review;

  const counts = {
    critical: comments.filter(c=>c.severity==="critical").length,
    warning:  comments.filter(c=>c.severity==="warning").length,
    nitpick:  comments.filter(c=>c.severity==="nitpick").length,
    praise:   comments.filter(c=>c.severity==="praise").length,
  };

  const filtered = activeFilter === "all" ? comments : comments.filter(c=>c.severity===activeFilter);

  function shareResult() {
    navigator.clipboard.writeText(`My code scored ${overall_score}/100 (Grade: ${grade}) on GhostPR 👻\n${tldr || summary}`);
    setShareMsg("Copied!");
    setTimeout(() => setShareMsg(""), 2000);
  }

  const modeLabel = { professional:"💼 Professional", senior:"😤 Senior Dev", brutal:"💀 Brutal" }[mode] || mode;
  const modeColor = { professional:"#4d9fff", senior:"#ff7d3b", brutal:"#ff4d6a" }[mode] || "var(--accent)";

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      {/* ── Top Bar ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, flexWrap:"wrap", gap:10 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background:"transparent",
            border:"1px solid rgba(130,100,255,0.15)",
            borderRadius:9, color:"var(--muted2)",
            padding:"8px 16px", fontSize:13, fontWeight:600,
            transition:"all 0.15s",
            display:"flex", alignItems:"center", gap:6,
          }}
        >← New Review</button>

        <button
          onClick={shareResult}
          style={{
            background:"rgba(130,100,255,0.10)",
            border:"1px solid rgba(130,100,255,0.25)",
            borderRadius:9, color:"#c4b0ff",
            padding:"8px 16px", fontSize:13, fontWeight:600,
            transition:"all 0.15s",
            display:"flex", alignItems:"center", gap:6,
          }}
        >
          {shareMsg ? `✓ ${shareMsg}` : "🔗 Share Result"}
        </button>
      </div>

      {/* ── TL;DR ── */}
      {tldr && (
        <div style={{
          background:"linear-gradient(135deg, rgba(130,100,255,0.10), rgba(77,159,255,0.05))",
          border:"1px solid rgba(130,100,255,0.20)",
          borderRadius:14, padding:"16px 20px", marginBottom:20,
          display:"flex", alignItems:"flex-start", gap:12,
          animation:"fadeUp 0.3s ease 0.05s both",
        }}>
          <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>💬</span>
          <span style={{
            fontSize:15, fontStyle:"italic", fontWeight:500,
            color:"#c4b0ff", lineHeight:1.6,
          }}>"{tldr}"</span>
        </div>
      )}

      {/* ── Main Score Card ── */}
      <div style={{
        background:"rgba(13,13,26,0.8)",
        border:"1px solid rgba(130,100,255,0.14)",
        borderRadius:18, padding:"28px 28px",
        marginBottom:16,
        display:"flex", alignItems:"flex-start",
        justifyContent:"space-between",
        flexWrap:"wrap", gap:24,
        boxShadow:"0 2px 40px rgba(0,0,0,0.3)",
        animation:"fadeUp 0.35s ease 0.08s both",
      }}>
        <div style={{ flex:1, minWidth:240 }}>
          {/* Badges row */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, color:"var(--muted)" }}>👻 GhostPR</span>
            <span style={{
              fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
              background:`${modeColor}14`, color:modeColor,
              border:`1px solid ${modeColor}30`,
            }}>{modeLabel}</span>
            {languages.map(lang => (
              <span key={lang} style={{
                fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20,
                background:"rgba(77,159,255,0.10)", color:"#90c4ff",
                border:"1px solid rgba(77,159,255,0.20)",
              }}>{lang}</span>
            ))}
          </div>

          {meta?.repo && meta.repo !== "direct-paste" && (
            <div style={{ fontSize:13, color:"var(--muted2)", marginBottom:10 }}>
              {meta.repo}
              {meta.pr_number !== "0" && ` · PR #${meta.pr_number}`}
              {meta.author && ` · by @${meta.author}`}
            </div>
          )}

          <p style={{ fontSize:14, color:"var(--text)", lineHeight:1.78, maxWidth:520, opacity:0.88 }}>{summary}</p>

          {/* Severity pills */}
          <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
            {counts.critical > 0 && <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, background:"rgba(255,77,106,0.10)", color:"#ff9dae", border:"1px solid rgba(255,77,106,0.20)" }}>🔴 {counts.critical} critical</span>}
            {counts.warning  > 0 && <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, background:"rgba(255,125,59,0.10)", color:"#ffb08a", border:"1px solid rgba(255,125,59,0.20)" }}>🟠 {counts.warning} warning</span>}
            {counts.nitpick  > 0 && <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, background:"rgba(245,197,66,0.10)", color:"#f8df87", border:"1px solid rgba(245,197,66,0.20)" }}>🟡 {counts.nitpick} nitpick</span>}
            {counts.praise   > 0 && <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, background:"rgba(34,214,122,0.10)", color:"#80f0b8", border:"1px solid rgba(34,214,122,0.20)" }}>🟢 {counts.praise} praise</span>}
          </div>
        </div>

        {/* Score + Grade */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <ScoreRing score={overall_score} />
          <div style={{
            fontFamily:"'Syne',sans-serif",
            fontSize:44, fontWeight:800,
            color: GRADE_C[grade] || "#e0e0ff",
            lineHeight:1,
            background: GRADE_BG[grade],
            padding:"6px 20px", borderRadius:12,
            border:`1px solid ${GRADE_C[grade] || "#888"}28`,
            textShadow:`0 0 24px ${GRADE_C[grade] || "#fff"}55`,
          }}>{grade}</div>
          <div style={{ fontSize:11, color:"var(--muted)", fontWeight:600, letterSpacing:0.5, textTransform:"uppercase" }}>Grade</div>
        </div>
      </div>

      {/* ── Badges ── */}
      {badges.length > 0 && (
        <div style={{
          background:"rgba(13,13,26,0.8)",
          border:"1px solid rgba(130,100,255,0.12)",
          borderRadius:14, padding:"18px 22px", marginBottom:14,
          animation:"fadeUp 0.35s ease 0.12s both",
        }}>
          <p style={{ color:"var(--muted)", fontSize:10, marginBottom:14, textTransform:"uppercase", letterSpacing:2, fontWeight:700 }}>
            Detected Issues
          </p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {badges.map(badge => {
              const c = BADGE_C[badge] || "var(--muted2)";
              const isPositive = c === "#22d67a";
              return (
                <span key={badge} style={{
                  fontSize:12, fontWeight:700,
                  padding:"5px 14px", borderRadius:20,
                  color:c, background:`${c}12`,
                  border:`1px solid ${c}25`,
                }}>
                  {isPositive ? "✅ " : "⚠️ "}{badge}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick Wins ── */}
      {quick_wins.length > 0 && (
        <div style={{
          background:"rgba(34,214,122,0.05)",
          border:"1px solid rgba(34,214,122,0.18)",
          borderRadius:14, padding:"18px 22px", marginBottom:14,
          animation:"fadeUp 0.35s ease 0.16s both",
        }}>
          <p style={{ color:"#22d67a", fontSize:10, marginBottom:14, textTransform:"uppercase", letterSpacing:2, fontWeight:800 }}>
            ⚡ Quick Wins
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {quick_wins.map((win, i) => (
              <div key={i} style={{ fontSize:13, color:"var(--text)", display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ color:"#22d67a", fontWeight:700, flexShrink:0, marginTop:1 }}>→</span>
                <span style={{ lineHeight:1.6 }}>{win}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Metrics ── */}
      {Object.keys(metrics).length > 0 && (
        <div style={{
          background:"rgba(13,13,26,0.8)",
          border:"1px solid rgba(130,100,255,0.12)",
          borderRadius:14, padding:"20px 22px", marginBottom:14,
          display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",
          gap:"4px 36px",
          animation:"fadeUp 0.35s ease 0.20s both",
        }}>
          {Object.entries(metrics).map(([key, val]) => (
            <MetricBar key={key} label={key} value={val} />
          ))}
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {["all","critical","warning","nitpick","praise"].map(f => {
          const active = activeFilter === f;
          const cfg = SEVERITY[f];
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                fontSize:12, fontWeight:600, padding:"6px 14px", borderRadius:8,
                background: active ? (cfg ? `${cfg.color}12` : "rgba(130,100,255,0.14)") : "transparent",
                border: active ? `1px solid ${cfg?.color || "rgba(130,100,255,0.35)"}30` : "1px solid rgba(130,100,255,0.10)",
                color: active ? (cfg?.color || "#c4b0ff") : "var(--muted2)",
                transition:"all 0.15s",
              }}
            >
              {f === "all"
                ? `All (${comments.length})`
                : `${cfg?.icon} ${f} (${comments.filter(c=>c.severity===f).length})`
              }
            </button>
          );
        })}
      </div>

      {/* ── Comments ── */}
      <div style={{ marginBottom:24 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", color:"var(--muted)", padding:36, fontSize:13 }}>
            No comments for this filter
          </div>
        )}
        {filtered.map((c, i) => <CommentCard key={i} c={c} i={i} />)}
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          width:"100%", padding:"16px", borderRadius:14,
          background:"linear-gradient(135deg, #8264ff, #6040e0)",
          border:"none", color:"#fff",
          fontSize:15, fontWeight:700,
          boxShadow:"0 6px 32px rgba(130,100,255,0.30)",
          letterSpacing:0.3,
          fontFamily:"'Space Grotesk',sans-serif",
        }}
      >
        👻 Review Another
      </button>
    </div>
  );
}
