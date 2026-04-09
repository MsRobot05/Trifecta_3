import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>

      {/* Deep ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
          width: 800, height: 500,
          background: "radial-gradient(ellipse, rgba(130,100,255,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "-10%",
          width: 400, height: 400,
          background: "radial-gradient(ellipse, rgba(77,159,255,0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "-5%",
          width: 300, height: 300,
          background: "radial-gradient(ellipse, rgba(255,110,180,0.05) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
      </div>

      {/* Nav */}
      <nav style={{
        padding: "0 32px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(130,100,255,0.10)",
        background: "rgba(8,8,16,0.80)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 24,
            animation: "ghostFloat 4s ease-in-out infinite, ghostGlow 3s ease-in-out infinite",
            display: "inline-block",
          }}>👻</span>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, #d0b8ff, #8264ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>GhostPR</span>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: "#8264ff",
            background: "rgba(130,100,255,0.12)",
            border: "1px solid rgba(130,100,255,0.25)",
            padding: "2px 7px",
            borderRadius: 20,
            textTransform: "uppercase",
          }}>BETA</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[
            { path: "/", label: "Review", icon: "⚡" },
            { path: "/history", label: "History", icon: "🕰" },
          ].map(({ path, label, icon }) => {
            const active = pathname === path;
            return (
              <Link key={path} to={path} style={{
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: active ? "#c4b0ff" : "var(--muted2)",
                background: active ? "rgba(130,100,255,0.12)" : "transparent",
                border: `1px solid ${active ? "rgba(130,100,255,0.3)" : "transparent"}`,
                transition: "all 0.2s",
              }}>
                <span style={{ fontSize: 12 }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main style={{
        flex: 1,
        maxWidth: 920,
        width: "100%",
        margin: "0 auto",
        padding: "44px 28px",
        position: "relative",
        zIndex: 1,
      }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        padding: "18px 24px",
        borderTop: "1px solid rgba(130,100,255,0.08)",
        color: "var(--muted)",
        fontSize: 12,
        background: "rgba(13,13,26,0.6)",
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}>
        <span>👻 GhostPR</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>Trifecta Challenge 2026</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>Powered by Claude AI</span>
      </footer>
    </div>
  );
}
