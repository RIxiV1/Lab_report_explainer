import { useState } from "react";
import { useFMCode } from "../hooks/useFMCode";


const FM_CODE_REGEX = /^FM-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

const PARAM_ORDER = ["spermCount", "motility", "morphology", "volume", "pH", "wbc"];
const PARAM_META = {
  spermCount: { label: "Sperm Count", unit: "million/mL", higherBetter: true },
  motility:   { label: "Motility",    unit: "%",          higherBetter: true },
  morphology: { label: "Morphology",  unit: "%",          higherBetter: true },
  volume:     { label: "Volume",      unit: "mL",         higherBetter: null },
  pH:         { label: "pH",          unit: "",            higherBetter: null },
  wbc:        { label: "WBC",         unit: "million/mL",  higherBetter: false },
};

const STATUS_COLORS = {
  NORMAL:   { bg: "#dcfce7", color: "#15803d" },
  WARNING:  { bg: "#fef3c7", color: "#b45309" },
  CRITICAL: { bg: "#ffe4e6", color: "#be123c" },
};

function getDelta(oldVal, newVal, higherBetter) {
  if (oldVal == null || newVal == null) return null;
  const diff = newVal - oldVal;
  if (diff === 0) return { label: "No change", color: "#94a3b8" };
  const pct = oldVal !== 0 ? Math.abs((diff / oldVal) * 100).toFixed(0) : "—";
  const arrow = diff > 0 ? "↑" : "↓";
  let color = "#94a3b8";
  if (higherBetter === true) color = diff > 0 ? "#15803d" : "#be123c";
  else if (higherBetter === false) color = diff < 0 ? "#15803d" : "#be123c";
  return { label: `${arrow} ${pct}%`, color };
}

export default function CompareView({ onBack, initialCode }) {
  const { loadResult } = useFMCode();
  const [codeA, setCodeA] = useState(initialCode || "");
  const [codeB, setCodeB] = useState("");
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [error, setError] = useState("");

  function loadCode(code, setter) {
    const trimmed = code.trim().toUpperCase();
    if (!FM_CODE_REGEX.test(trimmed)) {
      setError(`Invalid code format: ${code}`);
      return false;
    }
    const stored = loadResult(trimmed);
    if (!stored) {
      setError(`No results found for ${trimmed}. Results are stored on this device only.`);
      return false;
    }
    setter(stored.result);
    setError("");
    return true;
  }

  function handleCompare() {
    setError("");
    const a = loadCode(codeA, setResultA);
    if (!a) return;
    const b = loadCode(codeB, setResultB);
    if (!b) return;
  }

  const hasResults = resultA && resultB;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #ece8e3", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#0D6E6E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔬</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0D6E6E", lineHeight: 1.1 }}>ForMen Health</div>
            <div style={{ fontSize: 11, color: "#999", lineHeight: 1.1 }}>Lab Report Explainer</div>
          </div>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1.5px solid #ddd", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "#555", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
          ← Back to Report
        </button>
      </nav>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 20px 80px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0d1f1f", marginBottom: 8 }}>Compare Two Reports</h1>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 28, lineHeight: 1.6 }}>
          Enter two FM codes to see how your numbers have changed. Perfect for tracking progress after your 90-day improvement plan.
        </p>

        {/* Code Inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "end", marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 6 }}>Older Report</label>
            <input
              type="text" placeholder="FM-XXXX-XXXX" value={codeA}
              onChange={(e) => { setCodeA(e.target.value); setError(""); }}
              style={{ width: "100%", border: "1.5px solid #ddd", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", letterSpacing: "0.05em", textTransform: "uppercase", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ fontSize: 18, color: "#ccc", paddingBottom: 10 }}>vs</div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 6 }}>Newer Report</label>
            <input
              type="text" placeholder="FM-XXXX-XXXX" value={codeB}
              onChange={(e) => { setCodeB(e.target.value); setError(""); }}
              style={{ width: "100%", border: "1.5px solid #ddd", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", letterSpacing: "0.05em", textTransform: "uppercase", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {error && <p style={{ fontSize: 13, color: "#e55", marginBottom: 16 }}>{error}</p>}

        <button onClick={handleCompare} style={{ background: "#0D6E6E", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginBottom: 32 }}>
          Compare Reports
        </button>

        {/* Results Table */}
        {hasResults && (
          <div style={{ background: "#fff", border: "1px solid #ece8e3", borderRadius: 16, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", padding: "14px 18px", borderBottom: "1px solid #ece8e3", background: "#faf8f5" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>Parameter</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", textAlign: "center" }}>Before</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", textAlign: "center" }}>After</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", textAlign: "center" }}>Change</div>
            </div>

            {/* Rows */}
            {PARAM_ORDER.map((key) => {
              const meta = PARAM_META[key];
              const pA = resultA.parameters[key];
              const pB = resultB.parameters[key];
              if (!pA || !pB) return null;
              const delta = getDelta(pA.value, pB.value, meta.higherBetter);
              const colA = STATUS_COLORS[pA.status] || STATUS_COLORS.NORMAL;
              const colB = STATUS_COLORS[pB.status] || STATUS_COLORS.NORMAL;

              return (
                <div key={key} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", padding: "14px 18px", borderBottom: "1px solid #f0ebe5", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{meta.label}</div>
                    {meta.unit && <div style={{ fontSize: 11, color: "#aaa" }}>{meta.unit}</div>}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>{pA.value}</span>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, background: colA.bg, color: colA.color, padding: "2px 8px", borderRadius: 999 }}>{pA.status === "NORMAL" ? "Normal" : pA.status === "WARNING" ? "Borderline" : "Critical"}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>{pB.value}</span>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, background: colB.bg, color: colB.color, padding: "2px 8px", borderRadius: 999 }}>{pB.status === "NORMAL" ? "Normal" : pB.status === "WARNING" ? "Borderline" : "Critical"}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    {delta && (
                      <span style={{ fontSize: 15, fontWeight: 700, color: delta.color }}>{delta.label}</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            <div style={{ padding: "16px 18px", background: "#faf8f5" }}>
              {(() => {
                const improvedCount = PARAM_ORDER.filter((key) => {
                  const a = resultA.parameters[key];
                  const b = resultB.parameters[key];
                  if (!a || !b) return false;
                  const statusRank = { CRITICAL: 0, WARNING: 1, NORMAL: 2 };
                  return statusRank[b.status] > statusRank[a.status];
                }).length;
                const declinedCount = PARAM_ORDER.filter((key) => {
                  const a = resultA.parameters[key];
                  const b = resultB.parameters[key];
                  if (!a || !b) return false;
                  const statusRank = { CRITICAL: 0, WARNING: 1, NORMAL: 2 };
                  return statusRank[b.status] < statusRank[a.status];
                }).length;

                return (
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {improvedCount > 0 && (
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>
                        {improvedCount} parameter{improvedCount > 1 ? "s" : ""} improved
                      </span>
                    )}
                    {declinedCount > 0 && (
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#be123c" }}>
                        {declinedCount} parameter{declinedCount > 1 ? "s" : ""} declined
                      </span>
                    )}
                    {improvedCount === 0 && declinedCount === 0 && (
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>No status changes between reports</span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
