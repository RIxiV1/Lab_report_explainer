import { useState, useEffect } from "react";
import ParameterCard from "./ParameterCard";
import Nav from "./Nav";
import {
  PARAM_ORDER, PARAM_META, VERDICT_CONFIG,
  TIMELINE_ORDER, FERTIQ_URL,
} from "../lib/constants";

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

function buildWhatsAppText(result, fmCode, verdictLabel) {
  const params = PARAM_ORDER.map((key) => {
    const p = result.parameters[key];
    if (!p) return null;
    const meta = PARAM_META[key];
    const emoji = p.status === "NORMAL" ? "✅" : p.status === "WARNING" ? "⚠️" : "🔴";
    return `${emoji} ${meta.label}: ${p.value}${meta.unit ? " " + meta.unit : ""}`;
  }).filter(Boolean).join("\n");

  return encodeURIComponent(
    `My Semen Analysis Results — ${verdictLabel}\n\n${params}\n\nFM Code: ${fmCode}\nAnalysed with ForMen Health Lab Report Explainer\nhttps://formen.health/pages/lab-report-explainer`
  );
}

export default function ResultsDashboard({ result, snippet, fmCode, onReset, onBackToInput, onCompare }) {
  const [copied, setCopied] = useState(false);
  const [checkedActions, setCheckedActions] = useState({});
  const verdictCfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.ATTENTION;
  const actionGroups = groupByTimeline(snippet?.actions);

  useEffect(() => {
    if (!fmCode) return;
    try {
      const saved = JSON.parse(localStorage.getItem(`fm_actions_${fmCode}`) || "{}");
      setCheckedActions(saved);
    } catch {}
  }, [fmCode]);

  function toggleAction(timeline, index) {
    const key = `${timeline}-${index}`;
    setCheckedActions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (fmCode) localStorage.setItem(`fm_actions_${fmCode}`, JSON.stringify(next));
      return next;
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(fmCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  function handleDownload() {
    const date = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
    const blob = new Blob([
      `Your FM Lab Report Code: ${fmCode}\nGenerated: ${date}\n\nTo access your results:\nVisit formen.health/pages/lab-report-explainer and enter this code.\n\nNote: Results are stored only on the device where you first generated them.\n\nForMen Health — formen.health`
    ], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fmCode}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleWhatsApp() {
    const text = buildWhatsAppText(result, fmCode, verdictCfg.label);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  const paramStatuses = PARAM_ORDER.map((k) => result.parameters[k]?.status || "NORMAL");
  const normalCount = paramStatuses.filter((s) => s === "NORMAL").length;
  const warningCount = paramStatuses.filter((s) => s === "WARNING").length;
  const criticalCount = paramStatuses.filter((s) => s === "CRITICAL").length;

  return (
    <div className="bg-cream min-h-screen">
      {/* Nav */}
      <Nav sticky className="no-print">
        <button onClick={onBackToInput} className="btn-secondary px-3.5 py-[7px]">&larr; Edit Details</button>
        <button onClick={onReset} className="btn-secondary px-3.5 py-[7px]">Start Fresh</button>
      </Nav>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-5 text-center text-xs text-amber-800" role="alert">
        <strong>This is an explanation, not a diagnosis.</strong> Always consult a qualified andrologist before making medical decisions.
      </div>

      <div className="max-w-[820px] mx-auto px-5 pt-7 pb-20">
        {/* Verdict */}
        <div className={`${verdictCfg.bg} border-[1.5px] ${verdictCfg.border} rounded-2xl p-7 mb-7`}>
          <h2 className={`text-[22px] font-extrabold ${verdictCfg.text} mb-2.5`}>{verdictCfg.label}</h2>
          {snippet?.verdictCard && (
            <p className="text-[15px] leading-[1.7] text-gray-800 mb-4">{snippet.verdictCard}</p>
          )}
          {/* Summary badges */}
          <div className="flex gap-2.5 flex-wrap" aria-label="Parameter summary">
            {[
              { count: normalCount, label: "Normal", cls: "bg-green-100 text-green-700" },
              { count: warningCount, label: "Borderline", cls: "bg-amber-100 text-amber-700" },
              { count: criticalCount, label: "Act Now", cls: "bg-red-100 text-red-700" },
            ].filter((s) => s.count > 0).map((s) => (
              <div key={s.label} className={`${s.cls} rounded-full px-3.5 py-1 flex items-center gap-1.5`}>
                <span className="text-base font-extrabold">{s.count}</span>
                <span className="text-xs font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="no-print flex gap-2 flex-wrap mb-7">
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-1.5 px-4 py-2.5">
            Download PDF
          </button>
          <button
            onClick={handleWhatsApp}
            className="bg-[#25D366] text-white border-none rounded-xl px-4 py-2.5 text-[13px] font-semibold cursor-pointer flex items-center gap-1.5"
          >
            Share on WhatsApp
          </button>
          <button onClick={onCompare} className="btn-secondary flex items-center gap-1.5 px-4 py-2.5">
            Compare with Previous
          </button>
        </div>

        {/* Parameter Cards */}
        <section className="mb-9" aria-label="Your results explained">
          <h3 className="text-lg font-extrabold text-gray-900 mb-4">Your Results, Explained</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3.5">
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
        </section>

        {/* Narrative */}
        <section className="mb-9" aria-label="What this means for you">
          <h3 className="text-lg font-extrabold text-gray-900 mb-4">What This Means For You</h3>

          {snippet?.morphologyNote && result.parameters.morphology?.status !== "NORMAL" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-blue-800 leading-relaxed">
              <strong>About your morphology result:</strong> {snippet.morphologyNote}
            </div>
          )}

          {snippet?.narrative && (
            <div className="card p-6">
              <p className="text-[17px] leading-[1.8] text-gray-800">{snippet.narrative}</p>
            </div>
          )}
        </section>

        {/* Next Steps Checklist */}
        <section className="mb-10" aria-label="Your next steps">
          <h3 className="text-lg font-extrabold text-gray-900 mb-5">Your Next Steps</h3>

          {TIMELINE_ORDER.map((timeline) => {
            const items = actionGroups[timeline];
            if (!items || items.length === 0) return null;
            return (
              <div key={timeline} className="mb-6">
                <div className="text-[13px] font-bold uppercase tracking-wider text-brand-600 mb-3">{timeline}</div>
                <div className="flex flex-col gap-2.5">
                  {items.map((action, i) => {
                    const key = `${timeline}-${i}`;
                    const checked = !!checkedActions[key];
                    return (
                      <div
                        key={i}
                        className={`card rounded-xl p-4 flex gap-3 items-start transition-opacity ${checked ? "opacity-60" : ""}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleAction(timeline, i)}
                          aria-label={checked ? "Uncheck this step" : "Mark this step as done"}
                          className={`no-print w-[22px] h-[22px] rounded-md flex-shrink-0 mt-0.5 cursor-pointer flex items-center justify-center transition-colors ${
                            checked ? "bg-brand-600 border-none" : "bg-white"
                          }`}
                          style={!checked ? { border: "1.5px solid #ccc" } : undefined}
                        >
                          {checked && <span className="text-white text-xs leading-none">&#10003;</span>}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm leading-snug text-gray-800 ${checked ? "line-through" : ""}`}>
                            {action.action}
                          </p>
                          {action.fertiQ && (
                            <a
                              href={FERTIQ_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="no-print inline-flex items-center gap-1 mt-2 text-xs text-brand-600 bg-brand-50 rounded-full px-2.5 py-1 font-semibold no-underline hover:bg-brand-600/10"
                            >
                              FertiQ by ForMen — View supplement &rarr;
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
        </section>

        {/* FM Code */}
        <div className="bg-white border-[1.5px] border-green-300 rounded-2xl p-5 mb-8 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">Save Your FM Code</div>
            <div className="text-[22px] font-extrabold text-brand-600 tracking-widest font-mono">{fmCode}</div>
            <div className="text-xs text-gray-400 mt-1">Your only key to these results. We don't store your name, email, or phone.</div>
          </div>
          <div className="no-print flex gap-2">
            <button onClick={handleCopy} className="btn-primary px-4 py-2.5">
              {copied ? "✓ Copied!" : "Copy Code"}
            </button>
            <button onClick={handleDownload} className="btn-secondary px-4 py-2.5 !text-brand-600 !border-brand-600">
              Download
            </button>
          </div>
        </div>

        {/* Scroll CTA */}
        <div className="no-print text-center">
          <button
            onClick={() => document.getElementById("andrologist-section")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-primary px-6 py-3 text-sm"
          >
            View Food, Supplements & Tests That Can Help &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
