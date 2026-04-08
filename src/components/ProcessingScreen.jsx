import { useState, useEffect } from "react";

const microCopy = [
  "Did you know? Morphology is the most commonly misread value in semen reports.",
  "Sperm parameters naturally fluctuate. One test is never the full picture.",
  "1 in 7 couples face fertility challenges. You are not alone.",
  "Your FM Code is being created. Save it to return to these results anytime.",
];

const TOTAL_MS = 6000;

export default function ProcessingScreen({ onComplete, onBack }) {
  const [copyIndex, setCopyIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();

    const copyInterval = setInterval(() => {
      setCopyIndex((p) => (p + 1) % microCopy.length);
      setFadeKey((p) => p + 1);
    }, 2500);

    const progressInterval = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / TOTAL_MS) * 100, 100);
      setProgress(pct);
    }, 200);

    const completeTimer = setTimeout(() => onComplete?.(), TOTAL_MS);

    return () => {
      clearInterval(copyInterval);
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes fm-fadeup { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fm-micro { animation: fm-fadeup 0.4s ease; }
      `}</style>

      {/* Nav with back */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #ece8e3", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#0D6E6E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔬</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0D6E6E", lineHeight: 1.1 }}>ForMen Health</div>
            <div style={{ fontSize: 11, color: "#999", lineHeight: 1.1 }}>Lab Report Explainer</div>
          </div>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1.5px solid #ddd", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "#555", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
          ← Go back
        </button>
      </nav>

      {/* Progress bar */}
      <div style={{ height: 3, background: "#e8e3dd" }}>
        <div style={{ height: "100%", background: "#0D6E6E", width: `${progress}%`, transition: "width 0.2s linear" }} />
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 440, fontFamily: "'DM Sans', sans-serif" }}>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
            Analysing your report…
          </h2>
          <p style={{ fontSize: 14, color: "#999", marginBottom: 32 }}>This only takes a moment.</p>

          <div style={{ background: "#fff", border: "1px solid #ece8e3", borderRadius: 14, padding: "20px 24px", marginBottom: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <p key={fadeKey} className="fm-micro" style={{ fontSize: 15, color: "#444", lineHeight: 1.65, margin: 0 }}>
              💡 {microCopy[copyIndex]}
            </p>
          </div>

          {/* Progress steps */}
          {[
            { label: "Comparing against WHO 2021 reference ranges", done: progress > 30 },
            { label: "Identifying your primary findings", done: progress > 60 },
            { label: "Generating your personalised next steps", done: progress > 85 },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, textAlign: "left" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: step.done ? "#0D6E6E" : "#e8e3dd", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.4s" }}>
                {step.done && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, color: step.done ? "#0D6E6E" : "#bbb", fontWeight: step.done ? 500 : 400, transition: "color 0.4s" }}>
                {step.label}
              </span>
            </div>
          ))}

          {/* Skip */}
          <button
            onClick={() => onComplete?.()}
            style={{ marginTop: 20, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#aaa", fontFamily: "'DM Sans', sans-serif" }}
          >
            Skip →
          </button>
        </div>
      </div>
    </div>
  );
}
