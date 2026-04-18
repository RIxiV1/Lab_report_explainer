import ParameterCard from "../ParameterCard";
import { PARAM_ORDER, PARAM_META } from "../../lib/constants";
import { displayValue } from "../../lib/uiUtils";
import { useCountUp } from "../../lib/useCountUp";
import { t } from "../../lib/i18n";
import { generateReportPdf } from "../../lib/generatePdf";

const CTX_LINES = {
  spermCount: { NORMAL: "Healthy count.", WARNING: "A little low — often improves with changes.", CRITICAL: "There are many ways to improve this." },
  motility:   { NORMAL: "Sperm are moving well.", WARNING: "A bit low — often improves with better food and habits.", CRITICAL: "This usually responds well to treatment." },
  morphology: { NORMAL: "Shape is fine.", WARNING: "This number is easy to misread. The rest of your report matters more.", CRITICAL: "On its own, this rarely decides the outcome." },
  volume:     { NORMAL: "Volume is healthy.", WARNING: "Drink more water and check how the sample was collected.", CRITICAL: "Usually fixes with a proper sample collection." },
  pH:         { NORMAL: "Balanced.", WARNING: "A small finding — nothing serious.", CRITICAL: "Worth showing your doctor." },
  wbc:        { NORMAL: "No signs of infection.", WARNING: "Mild — usually easy to manage.", CRITICAL: "This can be treated. Talk to your doctor." },
};

function TMSCGauge({ value }) {
  const pct = Math.max(2, Math.min(98, (Math.min(value, 50) / 50) * 100));
  return (
    <div className="mt-8" aria-hidden="true">
      <div className="flex mb-2">
        <div className="text-[10px] text-white/30 uppercase tracking-wide" style={{ width: "10%" }}>IVF</div>
        <div className="text-[10px] text-white/30 uppercase tracking-wide text-center" style={{ width: "30%" }}>IUI</div>
        <div className="text-[10px] text-white/30 uppercase tracking-wide text-right" style={{ width: "60%" }}>Natural</div>
      </div>
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
      <div className="relative mt-1 h-4">
        <span className="absolute text-[10px] text-white/40 font-mono" style={{ left: "10%", transform: "translateX(-50%)" }}>5M</span>
        <span className="absolute text-[10px] text-white/40 font-mono" style={{ left: "40%", transform: "translateX(-50%)" }}>20M</span>
      </div>
    </div>
  );
}

function buildWhatsAppText(fmCode, verdictLabel) {
  return encodeURIComponent([
    "I just got my semen analysis explained by ForMen Health.", "",
    `Summary: ${verdictLabel}`, `My FM code: ${fmCode}`, "",
    "Open it here:", "https://formen.health/pages/lab-report-explainer",
  ].join("\n"));
}

export default function StatusSection({ result, fmCode, lang, verdictLabel, verdictCfg, narrativeShort, onBackToInput }) {
  const tmsc = result.tmsc;
  const tmscAnimated = useCountUp(tmsc?.value ?? 0);
  const providedKeys = PARAM_ORDER.filter((k) => result.parameters[k] !== undefined);
  const normalCount = providedKeys.filter((k) => result.parameters[k]?.status === "NORMAL").length;
  const flaggedCount = providedKeys.length - normalCount;

  return (
    <>
      {/* ══════ HERO ══════ */}
      <section className="bg-brand-900 text-white relative overflow-hidden mb-12">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(54,69,142,0.4) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(54,69,142,0.2) 0%, transparent 40%)' }} />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
        
        {/* Editorial hairline bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10" />

        <div className="content-container-narrow pt-20 pb-20 relative z-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-3 font-semibold">{t(lang, "hero_eyebrow")}</p>

          <div className="flex items-center gap-4 flex-wrap mb-4">
            <h1 className="font-serif text-[clamp(36px,8vw,52px)] leading-none font-bold tracking-tight">{verdictLabel}</h1>
            <div className="flex gap-2">
              {normalCount > 0 && <span className="text-[11px] font-semibold px-2.5 py-1" style={{ background: "rgba(139,185,146,0.15)", color: "#8BB992" }}>{normalCount} Normal</span>}
              {flaggedCount > 0 && <span className="text-[11px] font-semibold px-2.5 py-1" style={{ background: "rgba(255,184,0,0.15)", color: "#FFB800" }}>{flaggedCount} Flagged</span>}
            </div>
          </div>

          <p className="text-[11px] text-white/40 mb-6 leading-relaxed max-w-[560px]">{t(lang, "hero_disclaimer")}</p>

          {narrativeShort && <p className="text-[15px] leading-[1.8] text-white/60 max-w-[600px] mb-10">{narrativeShort}</p>}

          {tmsc && (
            <div className="mb-10 max-w-[500px]">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">{t(lang, "hero_tmsc_label")}</p>
              <div className="flex items-baseline gap-2">
                {tmsc.value < 1 ? (
                  <span className="font-serif text-[clamp(40px,8vw,56px)] font-bold text-white leading-none tracking-tight">{t(lang, "hero_below_one")}</span>
                ) : (
                  <>
                    <span className="font-serif text-[clamp(56px,12vw,80px)] font-bold text-white leading-none tabular-nums tracking-tight">{displayValue(tmscAnimated)}</span>
                    <span className="text-[13px] text-white/35 font-medium">million</span>
                  </>
                )}
              </div>
              <TMSCGauge value={tmsc.value} />
              <span className="inline-block mt-4 px-3 py-1 text-[11px] font-bold uppercase tracking-wide" style={{
                background: tmsc.tier === "NATURAL" ? "rgba(139,185,146,0.2)" : tmsc.tier === "IUI" ? "rgba(255,184,0,0.2)" : "rgba(249,115,22,0.2)",
                color: tmsc.tier === "NATURAL" ? "#a8d5b0" : tmsc.tier === "IUI" ? "#FFD54F" : "#fb923c",
              }}>{tmsc.tierLabel}</span>
            </div>
          )}

          <div className="no-print flex gap-2 flex-wrap">
            <button
              onClick={() => generateReportPdf({ result, fmCode, verdictLabel: verdictCfg.label, tmsc })}
              className="bg-white text-brand-900 font-semibold px-5 py-2.5 text-[11px] uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
              style={{ boxShadow: '0 4px 16px rgba(17,24,82,0.2)' }}
            >
              {t(lang, "btn_download_pdf")}
            </button>
            <button
              onClick={() => window.open(`https://wa.me/?text=${buildWhatsAppText(fmCode, verdictCfg.label)}`, "_blank", "noopener,noreferrer")}
              className="bg-brand-500 text-white font-semibold px-5 py-2.5 text-[11px] uppercase tracking-wide cursor-pointer hover:bg-[#283573] transition-colors"
            >
              {t(lang, "btn_share")}
            </button>
            <button
              onClick={onBackToInput}
              className="text-white/40 hover:text-white/80 font-semibold px-5 py-2.5 text-[11px] uppercase tracking-wide cursor-pointer bg-transparent transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {t(lang, "btn_edit")}
            </button>
          </div>
        </div>
      </section>

      {/* ── Parameter Cards ── */}
      <section className="mb-20 content-container flex flex-col items-center">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="font-serif text-[32px] font-bold text-gray-900 tracking-tight leading-none">{t(lang, "section_your_results")}</h2>
          </div>
          <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold leading-none">{t(lang, "section_who_stamp")}</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full max-w-[850px]">
          {providedKeys.map((key, i) => {
            const p = result.parameters[key];
            const meta = PARAM_META[key];
            return (
              <div key={key} className="animate-editorial opacity-0 flex" style={{ animationDelay: `${i * 100}ms` }}>
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
    </>
  );
}
