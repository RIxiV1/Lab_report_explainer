import { useState, useRef, useEffect, useCallback } from "react";
import { REQUIRED_FIELDS, FM_CODE_REGEX } from "../lib/constants";
import { WHO_VERSIONS } from "../lib/analyzeReport";
import { getDraft, saveDraft, clearDraft } from "../lib/resultStore";
import Nav from "./Nav";
import ReportScanner from "./ReportScanner";
import ManageDataPanel from "./ManageDataPanel";
import ParameterInput from "./ParameterInput";

function validate(field, raw, { requireValue }) {
  if (raw === "" || raw === undefined) return requireValue ? "Required" : "";
  const v = parseFloat(raw);
  if (isNaN(v)) return "Must be a number";
  if (v < field.min || v > field.max) return `Enter ${field.min}–${field.max}`;
  return "";
}

export default function InputForm({ onSubmit, onFMCodeLookup, lookupError, onBackToReport, lastResultDate, onRestoreLastResult, initialEntryMode = "scan" }) {
  const draft = useRef(getDraft()).current;
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
  const [whoVersion, setWhoVersion] = useState(draft.whoVersion || "2021");
  // Remembers scan metadata across mode switches:
  // - subtypes: which motility variant was matched (total vs progressive)
  //   so the classifier uses the right WHO threshold (42% vs 30%).
  // - unitWarnings: per-field warnings (e.g. WBC reported as /hpf) shown
  //   as hints under the relevant input.
  // Seeded from draft so "Edit Details" re-grades against the same threshold.
  // MUST be declared before any useEffect that reads it — otherwise the
  // dep-array access throws a TDZ at render time.
  const [extractedMeta, setExtractedMeta] = useState({
    subtypes: draft.motilitySubtype ? { motility: draft.motilitySubtype } : {},
    unitWarnings: {},
    extras: {},
  });
  const tooltipRef = useRef(null);
  const draftTimer = useRef(null);

  // Depend on the primitive subtype, not the whole extractedMeta
  // object. Avoids re-running the autosave when unrelated meta fields
  // (unit warnings, extras) change without affecting what gets persisted.
  const persistedSubtype = extractedMeta.subtypes?.motility || null;

  useEffect(() => {
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      saveDraft({
        values, age, monthsTrying,
        // Preserve the motility subtype across reloads so a re-grade
        // uses the same WHO threshold (total 42% vs progressive 30%).
        motilitySubtype: persistedSubtype,
      });
    }, 500);
    return () => clearTimeout(draftTimer.current);
  }, [values, age, monthsTrying, persistedSubtype]);

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
  // Counts fields that are filled-but-out-of-range. We need this so
  // the submit button can say "Fix the highlighted field" instead of
  // the misleading "Fill 0 more to continue" when every field has a
  // value but one is out of bounds (e.g. volume entered as 0 with
  // min:0.1).
  const invalidFilled = REQUIRED_FIELDS.filter((f) => {
    const raw = values[f.key];
    return raw !== "" && raw !== undefined && validate(f, raw, { requireValue: true }) !== "";
  }).length;
  const remaining = REQUIRED_FIELDS.length - filledRequired;
  const isValid = remaining === 0 && invalidFilled === 0;

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
    clearDraft();
  }

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

  return (
    <div className="min-h-screen bg-surface">
      <Nav onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        {onBackToReport && (
          <button onClick={onBackToReport} className="btn-secondary">Back to Report</button>
        )}
      </Nav>

      <div className="max-w-[640px] mx-auto px-6 pt-16 pb-24">
        {/* Header — flush left per design spec */}
        <header className="mb-14 animate-editorial">
          {/* Asymmetric weight stack — soft "Understand Your" sets up
              the bold-serif punch of "Semen Analysis." Creates editorial
              tension instead of a flat single-weight headline. */}
          <h1 className="font-serif text-[clamp(32px,6vw,48px)] mb-4 leading-[1.1] tracking-tight">
            <span className="font-normal text-gray-400 italic">Understand Your</span>
            <br />
            <span className="font-bold text-gray-900">Semen Analysis</span>
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
        <div className="flex bg-surface-divider p-[3px] w-full max-w-[380px] mb-12">
          {[
            { key: "scan", label: "Smart Scan" },
            { key: "manual", label: "Manual Entry" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setEntryMode(tab.key)}
              className={`flex-1 text-[12px] font-semibold uppercase tracking-clinical py-2.5 transition-all cursor-pointer ${entryMode === tab.key
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
                <div className="flex-1 h-[2px] bg-surface-divider overflow-hidden">
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
              <div className="flex flex-col gap-[1px] bg-surface-divider mb-8 whisper-shadow-sm">
                {REQUIRED_FIELDS.map((f) => {
                  const raw = values[f.key];
                  const hasValue = raw !== "" && raw !== undefined;
                  // Recompute the live validation result so we can show
                  // an error even if errors[f.key] hasn't been set yet
                  // (the user typed an out-of-range value but never blurred).
                  const liveErr = hasValue ? validate(f, raw, { requireValue: true }) : "";
                  const fieldErr = errors[f.key] || liveErr;
                  // Show error if: blurred AND has error, OR every field
                  // is filled but this one is still out-of-range. The
                  // second condition stops the "Fix the highlighted
                  // field" button from being a wild-goose-chase prompt.
                  const hasError = !!fieldErr && (touched[f.key] || (hasValue && remaining === 0));
                  const isFieldValid = hasValue && !liveErr;
                  return (
                    <ParameterInput
                      key={f.key}
                      field={f}
                      rawValue={raw}
                      hasError={hasError}
                      errorText={fieldErr}
                      isFieldValid={isFieldValid}
                      unitWarning={extractedMeta.unitWarnings?.[f.key]}
                      isTooltipOpen={activeTooltip === f.key}
                      tooltipRef={tooltipRef}
                      onChange={(rawVal) => handleChange(f, rawVal, true)}
                      onBlur={() => handleBlur(f, true)}
                      onTooltipToggle={() => setActiveTooltip(activeTooltip === f.key ? null : f.key)}
                    />
                  );
                })}
              </div>

              {/* Context */}
              <div className="bg-surface-mid p-5 mb-8">
                <p className="label-clinical mb-4">About you (optional)</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "age", label: "Age", unit: "years", value: age, setter: setAge, error: ageError, errSetter: setAgeError },
                    { id: "monthsTrying", label: "Trying for a baby", unit: "months", value: monthsTrying, setter: setMonthsTrying, error: monthsError, errSetter: setMonthsError },
                  ].map((f) => {
                    const hasOptValue = f.value !== "" && f.value !== undefined;
                    const hasOptError = !!f.error;
                    const errorId = hasOptError ? `${f.id}-error` : null;
                    return (
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
                            aria-invalid={hasOptError}
                            aria-describedby={errorId || undefined}
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] text-gray-500">{f.unit}</span>
                        </div>
                        <div
                          className="h-[2px] mt-1 transition-all"
                          style={{
                            background: hasOptError
                              ? '#c2410c'
                              : hasOptValue
                                ? '#8BB992'
                                : 'linear-gradient(90deg, rgba(198,197,210,0.25) 0%, rgba(198,197,210,0.08) 100%)',
                          }}
                        />
                        {hasOptError && (
                          <p id={errorId} role="alert" aria-live="polite" className="text-[11px] text-orange-600 mt-1">{f.error}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progressive visual reward: button is greyed when no
                  fields are filled, comes alive (gradient + soft pulse)
                  the moment all 6 are valid. Gives the user a clear
                  signal that they're ready to submit. */}
              <button
                type="submit"
                disabled={!isValid}
                className={`w-full py-4 text-[12px] font-semibold uppercase tracking-[0.15rem] transition-all cursor-pointer ${isValid
                    ? "text-white"
                    : "bg-[#C6C5D2]/40 text-gray-500 cursor-not-allowed"
                  }`}
                style={isValid ? {
                  background: 'linear-gradient(135deg, #36458E 0%, #1d2d76 100%)',
                  boxShadow: '0 8px 24px rgba(17,24,82,0.18), 0 0 0 0 rgba(54,69,142,0.4)',
                  animation: 'btn-ready-pulse 2.4s ease-in-out infinite',
                } : undefined}
              >
                {isValid
                  ? "See My Report →"
                  : remaining > 0
                    ? `Fill ${remaining} more to continue`
                    : invalidFilled === 1
                      ? "Fix the highlighted field"
                      : `Fix ${invalidFilled} fields to continue`}
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
                className="flex-1 bg-surface-mid px-3 py-2.5 text-sm tracking-wider uppercase focus:outline-none"
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
