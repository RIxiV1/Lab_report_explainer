import { useRef } from "react";
import ParameterCard from "./ParameterCard";

/* ── Contextualizing lines lookup ── */
const CTX_LINES = {
  spermCount: {
    NORMAL: "Your concentration is within healthy range.",
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
    WARNING: "Slightly below 4% — this is the most commonly misread value. Context matters more than the number.",
    CRITICAL: "Below standard, but morphology alone rarely determines fertility outcomes.",
  },
  volume: {
    NORMAL: "Semen volume is healthy.",
    WARNING: "Volume is outside the typical range — worth discussing with a doctor.",
    CRITICAL: "Volume significantly outside range — may affect sperm delivery.",
  },
  pH: {
    NORMAL: "Acidity is balanced.",
    WARNING: "Slightly outside normal range — could indicate a minor issue worth checking.",
    CRITICAL: "pH outside safe range — can indicate infection or blockage.",
  },
  wbc: {
    NORMAL: "No signs of infection in your sample.",
    WARNING: "Mildly elevated white blood cells — may indicate mild inflammation.",
    CRITICAL: "Elevated pus cells — a sign of possible infection requiring medical attention.",
  },
};

/* ── Parameter metadata ── */
const PARAM_META = {
  spermCount: { label: "Sperm Count", unit: "million/mL", whoRange: "≥ 16 million/mL" },
  motility: { label: "Motility", unit: "%", whoRange: "≥ 42%" },
  morphology: { label: "Morphology", unit: "%", whoRange: "≥ 4% (Kruger)" },
  volume: { label: "Volume", unit: "mL", whoRange: "1.4 – 7.6 mL" },
  pH: { label: "pH", unit: "", whoRange: "7.2 – 8.0" },
  wbc: { label: "WBC", unit: "million/mL", whoRange: "< 1 million/mL" },
};

const PARAM_ORDER = ["spermCount", "motility", "morphology", "volume", "pH", "wbc"];

/* ── Verdict config ── */
const VERDICT_CONFIG = {
  ALL_NORMAL: {
    bg: "#f0fdf4", border: "#15803d", icon: "✅", label: "Looking Good",
  },
  ATTENTION: {
    bg: "#fffbeb", border: "#d97706", icon: "🟡", label: "Needs Attention",
  },
  ACT_NOW: {
    bg: "#fef2f2", border: "#dc2626", icon: "🔴", label: "Act Now",
  },
};

/* ── Timeline grouping ── */
const TIMELINE_ORDER = ["Immediate", "30 Days", "90 Days"];

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

/* ── Component ── */
export default function ResultsDashboard({ result, snippet, fmCode }) {
  const advancedRef = useRef(null);

  const verdictCfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.ATTENTION;

  /* Copy FM Code */
  const handleCopy = () => {
    navigator.clipboard.writeText(fmCode).catch(() => {});
  };

  /* Download FM Code as .txt */
  const handleDownload = () => {
    const blob = new Blob(
      [`FM Lab Report Explainer\n\nYour FM Code: ${fmCode}\n\nSave this code to return to your results.\n`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fm-code-${fmCode}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const scrollToAdvanced = () => {
    advancedRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const actionGroups = groupByTimeline(snippet?.actions);

  return (
    <div style={styles.page}>
      {/* ── Sticky Disclaimer ── */}
      <div style={styles.disclaimer}>
        📋 This is an explanation, not a diagnosis. Always consult a qualified andrologist before making medical decisions.
      </div>

      <div style={styles.content}>
        {/* ── ZONE 1: Verdict Card ── */}
        <div
          style={{
            ...styles.verdictCard,
            background: verdictCfg.bg,
            borderLeft: `4px solid ${verdictCfg.border}`,
          }}
        >
          <h2 style={styles.verdictTitle}>
            {verdictCfg.icon} {verdictCfg.label}
          </h2>
          {snippet?.verdictCard && (
            <p style={styles.verdictText}>{snippet.verdictCard}</p>
          )}
        </div>

        {/* FM Code Box */}
        <div style={styles.fmCodeBox}>
          <p style={styles.fmCodeLabel}>🔐 Your FM Code: <strong>{fmCode}</strong></p>
          <p style={styles.fmCodeSub}>
            This is your only key to these results. We don't store your name, email, or phone — that's intentional.
          </p>
          <div style={styles.fmCodeButtons}>
            <button onClick={handleCopy} style={styles.btnTealSolid}>📋 Copy Code</button>
            <button onClick={handleDownload} style={styles.btnTealOutline}>⬇ Download .txt</button>
          </div>
        </div>

        {/* ── ZONE 2: Parameter Breakdown ── */}
        <h3 style={styles.sectionTitle}>Your Results, Explained</h3>
        <div style={styles.paramGrid}>
          {PARAM_ORDER.map((key) => {
            const p = result.parameters[key];
            if (!p) return null;
            const meta = PARAM_META[key];
            const ctxLine = CTX_LINES[key]?.[p.status] || "";
            return (
              <ParameterCard
                key={key}
                paramName={meta.label}
                value={p.value}
                unit={meta.unit}
                whoRange={meta.whoRange}
                status={p.status}
                contextualizingLine={ctxLine}
              />
            );
          })}
        </div>

        {/* ── ZONE 3: What This Means For You ── */}
        <h3 style={styles.sectionTitle}>What This Means For You</h3>

        {snippet?.morphologyNote &&
          result.parameters.morphology?.status !== "NORMAL" && (
            <div style={styles.morphNote}>
              <p style={{ margin: 0 }}>
                ℹ️ <strong>About your morphology result:</strong> {snippet.morphologyNote}
              </p>
            </div>
          )}

        {snippet?.narrative && (
          <div style={styles.narrativeCard}>
            <p style={styles.narrativeText}>{snippet.narrative}</p>
            <p style={styles.partnerNote}>
              This is the paragraph your partner probably wants to read too.
            </p>
          </div>
        )}

        {/* ── ZONE 4: Your Next Steps ── */}
        <h3 style={styles.sectionTitle}>Your Next Steps</h3>
        {TIMELINE_ORDER.map((timeline) => {
          const items = actionGroups[timeline];
          if (!items || items.length === 0) return null;
          return (
            <div key={timeline} style={{ marginBottom: 20 }}>
              <h4 style={styles.timelineLabel}>{timeline}</h4>
              {items.map((action, i) => (
                <div key={i} style={styles.actionRow}>
                  <span style={styles.checkbox}>☐</span>
                  <div>
                    <p style={styles.actionText}>{action.action}</p>
                    {action.fertiQ && (
                      <a
                        href="https://www.formen.health/products/fertiq?utm_source=lab_explainer&utm_medium=report&utm_campaign=fertiq_cta"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.fertiqLink}
                      >
                        FertiQ by ForMen — formulated for sperm health. View product →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* ── BOTTOM: Advanced Tests ── */}
        <hr style={styles.divider} />
        <div style={styles.bottomSection}>
          <p style={styles.bottomText}>
            Want to go deeper? See what tests your andrologist might recommend.
          </p>
          <button onClick={scrollToAdvanced} style={styles.btnTealOutline}>
            View Advanced Tests →
          </button>
        </div>

        <div ref={advancedRef} style={{ paddingTop: 24 }} />
      </div>
    </div>
  );
}

/* ── Styles ── */
const styles = {
  page: {
    background: "#FAF8F5",
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
    color: "#2D2D2D",
  },
  disclaimer: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "#fffbeb",
    color: "#92400e",
    fontSize: 13,
    padding: "10px 16px",
    textAlign: "center",
    lineHeight: 1.5,
    borderBottom: "1px solid #fde68a",
  },
  content: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "24px 16px 64px",
  },
  /* Verdict */
  verdictCard: {
    borderRadius: 12,
    padding: "24px 20px",
    marginBottom: 16,
  },
  verdictTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 8px",
  },
  verdictText: {
    fontSize: 15,
    lineHeight: 1.6,
    margin: 0,
    color: "#3a3a3a",
  },
  /* FM Code */
  fmCodeBox: {
    background: "#f0fdfa",
    border: "1px solid #99f6e4",
    borderRadius: 12,
    padding: "20px",
    marginBottom: 32,
    textAlign: "center",
  },
  fmCodeLabel: {
    fontSize: 17,
    margin: "0 0 6px",
    color: "#0D6E6E",
  },
  fmCodeSub: {
    fontSize: 13,
    color: "#5A5A5A",
    margin: "0 0 16px",
    lineHeight: 1.5,
  },
  fmCodeButtons: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnTealSolid: {
    background: "#0D6E6E",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnTealOutline: {
    background: "transparent",
    color: "#0D6E6E",
    border: "2px solid #0D6E6E",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  /* Sections */
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    margin: "32px 0 16px",
    color: "#1a1a1a",
  },
  /* Param grid */
  paramGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 16,
  },
  /* Morphology note */
  morphNote: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: "14px 16px",
    fontSize: 14,
    lineHeight: 1.6,
    color: "#1e40af",
    marginBottom: 16,
  },
  /* Narrative */
  narrativeCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: "24px 20px",
    marginBottom: 8,
  },
  narrativeText: {
    fontSize: 17,
    lineHeight: 1.75,
    margin: 0,
    color: "#2D2D2D",
  },
  partnerNote: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
    marginTop: 12,
    marginBottom: 0,
  },
  /* Actions */
  timelineLabel: {
    fontSize: 14,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#0D6E6E",
    margin: "0 0 10px",
  },
  actionRow: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 14,
  },
  checkbox: {
    fontSize: 18,
    lineHeight: 1.4,
    color: "#999",
    flexShrink: 0,
  },
  actionText: {
    fontSize: 15,
    lineHeight: 1.5,
    margin: "0 0 4px",
  },
  fertiqLink: {
    fontSize: 13,
    color: "#0D6E6E",
    textDecoration: "underline",
    display: "inline-block",
  },
  /* Bottom */
  divider: {
    border: "none",
    borderTop: "1px solid #e0e0e0",
    margin: "40px 0 24px",
  },
  bottomSection: {
    textAlign: "center",
  },
  bottomText: {
    fontSize: 15,
    color: "#5A5A5A",
    marginBottom: 16,
  },
};
