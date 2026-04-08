import { useState } from "react";

const DEEPER_EXPLANATIONS = {
  "Sperm Count": "Sperm concentration tells us how many sperm are available per millilitre. WHO defines ≥16 million/mL as normal, though total count (concentration × volume) is equally important for natural conception.",
  "Motility": "Motility measures the percentage of sperm that are moving. WHO distinguishes between progressive motility (sperm swimming forward) and total motility. Progressive motility ≥30% is considered normal.",
  "Morphology": "Morphology uses Kruger strict criteria — one of the most stringent standards in lab medicine. Only 4% of sperm need to be 'textbook perfect' for this to be classified as normal. This is frequently misread as catastrophic when it's a normal lab standard.",
  "Volume": "Semen volume reflects secretions from the seminal vesicles and prostate. Very low volume (hypospermia) can indicate a blockage or hormonal issue. Very high volume can dilute sperm concentration.",
  "pH": "Semen should be slightly alkaline (pH 7.2–8.0) to protect sperm from the acidic vaginal environment. Low pH may indicate ejaculatory duct issues; high pH may point to infection.",
  "WBC": "White blood cells (pus cells) in semen can indicate infection or inflammation in the reproductive tract. Elevated WBC (>1 million/mL) is called leukocytospermia and is worth investigating with a urologist.",
};

const STATUS_CONFIG = {
  NORMAL:   { borderColor: "#16a34a", dotColor: "#16a34a", dotBg: "#dcfce7", label: "Normal" },
  WARNING:  { borderColor: "#d97706", dotColor: "#b45309", dotBg: "#fef3c7", label: "Borderline" },
  CRITICAL: { borderColor: "#e11d48", dotColor: "#be123c", dotBg: "#ffe4e6", label: "Act Now" },
};

export default function ParameterCard({ paramName, value, unit, whoRange, status, contextualizingLine }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NORMAL;
  const deeper = DEEPER_EXPLANATIONS[paramName] || null;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      border: "1px solid #ece8e3",
      borderLeft: `3px solid ${cfg.borderColor}`,
      padding: "16px 16px 14px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>{paramName}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: cfg.dotColor, background: cfg.dotBg, padding: "3px 9px", borderRadius: 999 }}>
          {cfg.label}
        </span>
      </div>

      {/* Value */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: "#aaa", marginLeft: 4 }}>{unit}</span>}
      </div>

      {/* WHO range */}
      <p style={{ fontSize: 11, color: "#bbb", margin: "0 0 10px" }}>WHO: {whoRange}</p>

      {/* Contextualizing line */}
      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5, margin: "0 0 10px" }}>{contextualizingLine}</p>

      {/* Learn more */}
      {deeper && (
        <>
          <button
            onClick={() => setExpanded((p) => !p)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#0D6E6E", fontWeight: 600, padding: 0, fontFamily: "'DM Sans', sans-serif" }}
          >
            {expanded ? "Show less ▴" : "Learn more ▾"}
          </button>
          {expanded && (
            <p style={{ fontSize: 12, color: "#777", lineHeight: 1.6, marginTop: 8, marginBottom: 0, padding: "10px 12px", background: "#fafafa", borderRadius: 8 }}>
              {deeper}
            </p>
          )}
        </>
      )}
    </div>
  );
}
