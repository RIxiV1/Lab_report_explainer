import { useState, useEffect } from "react";
import ParameterCard from "./ParameterCard";
import Nav from "./Nav";
import { PARAM_ORDER, PARAM_META, VERDICT_CONFIG, TIMELINE_ORDER, FERTIQ_URL } from "../lib/constants";

const CTX_LINES = {
  spermCount: { NORMAL: "Within healthy range.", WARNING: "Slightly below WHO — commonly improvable.", CRITICAL: "Treatment options are well-established." },
  motility:   { NORMAL: "Moving well.", WARNING: "Slightly reduced — responds to nutrition.", CRITICAL: "Most responsive parameter to treatment." },
  morphology: { NORMAL: "Shape within guidelines.", WARNING: "Most misread value — context matters more.", CRITICAL: "Rarely determines outcomes alone." },
  volume:     { NORMAL: "Volume is healthy.", WARNING: "Check collection technique and hydration.", CRITICAL: "Usually resolves with proper collection." },
  pH:         { NORMAL: "Balanced.", WARNING: "Minor finding.", CRITICAL: "Worth a follow-up." },
  wbc:        { NORMAL: "No infection signs.", WARNING: "Mild — usually manageable.", CRITICAL: "Treatable — talk to your doctor." },
};

function buildWhatsAppText(result, fmCode, verdictLabel) {
  const params = PARAM_ORDER.map((key) => {
    const p = result.parameters[key];
    if (!p) return null;
    const meta = PARAM_META[key];
    return `${meta.label}: ${p.value}${meta.unit ? " " + meta.unit : ""}`;
  }).filter(Boolean).join("\n");
  const tmscLine = result.tmsc ? `\nTMSC: ${result.tmsc.value}M — ${result.tmsc.tierLabel}` : "";
  return encodeURIComponent(`My Semen Analysis — ${verdictLabel}${tmscLine}\n\n${params}\n\nFM Code: ${fmCode}\nhttps://formen.health/pages/lab-report-explainer`);
}

const DOCTOR_URL = "https://www.formen.health/pages/book-doctor-appointment";

const FOOD_TIPS = [
  { item: "Walnuts, almonds, pumpkin seeds", why: "Zinc + selenium" },
  { item: "Salmon, sardines", why: "Omega-3" },
  { item: "Berries, tomatoes, greens", why: "Antioxidants" },
  { item: "Eggs, lean beef, lentils", why: "B12 + protein" },
];

const LIFESTYLE_TIPS = [
  "Avoid laptops on lap and hot baths",
  "Sleep 7–9 hrs, exercise 150 min/week",
  "Cut alcohol to ≤ 4/week; stop smoking",
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

// Round display values to avoid OCR artifacts like "7.707"
function displayValue(value) {
  if (Number.isInteger(value)) return value;
  const str = String(value);
  const decimals = str.includes(".") ? str.split(".")[1].length : 0;
  if (decimals > 1) return Math.round(value * 10) / 10;
  return value;
}

export default function ResultsDashboard({ result, snippet, fmCode, onReset, onBackToInput, onCompare }) {
  const [copied, setCopied] = useState(false);
  const [checkedActions, setCheckedActions] = useState({});
  const verdictCfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.ATTENTION;
  const tmsc = result.tmsc;
  const providedKeys = PARAM_ORDER.filter((k) => result.parameters[k] !== undefined);
  const normalCount = providedKeys.filter((k) => result.parameters[k].status === "NORMAL").length;
  const flaggedCount = providedKeys.length - normalCount;

  useEffect(() => {
    if (!fmCode) return;
    try { setCheckedActions(JSON.parse(localStorage.getItem(`fm_actions_${fmCode}`) || "{}")); } catch {}
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
    navigator.clipboard.writeText(fmCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${buildWhatsAppText(result, fmCode, verdictCfg.label)}`, "_blank", "noopener,noreferrer");
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
    <div className="min-h-screen bg-[#F4FAFB]">
      <Nav sticky className="no-print" onLogoClick={onReset} />

      {/* ══════ HERO ══════ */}
      <section className="bg-[#111852] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(ellipse at 85% 15%, rgba(54,69,142,0.5) 0%, transparent 50%), radial-gradient(ellipse at 15% 85%, rgba(54,69,142,0.25) 0%, transparent 50%)',
        }} />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }} />

        <div className="max-w-[800px] mx-auto px-6 pt-16 pb-16 relative z-10">
          {/* Row 1: Verdict + counts */}
          <div className="flex items-center gap-4 flex-wrap mb-6">
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

          {/* Row 2: Short narrative (2 sentences only) */}
          {narrativeShort && (
            <p className="text-[15px] leading-[1.8] text-white/60 max-w-[600px] mb-10">
              {narrativeShort}
            </p>
          )}

          {/* Row 3: TMSC — the visual centerpiece */}
          {tmsc && (
            <div className="mb-10 max-w-[500px]">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Total Motile Sperm Count</p>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-[clamp(56px,12vw,80px)] font-bold text-white leading-none tabular-nums tracking-tight">
                  {displayValue(tmsc.value)}
                </span>
                <span className="text-[13px] text-white/35 font-medium">million</span>
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
            <button onClick={() => window.print()} className="bg-white text-[#111852] font-semibold px-5 py-2.5 text-[11px] uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors" style={{ boxShadow: '0 4px 16px rgba(17,24,82,0.2)' }}>
              Print Report
            </button>
            <button onClick={handleWhatsApp} className="bg-[#36458E] text-white font-semibold px-5 py-2.5 text-[11px] uppercase tracking-wide cursor-pointer hover:bg-[#283573] transition-colors">
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
          <div className="flex items-baseline justify-between mb-6">
            <h3 className="font-serif text-[24px] font-bold text-gray-900 tracking-tight">Your Results</h3>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">WHO 2021</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {providedKeys.map((key) => {
              const p = result.parameters[key];
              const meta = PARAM_META[key];
              return (
                <ParameterCard
                  key={key} paramKey={key} paramName={meta.label}
                  value={displayValue(p.value)} unit={meta.unit} whoRange={meta.whoRange}
                  status={p.status} contextualizingLine={CTX_LINES[key]?.[p.status] || ""}
                />
              );
            })}
          </div>
        </section>

        {/* ── Doctor CTA ── */}
        <section className="mb-14">
          <div className="p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5" style={{ background: "linear-gradient(135deg, #F2F3F9, #EAECFA)", border: '1px solid rgba(218,225,249,0.4)' }}>
            <div>
              <p className="font-serif text-[20px] font-bold text-gray-900 mb-1">Speak to a Specialist</p>
              <p className="text-[13px] text-gray-500 max-w-[380px]">15 minutes to walk through your exact results with a fertility doctor.</p>
            </div>
            <a href={DOCTOR_URL} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0">
              Book Free Consultation
            </a>
          </div>
        </section>

        {/* ── Next Steps ── */}
        {snippet?.actions && snippet.actions.length > 0 && (
          <section className="mb-14">
            <h3 className="font-serif text-[24px] font-bold text-gray-900 tracking-tight mb-5">Next Steps</h3>
            <div className="card-tonal overflow-hidden">
              {TIMELINE_ORDER.map((timeline, index) => {
                const items = actionGroups[timeline];
                if (!items || items.length === 0) return null;
                return (
                  <div key={timeline} style={index > 0 ? { borderTop: '1px solid rgba(198,197,210,0.12)' } : undefined}>
                    <div className="bg-[#EFF5F6] px-5 py-2" style={{ borderBottom: '1px solid rgba(198,197,210,0.08)' }}>
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
                              {action.fertiQ && (
                                <a href={FERTIQ_URL} target="_blank" rel="noopener noreferrer" className="no-print inline-block mt-1 text-[10px] text-brand-600 font-semibold uppercase tracking-wide hover:text-brand-800 transition-colors">
                                  Explore FertiQ &rarr;
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
          </section>
        )}

        {/* ── While You Wait — single compact block ── */}
        <section className="mb-14">
          <h3 className="font-serif text-[24px] font-bold text-gray-900 tracking-tight mb-5">While You Wait</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[#E3E9EA]">
            <div className="bg-white p-5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-3">Diet</p>
              {FOOD_TIPS.map((tip, i) => (
                <p key={i} className="text-[12px] text-gray-700 mb-1.5 last:mb-0">
                  <span className="font-semibold text-gray-900">{tip.item}</span>
                  <span className="text-gray-400"> — {tip.why}</span>
                </p>
              ))}
            </div>
            <div className="bg-white p-5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-3">Lifestyle</p>
              {LIFESTYLE_TIPS.map((tip, i) => (
                <p key={i} className="text-[12px] text-gray-600 mb-1.5 last:mb-0">{tip}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <div className="flex flex-col md:flex-row items-center justify-between py-5 gap-3" style={{ borderTop: '1px solid rgba(198,197,210,0.15)' }}>
          <div className="text-center md:text-left">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">FM Code</p>
            <p className="font-mono text-base font-bold text-gray-800 tracking-widest">{fmCode}</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <button onClick={handleCopy} className="font-semibold text-brand-600 hover:text-brand-800 cursor-pointer bg-transparent border-none transition-colors">{copied ? "Copied!" : "Copy"}</button>
            <span className="text-gray-200">·</span>
            <button onClick={onCompare} className="font-semibold text-brand-600 hover:text-brand-800 cursor-pointer bg-transparent border-none transition-colors">Compare</button>
            <span className="text-gray-200">·</span>
            <button onClick={onReset} className="font-semibold text-gray-400 hover:text-gray-700 cursor-pointer bg-transparent border-none transition-colors">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
