import { useState, useEffect } from "react";
import InputForm from "./components/InputForm";
import ResultsDashboard from "./components/ResultsDashboard";
import CompareView from "./components/CompareView";
import { analyzeReport } from "./lib/analyzeReport";
import { snippets } from "./lib/snippets";
import { useFMCode } from "./hooks/useFMCode";
import { DRAFT_KEY } from "./lib/constants";

function applyModifier(snippet, key) {
  const mod = snippets[key];
  return mod ? { ...snippet, narrative: snippet.narrative + " " + mod.narrative } : snippet;
}

function getSnippet(snippetKey, urgencyFlag, ageFlag) {
  let result = snippets[snippetKey] || snippets["FALLBACK"];
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
  const { generateCode, saveResult, loadResult } = useFMCode();

  // Auto-detect last result on mount
  useEffect(() => {
    try {
      const last = JSON.parse(localStorage.getItem(LAST_RESULT_KEY));
      if (last?.code && last?.date) {
        setFmCode(last.code);
        setLastResultDate(last.date);
      }
    } catch {}
  }, []);

  function handleSubmit(formData) {
    setLookupError("");
    const result = analyzeReport(formData);
    const snippet = getSnippet(result.snippetKey, result.urgencyFlag, result.ageFlag);
    const code = generateCode();
    saveResult(code, result);
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
    const snippet = getSnippet(result.snippetKey, result.urgencyFlag, result.ageFlag);
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
    const snippet = getSnippet(result.snippetKey, result.urgencyFlag, result.ageFlag);
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
            // Write current result values into draft so the form shows them
            if (reportResult?.parameters) {
              const draftValues = {};
              for (const [key, param] of Object.entries(reportResult.parameters)) {
                draftValues[key] = String(param.value);
              }
              try {
                const existing = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
                localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...existing, values: draftValues }));
              } catch {}
            }
            setScreen("input");
          }}
          onCompare={() => setScreen("compare")}
        />
      )}
      {screen === "compare" && (
        <CompareView
          onBack={() => setScreen("results")}
          initialCode={fmCode}
        />
      )}
    </div>
  );
}
