import { useState } from "react";
import InputForm from "./components/InputForm";
import ProcessingScreen from "./components/ProcessingScreen";
import ResultsDashboard from "./components/ResultsDashboard";
import AndrologistSection from "./components/AndrologistSection";
import CompareView from "./components/CompareView";
import { analyzeReport } from "./lib/ruleEngine";
import { snippets } from "./lib/snippets";
import { useFMCode } from "./hooks/useFMCode";
import { DRAFT_KEY } from "./lib/constants";

function getSnippet(snippetKey, urgencyFlag, ageFlag) {
  const base = snippets[snippetKey] || snippets["FALLBACK"];
  let combined = { ...base };
  if (urgencyFlag === "HIGH") {
    const mod = snippets["HIGH_URGENCY_MODIFIER"];
    if (mod) combined = { ...combined, narrative: combined.narrative + " " + mod.narrative };
  }
  if (ageFlag) {
    const mod = snippets["AGE_MODIFIER"];
    if (mod) combined = { ...combined, narrative: combined.narrative + " " + mod.narrative };
  }
  return combined;
}

export default function App() {
  const [screen, setScreen] = useState("input");
  const [reportResult, setReportResult] = useState(null);
  const [activeSnippet, setActiveSnippet] = useState(null);
  const [fmCode, setFmCode] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const { generateCode, saveResult, loadResult } = useFMCode();

  function handleSubmit(formData) {
    setLookupError("");
    const result = analyzeReport(formData);
    const snippet = getSnippet(result.snippetKey, result.urgencyFlag, result.ageFlag);
    const code = generateCode();
    saveResult(code, result);
    setReportResult(result);
    setActiveSnippet(snippet);
    setFmCode(code);
    setScreen("processing");
  }

  function handleFMCodeLookup(code) {
    setLookupError("");
    const stored = loadResult(code);
    if (!stored) {
      setLookupError("No results found for this code. Results are stored on this device only — if you used a different device, those results won't be here.");
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
    setLookupError("");
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setScreen("input");
  }

  return (
    <div className="min-h-screen bg-cream">
      {screen === "input" && (
        <InputForm
          onSubmit={handleSubmit}
          onFMCodeLookup={handleFMCodeLookup}
          lookupError={lookupError}
          onBackToReport={reportResult ? () => setScreen("results") : null}
        />
      )}
      {screen === "processing" && (
        <ProcessingScreen
          onComplete={() => setScreen("results")}
          onBack={() => setScreen("input")}
        />
      )}
      {screen === "results" && reportResult && activeSnippet && (
        <>
          <ResultsDashboard
            result={reportResult}
            snippet={activeSnippet}
            fmCode={fmCode}
            onReset={handleReset}
            onBackToInput={() => { setLookupError(""); setScreen("input"); }}
            onCompare={() => setScreen("compare")}
          />
          <AndrologistSection verdict={reportResult.verdict} />
        </>
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
