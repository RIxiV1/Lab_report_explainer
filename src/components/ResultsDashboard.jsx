import { useState, useEffect } from "react";
import ParameterCard from "./ParameterCard";
import Nav from "./Nav";
import { PARAM_ORDER, PARAM_META, VERDICT_CONFIG, TIMELINE_ORDER, FERTIQ_URL } from "../lib/constants";
import { getActions, saveActions } from "../lib/resultStore";
import { useCountUp } from "../lib/useCountUp";
import { displayValue } from "../lib/uiUtils";

const CTX_LINES = {
  spermCount: { NORMAL: "Healthy count.", WARNING: "A little low — often improves with changes.", CRITICAL: "There are many ways to improve this." },
  motility:   { NORMAL: "Sperm are moving well.", WARNING: "A bit low — often improves with better food and habits.", CRITICAL: "This usually responds well to treatment." },
  morphology: { NORMAL: "Shape is fine.", WARNING: "This number is easy to misread. The rest of your report matters more.", CRITICAL: "On its own, this rarely decides the outcome." },
  volume:     { NORMAL: "Volume is healthy.", WARNING: "Drink more water and check how the sample was collected.", CRITICAL: "Usually fixes with a proper sample collection." },
  pH:         { NORMAL: "Balanced.", WARNING: "A small finding — nothing serious.", CRITICAL: "Worth showing your doctor." },
  wbc:        { NORMAL: "No signs of infection.", WARNING: "Mild — usually easy to manage.", CRITICAL: "This can be treated. Talk to your doctor." },
};

// Share payload deliberately omits raw numeric values.
// - Privacy: URL query strings get logged, previewed, and cached — raw
//   lab metrics don't belong there.
// - Funnel: recipient must visit the platform to view the full report,
//   which introduces a new user to the brand instead of ending the
//   interaction inside WhatsApp.
function buildWhatsAppText(fmCode, verdictLabel) {
  const lines = [
    "I just got my semen analysis explained by ForMen Health.",
    "",
    `Summary: ${verdictLabel}`,
    `My FM code: ${fmCode}`,
    "",
    "Open it here to see the full breakdown:",
    "https://formen.health/pages/lab-report-explainer",
  ];
  return encodeURIComponent(lines.join("\n"));
}

const DOCTOR_URL = "https://www.formen.health/pages/book-doctor-appointment";

const FOOD_TIPS = [
  { item: "Walnuts, almonds, pumpkin seeds", why: "Zinc + selenium" },
  { item: "Salmon, sardines", why: "Omega-3" },
  { item: "Berries, tomatoes, greens", why: "Antioxidants" },
  { item: "Eggs, lean beef, lentils", why: "B12 + protein" },
];

const LIFESTYLE_TIPS = [
  "Keep laptops off your lap. Avoid very hot baths.",
  "Sleep 7–9 hours. Exercise at least 150 minutes a week.",
  "Cut down on alcohol. Stop smoking if you can.",
];

function TMSCGauge({ value }) {
  const pct = Math.max(2, Math.min(98, (Math.min(value, 50) / 50) * 100));
  return (
    <div className="mt-8" aria-hidden="true">
      {/* Zone labels above */}
      <div className="flex mb-2">
        <div className="text-[10px] text-white/30 uppercase tracking-wide" style={{ width: "10%" }}>IVF</div>
        <div className="text-[10px] text-white/30 uppercase tracking-wide text-center" style={{ width: "30%" }}>IUI</div>
        <div className="text-[10px] text-white/30 uppercase tracking-wide text-right" style={{ width: "60%" }}>Natural</div>
      </div>
      {/* Bar */}
      <div className="relative">
        <div className="flex h-[10px] overflow-hidden" style={{ gap: "2px" }}>
          <div style={{ width: "10%", background: "rgba(249,115,22,0.6)" }} />
          <div style={{ width: "30%", background: "rgba(255,184,0,0.5)" }} />
          <div style={{ width: "60%", background: "rgba(139,185,146,0.45)" }} />
        </div>
        <div className="absolute top-1/2" style={{ left: `${pct}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-5 h-5 rounded-full" style={{ background: "#fff", boxShadow: "0 0 0 3px #111852, 0 0 12px rgba(255,255,255,0.3)" }} />
        </div>
      </div>
      {/* Threshold marks */}
      <div className="relative mt-1 h-4">
        <span className="absolute text-[10px] text-white/40 font-mono" style={{ left: "10%", transform: "translateX(-50%)" }}>5M</span>
        <span className="absolute text-[10px] text-white/40 font-mono" style={{ left: "40%", transform: "translateX(-50%)" }}>20M</span>
      </div>
    </div>
  );
}

export default function ResultsDashboard({ result, snippet, fmCode, onReset, onBackToInput, onCompare }) {
  const [copied, setCopied] = useState(false);
  const [checkedActions, setCheckedActions] = useState({});
  const verdictCfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.ATTENTION;
  const tmsc = result.tmsc;
  // Animated count-up only kicks in when there's a real number to show
  // (>= 1 million). Below that we render "Below 1 million" instead, so
  // the hook still runs but the value isn't displayed.
  const tmscAnimated = useCountUp(tmsc?.value ?? 0);
  const providedKeys = PARAM_ORDER.filter((k) => result.parameters[k] !== undefined);
  const normalCount = providedKeys.filter((k) => result.parameters[k].status === "NORMAL").length;
  const flaggedCount = providedKeys.length - normalCount;

  useEffect(() => {
    if (!fmCode) return;
    setCheckedActions(getActions(fmCode));
  }, [fmCode]);

  function toggleAction(timeline, index) {
    const key = `${timeline}-${index}`;
    setCheckedActions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (fmCode) saveActions(fmCode, next);
      return next;
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(fmCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${buildWhatsAppText(fmCode, verdictCfg.label)}`, "_blank", "noopener,noreferrer");
  }

  const actionGroups = {};
  TIMELINE_ORDER.forEach((t) => (actionGroups[t] = []));
  (snippet?.actions || []).forEach((a) => {
    const key = a.timeline || "Immediate";
    if (!actionGroups[key]) actionGroups[key] = [];
    actionGroups[key].push(a);
  });

  // Trim narrative to first 2 sentences for the hero
  const narrativeShort = snippet?.narrative
    ? snippet.narrative.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")
    : null;

  return (
    <div className="min-h-screen bg-surface">
      <Nav sticky className="no-print" onLogoClick={onReset} />

      {/* ══════ HERO ══════ */}
      <section className="bg-brand-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(ellipse at 85% 15%, rgba(54,69,142,0.5) 0%, transparent 50%), radial-gradient(ellipse at 15% 85%, rgba(54,69,142,0.25) 0%, transparent 50%)',
        }} />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }} />

        <div className="max-w-[800px] mx-auto px-6 pt-16 pb-16 relative z-10">
          {/* Eyebrow — frames the block as a summary, not a verdict */}
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-3 font-semibold">
            Summary of your report
          </p>

          {/* Row 1: Summary state + counts */}
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <h1 className="font-serif text-[clamp(36px,8vw,52px)] leading-none font-bold tracking-tight">
              {verdictCfg.label}
            </h1>
            <div className="flex gap-2">
              {normalCount > 0 && (
                <span className="text-[11px] font-semibold px-2.5 py-1" style={{ background: "rgba(139,185,146,0.15)", color: "#8BB992" }}>
                  {normalCount} Normal
                </span>
              )}
              {flaggedCount > 0 && (
                <span className="text-[11px] font-semibold px-2.5 py-1" style={{ background: "rgba(255,184,0,0.15)", color: "#FFB800" }}>
                  {flaggedCount} Flagged
                </span>
              )}
            </div>
          </div>

          {/* Clinical sign-off — explicit that this is not a diagnosis */}
          <p className="text-[11px] text-white/40 mb-6 leading-relaxed max-w-[560px]">
            A simple summary of your report, compared to WHO 2021 ranges.
            This is not a diagnosis. For any medical decision, please see a doctor.
          </p>

          {/* Row 2: Short narrative (2 sentences only) */}
          {narrativeShort && (
            <p className="text-[15px] leading-[1.8] text-white/60 max-w-[600px] mb-10">
              {narrativeShort}
            </p>
          )}

          {/* Row 3: TMSC — the visual centerpiece.
              When the value is below 1 million, a literal "0" or "0.3"
              reads like the calculator failed. We show "Below 1 million"
              instead — more honest and less alarming. */}
          {tmsc && (
            <div className="mb-10 max-w-[500px]">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Total Motile Sperm Count</p>
              <div className="flex items-baseline gap-2">
                {tmsc.value < 1 ? (
                  <span className="font-serif text-[clamp(40px,8vw,56px)] font-bold text-white leading-none tracking-tight">
                    Below 1 million
                  </span>
                ) : (
                  <>
                    <span className="font-serif text-[clamp(56px,12vw,80px)] font-bold text-white leading-none tabular-nums tracking-tight">
                      {displayValue(tmscAnimated)}
                    </span>
                    <span className="text-[13px] text-white/35 font-medium">million</span>
                  </>
                )}
              </div>
              <TMSCGauge value={tmsc.value} />
              <span className="inline-block mt-4 px-3 py-1 text-[11px] font-bold uppercase tracking-wide" style={{
                background: tmsc.tier === "NATURAL" ? "rgba(139,185,146,0.2)" : tmsc.tier === "IUI" ? "rgba(255,184,0,0.2)" : "rgba(249,115,22,0.2)",
                color: tmsc.tier === "NATURAL" ? "#a8d5b0" : tmsc.tier === "IUI" ? "#FFD54F" : "#fb923c",
              }}>
                {tmsc.tierLabel}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="no-print flex gap-2 flex-wrap">
            <button onClick={() => window.print()} className="bg-white text-brand-900 font-semibold px-5 py-2.5 text-[11px] uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors" style={{ boxShadow: '0 4px 16px rgba(17,24,82,0.2)' }}>
              Print Report
            </button>
            <button onClick={handleWhatsApp} className="bg-brand-500 text-white font-semibold px-5 py-2.5 text-[11px] uppercase tracking-wide cursor-pointer hover:bg-[#283573] transition-colors">
              Share
            </button>
            <button onClick={onBackToInput} className="text-white/40 hover:text-white/80 font-semibold px-5 py-2.5 text-[11px] uppercase tracking-wide cursor-pointer bg-transparent transition-colors" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              Edit Details
            </button>
          </div>
        </div>
      </section>

      {/* ══════ CONTENT ══════ */}
      <div className="max-w-[800px] mx-auto px-6 py-14">

        {/* ── Parameter Cards ── */}
        <section className="mb-14">
          {/* Anchor "WHO 2021" inline with the heading on its own
              baseline so it reads as a stamp/source, not a floating
              UI label. Lower opacity, smaller letter-spacing. */}
          <div className="mb-6 flex items-end gap-3 flex-wrap">
            <h2 className="font-serif text-[24px] font-bold text-gray-900 tracking-tight leading-none">Your Results</h2>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold leading-none translate-y-[-2px]">
              measured against WHO 2021
            </span>
          </div>
          {/* items-start = an expanded card grows down without dragging
              its row siblings taller. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
            {providedKeys.map((key, i) => {
              const p = result.parameters[key];
              const meta = PARAM_META[key];
              // Staggered reveal: each card fades up 90ms after the
              // previous one. The wrapper carries the animation so the
              // ParameterCard's own card-tonal hover effects stay clean.
              // Inline style sets the per-index delay; the @keyframes
              // editorial-fade-up runs on each div independently.
              return (
                <div
                  key={key}
                  className="animate-editorial opacity-0"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <ParameterCard
                    paramKey={key} paramName={meta.label}
                    value={displayValue(p.value)} unit={meta.unit} whoRange={meta.whoRange}
                    status={p.status} contextualizingLine={CTX_LINES[key]?.[p.status] || ""}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* ── "Normal but not conceiving" callout ── */}
        {snippet?.notConceivingNote && (
          <section className="mb-14">
            <div className="p-6 border-l-[3px] border-brand-500 bg-brand-50/60">
              <p className="text-[11px] uppercase tracking-wider font-bold text-brand-800 mb-2">
                Still not conceiving?
              </p>
              <p className="text-[14px] text-gray-800 leading-relaxed">
                {snippet.notConceivingNote}
              </p>
            </div>
          </section>
        )}

        {/* ── Doctor CTA ── */}
        <section className="mb-14 no-print">
          <div className="p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5" style={{ background: "linear-gradient(135deg, #F2F3F9, #EAECFA)", border: '1px solid rgba(218,225,249,0.4)' }}>
            <div>
              <p className="font-serif text-[20px] font-bold text-gray-900 mb-1">Talk to a fertility doctor</p>
              <p className="text-[13px] text-gray-500 max-w-[380px]">A 15-minute call. A doctor will go through your exact numbers with you.</p>
            </div>
            <a href={DOCTOR_URL} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0 no-print">
              Book Free Call
            </a>
          </div>
        </section>

        {/* ── Next Steps ── */}
        {snippet?.actions && snippet.actions.length > 0 && (
          <section className="mb-14">
            <h2 className="font-serif text-[24px] font-bold text-gray-900 tracking-tight mb-5">Next Steps</h2>
            <div className="card-tonal overflow-hidden">
              {TIMELINE_ORDER.map((timeline, index) => {
                const items = actionGroups[timeline];
                if (!items || items.length === 0) return null;
                return (
                  <div key={timeline} style={index > 0 ? { borderTop: '1px solid rgba(198,197,210,0.12)' } : undefined}>
                    <div className="bg-surface-mid px-5 py-2" style={{ borderBottom: '1px solid rgba(198,197,210,0.08)' }}>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500">{timeline}</p>
                    </div>
                    <div className="p-5 space-y-3">
                      {items.map((action, i) => {
                        const key = `${timeline}-${i}`;
                        const checked = !!checkedActions[key];
                        return (
                          <div key={i} className={`flex gap-3 items-start ${checked ? "opacity-30" : ""}`} style={{ transition: 'opacity 0.3s' }}>
                            <button
                              type="button" onClick={() => toggleAction(timeline, i)}
                              className={`no-print w-[18px] h-[18px] shrink-0 mt-0.5 flex items-center justify-center cursor-pointer ${checked ? "bg-brand-500" : "bg-white"}`}
                              style={{ border: checked ? '1.5px solid #36458E' : '1.5px solid rgba(198,197,210,0.4)' }}
                            >
                              {checked && <span className="text-white text-[10px] leading-none">✓</span>}
                            </button>
                            <div className="flex-1">
                              <p className={`text-[13px] leading-relaxed text-gray-800 ${checked ? "line-through" : ""}`}>{action.action}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Support Your Journey — commerce card, deliberately separated
             from the clinical action rail to preserve medical authority.
             Copy is per-result (snippet.fertiQContext) so the supplement
             reads as a solution to *this* report, not a generic banner. ── */}
        {snippet?.actions?.some((a) => a.fertiQ) && (
          <section className="mb-14 no-print">
            <div className="p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5" style={{ background: "linear-gradient(135deg, #FAF7F1, #F4EDE0)", border: '1px solid rgba(218,198,168,0.4)' }}>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">Built for your result</p>
                <p className="font-serif text-[20px] font-bold text-gray-900 mb-1">FertiQ by ForMen Health</p>
                <p className="text-[13px] text-gray-600 max-w-[440px] leading-relaxed">
                  {snippet.fertiQContext ||
                    "A daily fertility supplement with CoQ10, zinc, and antioxidants. Built to support the lifestyle steps above — not replace medical care."}
                </p>
              </div>
              <a href={FERTIQ_URL} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0">
                Learn about FertiQ
              </a>
            </div>
          </section>
        )}

        {/* ── While You Wait — single compact block ── */}
        <section className="mb-14">
          <h2 className="font-serif text-[24px] font-bold text-gray-900 tracking-tight mb-5">Healthy Habits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-surface-divider">
            <div className="bg-white p-5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-3">Diet</p>
              {FOOD_TIPS.map((tip, i) => (
                <p key={i} className="text-[12px] text-gray-700 mb-1.5 last:mb-0">
                  <span className="font-semibold text-gray-900">{tip.item}</span>
                  <span className="text-gray-500"> — {tip.why}</span>
                </p>
              ))}
            </div>
            <div className="bg-white p-5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-3">Lifestyle</p>
              {LIFESTYLE_TIPS.map((tip, i) => (
                <p key={i} className="text-[12px] text-gray-600 mb-1.5 last:mb-0">{tip}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <div className="py-5" style={{ borderTop: '1px solid rgba(198,197,210,0.15)' }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="text-left">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Your save code</p>
              <p className="font-mono text-base font-bold text-gray-800 tracking-widest">{fmCode}</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] no-print">
              <button onClick={handleCopy} className="font-semibold text-brand-600 hover:text-brand-800 cursor-pointer bg-transparent border-none transition-colors">{copied ? "Copied!" : "Copy"}</button>
              <span className="text-gray-200">·</span>
              <button onClick={onCompare} className="font-semibold text-brand-600 hover:text-brand-800 cursor-pointer bg-transparent border-none transition-colors">Compare</button>
              <span className="text-gray-200">·</span>
              <button onClick={onReset} className="font-semibold text-gray-500 hover:text-gray-700 cursor-pointer bg-transparent border-none transition-colors">Reset</button>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 leading-relaxed max-w-[480px] no-print">
            Save this code to come back to your report on this phone — no signup, no password. Tap "Reopen a previous report" on the home screen.
          </p>
        </div>
      </div>
    </div>
  );
}
