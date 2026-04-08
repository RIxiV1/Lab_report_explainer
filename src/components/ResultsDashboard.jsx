import { useState, useEffect } from "react";
import ParameterCard from "./ParameterCard";

const CTX_LINES = {
  spermCount: {
    NORMAL: "Your concentration is within the healthy range.",
    WARNING: "Slightly below WHO guidelines — often improvable with lifestyle changes.",
    CRITICAL: "Below the threshold where natural conception becomes harder, but treatment options exist.",
  },
  motility: {
    NORMAL: "Enough of your sperm are moving well.",
    WARNING: "Movement is slightly reduced — this responds well to targeted nutrition.",
    CRITICAL: "Significantly reduced movement — this is the most important parameter to address.",
  },
  morphology: {
    NORMAL: "Shape is within WHO guidelines.",
    WARNING: "Slightly below 4% — the most commonly misread value. Context matters more than the number.",
    CRITICAL: "Below standard, but morphology alone rarely determines fertility outcomes.",
  },
  volume: {
    NORMAL: "Semen volume is healthy.",
    WARNING: "Volume is outside the typical range — worth discussing with a doctor.",
    CRITICAL: "Volume significantly outside range — may affect sperm delivery.",
  },
  pH: {
    NORMAL: "Acidity is balanced.",
    WARNING: "Slightly outside normal range — a minor issue worth checking.",
    CRITICAL: "pH outside safe range — can indicate infection or blockage.",
  },
  wbc: {
    NORMAL: "No signs of infection in your sample.",
    WARNING: "Mildly elevated white blood cells — may indicate mild inflammation.",
    CRITICAL: "Elevated pus cells — a sign of possible infection requiring medical attention.",
  },
};

const PARAM_META = {
  spermCount: { label: "Sperm Count", unit: "million/mL", whoRange: "≥ 16 million/mL" },
  motility:   { label: "Motility",    unit: "%",          whoRange: "≥ 42%" },
  morphology: { label: "Morphology",  unit: "%",          whoRange: "≥ 4% (Kruger)" },
  volume:     { label: "Volume",      unit: "mL",         whoRange: "1.4 – 7.6 mL" },
  pH:         { label: "pH",          unit: "",           whoRange: "7.2 – 8.0" },
  wbc:        { label: "WBC",         unit: "million/mL", whoRange: "< 1 million/mL" },
};

const PARAM_ORDER = ["spermCount", "motility", "morphology", "volume", "pH", "wbc"];

const VERDICT_CONFIG = {
  ALL_NORMAL: { bg: "#f0fdf4", border: "#16a34a", accent: "#15803d", label: "Looking Good" },
  ATTENTION:  { bg: "#fffbeb", border: "#d97706", accent: "#b45309", label: "Needs Attention" },
  ACT_NOW:    { bg: "#fff1f2", border: "#e11d48", accent: "#be123c", label: "Act Now" },
};

const TIMELINE_ORDER = ["Immediate", "30 Days", "90 Days"];

const FERTIQ_URL = "https://www.formen.health/products/fertiq-male-fertility-supplement?utm_source=lab-report&utm_medium=tool&utm_campaign=fertiq";

function groupByTimeline(actions) {
  const groups = {};
  TIMELINE_ORDER.forEach((t) => (groups[t] = []));
  (actions || []).forEach((a) => {
    const key = a.timeline || "Immediate";
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });
  return groups;
}

export default function ResultsDashboard({ result, snippet, fmCode, onReset }) {
  const [copied, setCopied] = useState(false);
  const [checkedActions, setCheckedActions] = useState({});
  const verdictCfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.ATTENTION;
  const actionGroups = groupByTimeline(snippet?.actions);

  // Load checked state from localStorage
  useEffect(() => {
    if (!fmCode) return;
    try {
      const saved = JSON.parse(localStorage.getItem(`fm_actions_${fmCode}`) || "{}");
      setCheckedActions(saved);
    } catch { /* ignore */ }
  }, [fmCode]);

  function toggleAction(timeline, index) {
    const key = `${timeline}-${index}`;
    setCheckedActions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (fmCode) localStorage.setItem(`fm_actions_${fmCode}`, JSON.stringify(next));
      return next;
    });
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(fmCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleDownload = () => {
    const date = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
    const blob = new Blob([
      `Your FM Lab Report Code: ${fmCode}\nGenerated: ${date}\n\nTo access your results:\nVisit formen.health/pages/lab-report-explainer and enter this code.\n\nNote: Results are stored only on the device where you first generated them.\n\nForMen Health — formen.health`
    ], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${fmCode}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  // Summary counts
  const paramStatuses = PARAM_ORDER.map((k) => result.parameters[k]?.status || "NORMAL");
  const normalCount = paramStatuses.filter((s) => s === "NORMAL").length;
  const warningCount = paramStatuses.filter((s) => s === "WARNING").length;
  const criticalCount = paramStatuses.filter((s) => s === "CRITICAL").length;

  return (
    <div style={{ background: "#FAF8F5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #ece8e3", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#0D6E6E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔬</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0D6E6E", lineHeight: 1.1 }}>ForMen Health</div>
            <div style={{ fontSize: 11, color: "#999", lineHeight: 1.1 }}>Lab Report Explainer</div>
          </div>
        </div>
        <button onClick={onReset} style={{ background: "none", border: "1.5px solid #ddd", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "#555", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
          ← New Analysis
        </button>
      </nav>

      {/* Disclaimer */}
      <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "9px 20px", textAlign: "center", fontSize: 12, color: "#92400e" }}>
        <strong>This is an explanation, not a diagnosis.</strong> Always consult a qualified andrologist before making medical decisions.
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* Verdict */}
        <div style={{ background: verdictCfg.bg, border: `1.5px solid ${verdictCfg.border}`, borderRadius: 18, padding: "28px 24px", marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: verdictCfg.accent, margin: "0 0 10px" }}>{verdictCfg.label}</h2>
          {snippet?.verdictCard && (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#2d2d2d", margin: "0 0 16px" }}>{snippet.verdictCard}</p>
          )}

          {/* Summary badges */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { count: normalCount, label: "Normal", color: "#15803d", bg: "#dcfce7" },
              { count: warningCount, label: "Borderline", color: "#b45309", bg: "#fef3c7" },
              { count: criticalCount, label: "Act Now", color: "#be123c", bg: "#ffe4e6" },
            ].filter((s) => s.count > 0).map((s) => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 999, padding: "5px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.count}</span>
                <span style={{ fontSize: 12, color: s.color, fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Parameter Cards */}
        <div style={{ marginBottom: 36 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", marginBottom: 18 }}>Your Results, Explained</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
            {PARAM_ORDER.map((key) => {
              const p = result.parameters[key];
              if (!p) return null;
              const meta = PARAM_META[key];
              return (
                <ParameterCard
                  key={key}
                  paramName={meta.label}
                  value={p.value}
                  unit={meta.unit}
                  whoRange={meta.whoRange}
                  status={p.status}
                  contextualizingLine={CTX_LINES[key]?.[p.status] || ""}
                />
              );
            })}
          </div>
        </div>

        {/* Narrative */}
        <div style={{ marginBottom: 36 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", marginBottom: 18 }}>What This Means For You</h3>

          {snippet?.morphologyNote && result.parameters.morphology?.status !== "NORMAL" && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "14px 18px", marginBottom: 16, fontSize: 14, color: "#1e40af", lineHeight: 1.65 }}>
              <strong>About your morphology result:</strong> {snippet.morphologyNote}
            </div>
          )}

          {snippet?.narrative && (
            <div style={{ background: "#fff", border: "1px solid #ece8e3", borderRadius: 16, padding: "24px 22px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: 17, lineHeight: 1.8, color: "#2D2D2D", margin: 0 }}>{snippet.narrative}</p>
            </div>
          )}
        </div>

        {/* Next Steps — interactive checklist */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", marginBottom: 20 }}>Your Next Steps</h3>

          {TIMELINE_ORDER.map((timeline) => {
            const items = actionGroups[timeline];
            if (!items || items.length === 0) return null;
            return (
              <div key={timeline} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0D6E6E", marginBottom: 12 }}>{timeline}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {items.map((action, i) => {
                    const key = `${timeline}-${i}`;
                    const checked = !!checkedActions[key];
                    return (
                      <div key={i} style={{ background: "#fff", border: "1px solid #ece8e3", borderRadius: 12, padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start", opacity: checked ? 0.6 : 1, transition: "opacity 0.2s" }}>
                        <button
                          type="button"
                          onClick={() => toggleAction(timeline, i)}
                          aria-label={checked ? "Uncheck this step" : "Mark this step as done"}
                          style={{ width: 22, height: 22, borderRadius: 6, border: checked ? "none" : "1.5px solid #ccc", background: checked ? "#0D6E6E" : "#fff", flexShrink: 0, marginTop: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                        >
                          {checked && <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>✓</span>}
                        </button>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, lineHeight: 1.55, color: "#2d2d2d", margin: 0, textDecoration: checked ? "line-through" : "none" }}>{action.action}</p>
                          {action.fertiQ && (
                            <a href={FERTIQ_URL} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 12, color: "#0D6E6E", textDecoration: "none", background: "#edf5f5", borderRadius: 999, padding: "4px 10px", fontWeight: 600 }}>
                              FertiQ by ForMen — View supplement →
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* FM Code — at the bottom, after user has read their results */}
        <div style={{ background: "#fff", border: "1.5px solid #a7f3d0", borderRadius: 16, padding: "20px 22px", marginBottom: 32, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, color: "#059669", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Save Your FM Code</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0D6E6E", letterSpacing: "0.08em", fontFamily: "monospace" }}>{fmCode}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Your only key to these results. We don't store your name, email, or phone.</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCopy} style={{ background: "#0D6E6E", color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {copied ? "✓ Copied!" : "Copy Code"}
            </button>
            <button onClick={handleDownload} style={{ background: "#fff", color: "#0D6E6E", border: "1.5px solid #0D6E6E", borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Download
            </button>
          </div>
        </div>

        {/* Scroll to advanced */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => document.getElementById("andrologist-section")?.scrollIntoView({ behavior: "smooth" })}
            style={{ background: "#0D6E6E", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            View Advanced Tests Your Doctor Might Order →
          </button>
        </div>

      </div>
    </div>
  );
}
