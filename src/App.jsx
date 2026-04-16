import { useState, useEffect } from "react";
import InputForm from "./components/InputForm";
import ResultsDashboard from "./components/ResultsDashboard";
import CompareView from "./components/CompareView";
import { analyzeReport } from "./lib/analyzeReport";
import { narratives } from "./lib/narratives";
import { generateCode, saveResult, loadResult, cleanupExpiredResults, requestStoragePersistence } from "./lib/resultStore";
import { DRAFT_KEY } from "./lib/constants";

function applyModifier(narrative, key) {
  const mod = narratives[key];
  if (!mod) return narrative;
  return {
    ...narrative,
    narrative: narrative.narrative + " " + mod.narrative,
    actions: [...(narrative.actions || []), ...(mod.actions || [])],
  };
}

function getNarrative(snippetKey, urgencyFlag, ageFlag) {
  let result = narratives[snippetKey] || narratives.FALLBACK;
  if (urgencyFlag === "HIGH") result = applyModifier(result, "HIGH_URGENCY_MODIFIER");
  if (ageFlag) result = applyModifier(result, "AGE_MODIFIER");
  return result;
}

const LAST_RESULT_KEY = "fm_last_result";

export default function App() {
  const [screen, setScreen] = useState("input");
  const [reportResult, setReportResult] = useState(null);
  const [activeSnippet, setActiveSnippet] = useState(null);
  const [fmCode, setFmCode] = useState(null);
  const [lastResultDate, setLastResultDate] = useState(null);
  const [lookupError, setLookupError] = useState("");
  // Which input mode the form should open in. Defaults to "scan" for new
  // sessions, but flips to "manual" when the user is coming back from a
  // result via "Edit Details" — they already have values to tweak.
  const [inputEntryMode, setInputEntryMode] = useState("scan");

  // Reset scroll on every screen change. Without this, navigating from
  // the long results page to the input form (or vice versa) keeps the
  // previous scroll position, dropping the user mid-page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen]);
  // On mount: purge old stored results (>6 months) and auto-detect last result.
  // The "Welcome back" banner only appears if the last result is from a previous
  // day — same-day refreshes (e.g. after a failed scan) shouldn't trigger it.
  useEffect(() => {
    cleanupExpiredResults();
    try {
      const last = JSON.parse(localStorage.getItem(LAST_RESULT_KEY));
      if (!last?.code || !last?.date) return;
      if (!loadResult(last.code)) {
        localStorage.removeItem(LAST_RESULT_KEY);
        return;
      }
      setFmCode(last.code);
      const today = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
      if (last.date !== today) setLastResultDate(last.date);
    } catch {}
  }, []);

  function handleSubmit(formData) {
    setLookupError("");
    const result = analyzeReport(formData);
    // Persist the original inputs alongside the analysis so "Edit Details"
    // can repopulate every field (age, months trying, motility subtype) —
    // not just the parameter values.
    result.originalInputs = formData;
    const snippet = getNarrative(result.snippetKey, result.urgencyFlag, result.ageFlag);
    const code = generateCode();
    saveResult(code, result);
    // First time the user generates a real result, ask the browser to
    // persist this origin's storage so it isn't evicted by aggressive
    // cache cleanup (notably on iOS Safari).
    requestStoragePersistence();
    setReportResult(result);
    setActiveSnippet(snippet);
    setFmCode(code);
    setLastResultDate(null);
    try {
      localStorage.setItem(LAST_RESULT_KEY, JSON.stringify({
        code,
        date: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
      }));
    } catch {}
    setScreen("results");
  }

  function handleRestoreLastResult() {
    if (!fmCode) return;
    const stored = loadResult(fmCode);
    if (!stored) return;
    const result = stored.result;
    const snippet = getNarrative(result.snippetKey, result.urgencyFlag, result.ageFlag);
    setReportResult(result);
    setActiveSnippet(snippet);
    setScreen("results");
  }

  function handleFMCodeLookup(code) {
    setLookupError("");
    const stored = loadResult(code);
    if (!stored) {
      setLookupError("No results found for this code on this device.");
      return;
    }
    const result = stored.result;
    const snippet = getNarrative(result.snippetKey, result.urgencyFlag, result.ageFlag);
    setReportResult(result);
    setActiveSnippet(snippet);
    setFmCode(code);
    setScreen("results");
  }

  function handleReset() {
    setReportResult(null);
    setActiveSnippet(null);
    setFmCode(null);
    setLastResultDate(null);
    setLookupError("");
    setInputEntryMode("scan");
    try {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(LAST_RESULT_KEY);
    } catch {}
    setScreen("input");
  }

  return (
    <div className="min-h-screen bg-surface">
      {screen === "input" && (
        <InputForm
          onSubmit={handleSubmit}
          onFMCodeLookup={handleFMCodeLookup}
          lookupError={lookupError}
          onBackToReport={reportResult ? () => setScreen("results") : null}
          lastResultDate={lastResultDate}
          onRestoreLastResult={handleRestoreLastResult}
          initialEntryMode={inputEntryMode}
        />
      )}
      {screen === "results" && reportResult && activeSnippet && (
        <ResultsDashboard
          result={reportResult}
          snippet={activeSnippet}
          fmCode={fmCode}
          onReset={handleReset}
          onBackToInput={() => {
            setLookupError("");
            // Restore everything the user originally entered: parameter
            // values, age, months trying, and the motility subtype (so the
            // engine grades against the same WHO threshold as before).
            if (reportResult?.parameters) {
              const draftValues = {};
              for (const [key, param] of Object.entries(reportResult.parameters)) {
                draftValues[key] = String(param.value);
              }
              const inputs = reportResult.originalInputs || {};
              const subtype = reportResult.parameters?.motility?.subtype || inputs.motilitySubtype || null;
              try {
                const existing = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
                localStorage.setItem(DRAFT_KEY, JSON.stringify({
                  ...existing,
                  values: draftValues,
                  age: inputs.age != null ? String(inputs.age) : (existing.age || ""),
                  monthsTrying: inputs.ttcMonths != null ? String(inputs.ttcMonths) : (existing.monthsTrying || ""),
                  motilitySubtype: subtype,
                }));
              } catch {}
            }
            setInputEntryMode("manual");
            setScreen("input");
          }}
          onCompare={() => setScreen("compare")}
        />
      )}
      {screen === "compare" && (
        <CompareView
          onBack={() => setScreen("results")}
          onLogoClick={handleReset}
          initialCode={fmCode}
        />
      )}
    </div>
  );
}
