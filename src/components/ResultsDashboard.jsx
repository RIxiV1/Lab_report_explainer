import Nav from "./Nav";
import StatusSection from "./results/StatusSection";
import NarrativeSection from "./results/NarrativeSection";
import DoctorCTA from "./results/DoctorCTA";
import TipsSection from "./results/TipsSection";
import ResultsFooter from "./results/ResultsFooter";
import { VERDICT_CONFIG } from "../lib/constants";
import { t } from "../lib/i18n";

// Section order is deliberate:
//   1. Status (verdict + parameter cards) — "here's where you stand"
//   2. Narrative (next steps + FertiQ) — "here's what to do"
//   3. Doctor CTA — "here's someone who can help" (AFTER the plan)
//   4. Tips (dynamic healthy habits) — "daily actions"
//   5. Footer (emotional close + FM code)
//
// Previous order put the doctor CTA before the action plan, which
// felt like a sales push before the user had context. This order
// follows a natural funnel: understand → plan → get help → act.

export default function ResultsDashboard({ result, snippet, fmCode, lang = "en", onLangChange, onReset, onBackToInput, onCompare }) {
  const verdictCfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.ATTENTION;
  const verdictI18nKey = { ALL_NORMAL: "verdict_all_normal", ATTENTION: "verdict_attention", ACT_NOW: "verdict_act_now" };
  const verdictLabel = t(lang, verdictI18nKey[result.verdict] || "verdict_attention");

  const narrativeShort = snippet?.narrative
    ? snippet.narrative.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")
    : null;

  return (
    <div className="min-h-screen bg-surface texture-paper relative">
      <Nav sticky className="no-print" onLogoClick={onReset} lang={lang} onLangChange={onLangChange} />

      <StatusSection
        result={result}
        fmCode={fmCode}
        lang={lang}
        verdictLabel={verdictLabel}
        verdictCfg={verdictCfg}
        narrativeShort={narrativeShort}
        onBackToInput={onBackToInput}
      />

      <div className="py-14">
        <NarrativeSection snippet={snippet} result={result} fmCode={fmCode} lang={lang} />
        <DoctorCTA result={result} lang={lang} />
        <TipsSection result={result} lang={lang} />
        <ResultsFooter result={result} fmCode={fmCode} lang={lang} onCompare={onCompare} onReset={onReset} />
      </div>
    </div>
  );
}
