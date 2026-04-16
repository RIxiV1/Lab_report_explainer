import { useState, useRef, useEffect, useCallback } from "react";
import { REQUIRED_FIELDS, FM_CODE_REGEX, DRAFT_KEY } from "../lib/constants";
import Nav from "./Nav";
import ReportScanner from "./ReportScanner";
import ManageDataPanel from "./ManageDataPanel";

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
  } catch { return {}; }
}

function validate(field, raw, { requireValue }) {
  if (raw === "" || raw === undefined) return requireValue ? "Required" : "";
  const v = parseFloat(raw);
  if (isNaN(v)) return "Must be a number";
  if (v < field.min || v > field.max) return `Enter ${field.min}–${field.max}`;
  return "";
}

export default function InputForm({ onSubmit, onFMCodeLookup, lookupError, onBackToReport, lastResultDate, onRestoreLastResult, initialEntryMode = "scan" }) {
  const draft = useRef(loadDraft()).current;
  const [values, setValues] = useState(draft.values || {});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [entryMode, setEntryMode] = useState(initialEntryMode);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [age, setAge] = useState(draft.age || "");
  const [monthsTrying, setMonthsTrying] = useState(draft.monthsTrying || "");
  const [ageError, setAgeError] = useState("");
  const [monthsError, setMonthsError] = useState("");
  const [fmCode, setFmCode] = useState("");
  const [fmCodeError, setFmCodeError] = useState("");
  const [showManagePanel, setShowManagePanel] = useState(false);
  const tooltipRef = useRef(null);
  const draftTimer = useRef(null);

  useEffect(() => {
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          values, age, monthsTrying,
          // Preserve the motility subtype across reloads so a re-grade
          // uses the same WHO threshold (total 42% vs progressive 30%).
          motilitySubtype: extractedMeta.subtypes?.motility || null,
        }));
      } catch {}
    }, 500);
    return () => clearTimeout(draftTimer.current);
  }, [values, age, monthsTrying, extractedMeta]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setActiveTooltip(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = useCallback((field, raw, requireValue) => {
    setValues((p) => ({ ...p, [field.key]: raw }));
    setErrors((p) => {
      if (!p[field.key]) return p;
      return { ...p, [field.key]: validate(field, raw, { requireValue }) };
    });
  }, []);

  function handleBlur(field, requireValue) {
    setTouched((p) => ({ ...p, [field.key]: true }));
    setValues((currentValues) => {
      setErrors((p) => ({ ...p, [field.key]: validate(field, currentValues[field.key], { requireValue }) }));
      return currentValues;
    });
  }

  const filledRequired = REQUIRED_FIELDS.filter((f) => values[f.key] !== "" && values[f.key] !== undefined).length;
  const isValid = REQUIRED_FIELDS.every((f) => {
    const raw = values[f.key];
    return raw !== "" && raw !== undefined && validate(f, raw, { requireValue: true }) === "";
  });

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    const newTouched = {};
    REQUIRED_FIELDS.forEach((f) => {
      newTouched[f.key] = true;
      newErrors[f.key] = validate(f, values[f.key], { requireValue: true });
    });
    setTouched(newTouched);
    setErrors(newErrors);

    let ageErr = "";
    let monthsErr = "";
    if (age !== "") {
      const a = parseFloat(age);
      if (isNaN(a) || a < 18 || a > 80) ageErr = "Must be 18–80";
    }
    if (monthsTrying !== "") {
      const m = parseFloat(monthsTrying);
      if (isNaN(m) || m < 0 || m > 120) monthsErr = "Must be 0–120";
    }
    setAgeError(ageErr);
    setMonthsError(monthsErr);
    if (Object.values(newErrors).some((msg) => msg) || ageErr || monthsErr) return;

    const formData = {};
    REQUIRED_FIELDS.forEach((f) => { formData[f.key] = parseFloat(values[f.key]); });
    if (age !== "") formData.age = parseFloat(age);
    if (monthsTrying !== "") formData.ttcMonths = parseFloat(monthsTrying);
    // If the current values were scanned from a PDF, preserve the motility
    // subtype so the classifier grades against the correct WHO threshold.
    if (extractedMeta.subtypes?.motility) {
      formData.motilitySubtype = extractedMeta.subtypes.motility;
    }
    onSubmit(formData);
  }

  function handleFMCodeLoad() {
    const trimmed = fmCode.trim().toUpperCase();
    if (!FM_CODE_REGEX.test(trimmed)) { setFmCodeError("Invalid format — use FM-XXXX-XXXX"); return; }
    setFmCodeError("");
    onFMCodeLookup(trimmed);
  }

  // Wipes all form state and the persisted draft so the next entry
  // starts truly blank. Useful when re-testing with new values — the
  // localStorage draft would otherwise re-prefill old numbers.
  function handleClearAll() {
    setValues({});
    setErrors({});
    setTouched({});
    setAge("");
    setMonthsTrying("");
    setAgeError("");
    setMonthsError("");
    setExtractedMeta({ subtypes: {}, unitWarnings: {} });
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  }

  // Remembers scan metadata across mode switches:
  // - subtypes: which motility variant was matched (total vs progressive)
  //   so the classifier uses the right WHO threshold (42% vs 30%).
  // - unitWarnings: per-field warnings (e.g. WBC reported as /hpf) shown
  //   as hints under the relevant input.
  // Seeded from draft so "Edit Details" re-grades against the same threshold.
  const [extractedMeta, setExtractedMeta] = useState({
    subtypes: draft.motilitySubtype ? { motility: draft.motilitySubtype } : {},
    unitWarnings: {},
    extras: {},
  });

  function handleExtractedData(extractedValues, meta = { subtypes: {}, unitWarnings: {}, extras: {} }) {
    setExtractedMeta(meta);
    setValues((prev) => ({
      ...prev,
      ...Object.fromEntries(Object.entries(extractedValues).map(([k, v]) => [k, String(v)])),
    }));
    // Only auto-fill age from the report if the user hasn't typed one already.
    if (meta.extras?.age && age === "") setAge(String(meta.extras.age));
    setEntryMode("manual");
  }

  function handleAnalyzeNow(extractedValues, meta = { subtypes: {}, unitWarnings: {}, extras: {} }) {
    setExtractedMeta(meta);
    const formData = {};
    for (const [k, v] of Object.entries(extractedValues)) {
      formData[k] = typeof v === "number" ? v : parseFloat(v);
    }
    const effectiveAge = age !== "" ? parseFloat(age) : meta.extras?.age;
    if (effectiveAge != null && !isNaN(effectiveAge)) formData.age = effectiveAge;
    if (monthsTrying !== "") formData.ttcMonths = parseFloat(monthsTrying);
    if (meta.subtypes?.motility) formData.motilitySubtype = meta.subtypes.motility;
    onSubmit(formData);
  }

  function renderField(field) {
    const hasError = touched[field.key] && errors[field.key];
    const unitWarning = extractedMeta.unitWarnings?.[field.key];
    return (
      <div key={field.key} className="bg-white p-5 transition-colors hover:bg-[#FAFBFD]">
        <div className="flex items-center gap-2 mb-3">
          <label htmlFor={field.key} className="label-clinical">{field.label}</label>
          <div className="relative ml-auto" ref={activeTooltip === field.key ? tooltipRef : null}>
            <button
              type="button"
              aria-label={`About ${field.label}`}
              onClick={() => setActiveTooltip(activeTooltip === field.key ? null : field.key)}
              className="text-[10px] text-gray-500 hover:text-brand-500 cursor-pointer bg-transparent border-none uppercase tracking-wide font-semibold transition-colors"
            >
              Info
            </button>
            {activeTooltip === field.key && (
              <div role="tooltip" className="absolute right-0 bottom-[calc(100%+8px)] w-[min(240px,72vw)] bg-brand-900 text-white text-[12px] leading-relaxed p-4 z-50 whisper-shadow-lg" style={{ animation: 'editorial-fade-up 0.2s cubic-bezier(0.2,0,0,1) forwards' }}>
                {field.tooltip}
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            id={field.key}
            type="number"
            inputMode="decimal"
            step={field.step}
            placeholder="—"
            value={values[field.key] ?? ""}
            onChange={(e) => handleChange(field, e.target.value, true)}
            onBlur={() => handleBlur(field, true)}
            className="fm-input"
            style={field.unit ? { paddingRight: 52 } : undefined}
            aria-invalid={!!hasError}
          />
          {field.unit && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] text-gray-500 font-medium pointer-events-none">
              {field.unit}
            </span>
          )}
        </div>

        <div
          className="h-[2px] mt-1 transition-all"
          style={{
            background: hasError
              ? '#c2410c'
              : 'linear-gradient(90deg, rgba(198,197,210,0.25) 0%, rgba(198,197,210,0.08) 100%)',
          }}
        />

        <p
          className={`text-[11px] mt-2 ${hasError ? "text-orange-600 font-medium" : "text-gray-500"}`}
          role={hasError ? "alert" : undefined}
          aria-live={hasError ? "polite" : undefined}
        >
          {hasError ? errors[field.key] : field.hint}
        </p>

        {unitWarning && !hasError && (
          <div role="note" className="mt-2 p-3 bg-yellow-50 border-l-[3px] border-yellow-500">
            {unitWarning.title && (
              <p className="text-[11px] font-semibold text-gray-900 mb-1">{unitWarning.title}</p>
            )}
            <p className="text-[11px] text-gray-800 leading-relaxed">
              {unitWarning.message}
            </p>
          </div>
        )}
        {field.extraNote && !hasError && (
          <p className="text-[11px] text-gray-500 mt-0.5 italic">{field.extraNote}</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4FAFB]">
      <Nav onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        {onBackToReport && (
          <button onClick={onBackToReport} className="btn-secondary">Back to Report</button>
        )}
      </Nav>

      <div className="max-w-[640px] mx-auto px-6 pt-16 pb-24">
        {/* Header — flush left per design spec */}
        <header className="mb-14 animate-editorial">
          <h1 className="font-serif text-[clamp(32px,6vw,48px)] text-gray-900 mb-4 leading-[1.1] tracking-tight">
            Understand Your<br />Semen Analysis
          </h1>
          <p className="text-[15px] text-gray-500 max-w-[440px] leading-relaxed">
            Upload your report, or type the values in. We'll explain every number in simple words, and tell you what to do next.
          </p>
          <div className="flex items-center gap-2 mt-6">
            <div className="w-1.5 h-1.5 bg-wellness-500" style={{ boxShadow: '0 0 6px rgba(139,185,146,0.5)' }} />
            <span className="text-[11px] text-gray-500 uppercase tracking-wide">
              Stays on your phone · nobody else sees it
            </span>
          </div>
        </header>

        {/* Welcome back banner */}
        {lastResultDate && onRestoreLastResult && (
          <div className="bg-brand-50 p-5 mb-12 flex items-center justify-between flex-wrap gap-3 whisper-shadow-sm" style={{ animation: 'editorial-fade-up 0.4s cubic-bezier(0.2,0,0,1) forwards' }}>
            <div>
              <p className="text-[13px] font-semibold text-brand-900">Welcome back</p>
              <p className="text-[12px] text-neutral-600">You have a report from {lastResultDate}.</p>
            </div>
            <button onClick={onRestoreLastResult} className="btn-primary py-2.5 px-5 text-[11px]">
              View Last Report
            </button>
          </div>
        )}

        {/* Segmented Control */}
        <div className="flex bg-[#E3E9EA] p-[3px] w-full max-w-[380px] mb-12">
          {[
            { key: "scan", label: "Smart Scan" },
            { key: "manual", label: "Manual Entry" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setEntryMode(tab.key)}
              className={`flex-1 text-[12px] font-semibold uppercase tracking-clinical py-2.5 transition-all cursor-pointer ${
                entryMode === tab.key
                  ? "bg-white text-brand-900"
                  : "text-gray-500 hover:text-gray-700 bg-transparent"
              }`}
              style={entryMode === tab.key ? { boxShadow: '0 4px 12px rgba(17,24,82,0.06)' } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Entry view */}
        {entryMode === "scan" ? (
          <div className="animate-editorial">
            <ReportScanner onExtracted={handleExtractedData} onAnalyzeNow={handleAnalyzeNow} />
          </div>
        ) : (
          <div className="animate-editorial">
            <form onSubmit={handleSubmit} noValidate>
              {/* Progress + clear */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-[2px] bg-[#E3E9EA] overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${(filledRequired / REQUIRED_FIELDS.length) * 100}%`,
                      background: filledRequired === REQUIRED_FIELDS.length
                        ? '#8BB992'
                        : 'linear-gradient(90deg, #36458E, #111852)',
                    }}
                  />
                </div>
                <span className="label-clinical">
                  {filledRequired} / {REQUIRED_FIELDS.length}
                </span>
                {filledRequired > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[10px] text-gray-500 hover:text-orange-600 cursor-pointer bg-transparent border-none uppercase tracking-wide font-semibold transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Fields — tonal gap between items */}
              <div className="flex flex-col gap-[1px] bg-[#E3E9EA] mb-8 whisper-shadow-sm">
                {REQUIRED_FIELDS.map((f) => renderField(f))}
              </div>

              {/* Context */}
              <div className="bg-[#EFF5F6] p-5 mb-8">
                <p className="label-clinical mb-4">About you (optional)</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "age", label: "Age", unit: "years", value: age, setter: setAge, error: ageError, errSetter: setAgeError },
                    { id: "monthsTrying", label: "Trying for a baby", unit: "months", value: monthsTrying, setter: setMonthsTrying, error: monthsError, errSetter: setMonthsError },
                  ].map((f) => (
                    <div key={f.id}>
                      <label htmlFor={f.id} className="text-[10px] text-gray-500 uppercase tracking-wide block mb-2">{f.label}</label>
                      <div className="relative">
                        <input
                          id={f.id}
                          type="number"
                          inputMode="numeric"
                          placeholder="—"
                          value={f.value}
                          onChange={(e) => { f.setter(e.target.value); f.errSetter(""); }}
                          className="fm-input text-lg"
                          style={{ paddingRight: 44 }}
                          aria-invalid={!!f.error}
                        />
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">{f.unit}</span>
                      </div>
                      <div
                        className="h-[2px] mt-1"
                        style={{ background: 'linear-gradient(90deg, rgba(198,197,210,0.25) 0%, rgba(198,197,210,0.08) 100%)' }}
                      />
                      {f.error && <p role="alert" aria-live="polite" className="text-[11px] text-orange-600 mt-1">{f.error}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={!isValid} className="btn-primary w-full py-4">
                See My Report
              </button>
            </form>
          </div>
        )}

        {/* FM Code lookup — for returning to a previous session on the same device */}
        <details className="mt-14 group">
          <summary className="text-[11px] text-neutral-400 uppercase tracking-wide cursor-pointer hover:text-neutral-600 list-none transition-colors">
            Reopen a previous report
          </summary>
          <div className="mt-4 max-w-[360px] animate-editorial">
            <p className="text-[12px] text-neutral-500 mb-3">
              Type in the FM code from your earlier report.
              Your reports are saved only on this phone, so this won't work from another device.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="FM-XXXX-XXXX"
                value={fmCode}
                onChange={(e) => { setFmCode(e.target.value); setFmCodeError(""); }}
                className="flex-1 bg-[#EFF5F6] px-3 py-2.5 text-sm tracking-wider uppercase focus:outline-none"
                aria-label="FM Code"
                style={{ borderBottom: '2px solid rgba(198,197,210,0.2)' }}
              />
              <button type="button" onClick={handleFMCodeLoad} className="btn-primary px-4 py-2.5">Load</button>
            </div>
            {(fmCodeError || lookupError) && (
              <p role="alert" aria-live="polite" className="text-[11px] text-orange-600 mt-1.5">{fmCodeError || lookupError}</p>
            )}
          </div>
        </details>

        <button
          type="button"
          onClick={() => setShowManagePanel(true)}
          className="mt-4 text-[11px] text-neutral-400 uppercase tracking-wide cursor-pointer hover:text-neutral-600 bg-transparent border-none transition-colors"
        >
          Manage my data
        </button>
      </div>

      {showManagePanel && (
        <ManageDataPanel
          onClose={() => setShowManagePanel(false)}
          onDataWiped={() => {
            // After wipe, reset all in-memory form state too so the
            // user doesn't see ghost data still on screen.
            setValues({});
            setErrors({});
            setTouched({});
            setAge("");
            setMonthsTrying("");
            setFmCode("");
          }}
        />
      )}
    </div>
  );
}
