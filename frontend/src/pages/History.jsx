import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GRADE_C = { S:"#b090ff", A:"#22d67a", B:"#4d9fff", C:"#f5c542", D:"#ff7d3b", F:"#ff4d6a" };
const MODE_META = {
  professional: { icon:"💼", color:"#4d9fff" },
  senior:       { icon:"😤", color:"#ff7d3b" },
  brutal:       { icon:"💀", color:"#ff4d6a" },
};

function GradeOrb({ grade }) {
  const color = GRADE_C[grade] || "#6060a0";
  return (
    <div style={{
      width: 48, height: 48, borderRadius: "50%",
      background: `${color}14`,
      border: `1px solid ${color}35`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 20, fontWeight: 800,
        color,
        textShadow: `0 0 14px ${color}66`,
      }}>{grade || "?"}</span>
    </div>
  );
}

function ScoreBar({ score }) {
  const [animated, setAnimated] = useState(0);
  const color = score >= 80 ? "#22d67a" : score >= 60 ? "#f5c542" : "#ff4d6a";
  useEffect(() => { const t = setTimeout(() => setAnimated(score), 200); return () => clearTimeout(t); }, [score]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{
          height: 3, width: `${animated}%`,
          background: color, borderRadius: 2,
          transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
        }} />
      </div>
      <span style={{
        fontSize: 13, fontWeight: 800, color,
        fontFamily: "'JetBrains Mono', monospace",
        minWidth: 26, textAlign: "right",
      }}>{score}</span>
    </div>
  );
}

export default function History() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/history")
      .then(r => setReviews(r.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign:"center", padding:80, color:"var(--muted)", animation:"fadeIn 0.3s ease" }}>
      <div style={{ fontSize:52, marginBottom:16, animation:"ghostFloat 1.5s ease-in-out infinite, ghostGlow 2s ease-in-out infinite", display:"inline-block" }}>👻</div>
      <div style={{ fontSize:14, color:"var(--muted2)" }}>Loading history…</div>
    </div>
  );

  if (!reviews.length) return (
    <div style={{ textAlign:"center", padding:80, animation:"fadeUp 0.4s ease" }}>
      <div style={{ fontSize:56, marginBottom:20, animation:"ghostFloat 3s ease-in-out infinite", display:"inline-block" }}>👻</div>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, marginBottom:10 }}>No reviews yet</h2>
      <p style={{ color:"var(--muted2)", marginBottom:28, maxWidth:300, margin:"0 auto 28px", lineHeight:1.6 }}>
        Start by reviewing some code. It'll show up here.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          background:"linear-gradient(135deg, #8264ff, #6040e0)",
          border:"none", borderRadius:12,
          color:"#fff", padding:"12px 28px",
          fontSize:14, fontWeight:700,
          boxShadow:"0 6px 24px rgba(130,100,255,0.30)",
          fontFamily:"'Space Grotesk',sans-serif",
        }}
      >⚡ Review Code Now</button>
    </div>
  );

  const avgScore = Math.round(reviews.reduce((s, r) => s + (r.overall_score || 0), 0) / reviews.length);
  const gradeCount = reviews.reduce((acc, r) => { acc[r.grade] = (acc[r.grade]||0)+1; return acc; }, {});
  const topGrade = Object.entries(gradeCount).sort((a,b)=>b[1]-a[1])[0]?.[0];

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      {/* Header */}
      <div style={{ marginBottom:32, display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, marginBottom:4 }}>Review History</h2>
          <p style={{ color:"var(--muted2)", fontSize:13 }}>
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Stats pills */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <div style={{
            background:"rgba(130,100,255,0.08)", border:"1px solid rgba(130,100,255,0.15)",
            borderRadius:10, padding:"8px 16px", textAlign:"center",
          }}>
            <div style={{ fontSize:18, fontWeight:800, color:"#b090ff", fontFamily:"'Syne',sans-serif" }}>{avgScore}</div>
            <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:0.8 }}>Avg Score</div>
          </div>
          {topGrade && (
            <div style={{
              background:`${GRADE_C[topGrade] || "#888"}12`, border:`1px solid ${GRADE_C[topGrade] || "#888"}25`,
              borderRadius:10, padding:"8px 16px", textAlign:"center",
            }}>
              <div style={{ fontSize:18, fontWeight:800, color:GRADE_C[topGrade], fontFamily:"'Syne',sans-serif" }}>{topGrade}</div>
              <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:0.8 }}>Top Grade</div>
            </div>
          )}
        </div>
      </div>

      {/* Review list */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {reviews.map((r, i) => {
          const modeMeta = MODE_META[r.mode] || { icon:"🤖", color:"var(--accent)" };
          return (
            <div
              key={r.id}
              style={{
                background:"rgba(13,13,26,0.8)",
                border:"1px solid rgba(130,100,255,0.10)",
                borderRadius:14, padding:"18px 22px",
                display:"flex", alignItems:"center", gap:18,
                animation:`fadeUp 0.35s ease ${i*0.05}s both`,
                transition:"border-color 0.2s, box-shadow 0.2s",
                cursor:"default",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(130,100,255,0.28)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(130,100,255,0.10)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(130,100,255,0.10)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <GradeOrb grade={r.grade} />

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5, flexWrap:"wrap" }}>
                  <span style={{ fontWeight:700, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {modeMeta.icon} {r.filename}
                  </span>
                  <span style={{
                    fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20,
                    background:`${modeMeta.color}12`, color:modeMeta.color,
                    border:`1px solid ${modeMeta.color}25`,
                    textTransform:"uppercase", letterSpacing:0.6, flexShrink:0,
                  }}>{r.mode}</span>
                </div>
                <div style={{ fontSize:12, color:"var(--muted2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", lineHeight:1.5 }}>
                  {r.summary}
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:8, flexShrink:0, minWidth:120 }}>
                <ScoreBar score={r.overall_score || 0} />
                <div style={{ fontSize:11, color:"var(--muted)", textAlign:"right" }}>
                  {new Date(r.created_at).toLocaleDateString(undefined, { month:"short", day:"numeric" })}
                  <span style={{ opacity:0.6 }}> {new Date(r.created_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
