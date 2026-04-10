import { useState, useRef, useEffect, useCallback } from "react";
import { parseReportText } from "../lib/reportParser";
import { INPUT_FIELDS, FM_CODE_REGEX, DRAFT_KEY } from "../lib/constants";
import Nav from "./Nav";

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
  } catch { return {}; }
}

function validate(field, raw) {
  if (raw === "" || raw === undefined) return "Required";
  const v = parseFloat(raw);
  if (isNaN(v)) return "Must be a number";
  if (v < field.min || v > field.max) return `Enter ${field.min}–${field.max}`;
  return "";
}

export default function InputForm({ onSubmit, onFMCodeLookup, lookupError, onBackToReport }) {
  const draft = useRef(loadDraft()).current;
  const [values, setValues] = useState(draft.values || {});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showOptional, setShowOptional] = useState(!!(draft.age || draft.monthsTrying));
  const [age, setAge] = useState(draft.age || "");
  const [monthsTrying, setMonthsTrying] = useState(draft.monthsTrying || "");
  const [ageError, setAgeError] = useState("");
  const [monthsError, setMonthsError] = useState("");
  const [showFMCode, setShowFMCode] = useState(false);
  const [fmCode, setFmCode] = useState("");
  const [fmCodeError, setFmCodeError] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [parseResult, setParseResult] = useState(null);
  const tooltipRef = useRef(null);
  const draftTimer = useRef(null);

  // Debounced draft persistence
  useEffect(() => {
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, age, monthsTrying })); } catch {}
    }, 500);
    return () => clearTimeout(draftTimer.current);
  }, [values, age, monthsTrying]);

  // Close tooltip on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target))
        setActiveTooltip(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = useCallback((field, raw) => {
    setValues((p) => ({ ...p, [field.key]: raw }));
    setErrors((p) => {
      if (!p[field.key]) return p;
      return { ...p, [field.key]: validate(field, raw) };
    });
  }, []);

  function handleBlur(field) {
    setTouched((p) => ({ ...p, [field.key]: true }));
    setErrors((p) => ({ ...p, [field.key]: validate(field, values[field.key]) }));
  }

  const filledCount = INPUT_FIELDS.filter((f) => values[f.key] !== "" && values[f.key] !== undefined).length;
  const isValid = INPUT_FIELDS.every((f) => {
    const raw = values[f.key];
    return raw !== "" && raw !== undefined && validate(f, raw) === "";
  });

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    const newTouched = {};
    INPUT_FIELDS.forEach((f) => {
      newTouched[f.key] = true;
      newErrors[f.key] = validate(f, values[f.key]);
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

    if (!INPUT_FIELDS.every((f) => newErrors[f.key] === "") || ageErr || monthsErr) return;

    const formData = {};
    INPUT_FIELDS.forEach((f) => (formData[f.key] = parseFloat(values[f.key])));
    if (age !== "") formData.age = parseFloat(age);
    if (monthsTrying !== "") formData.ttcMonths = parseFloat(monthsTrying);
    onSubmit(formData);
  }

  function handleFMCodeLoad() {
    const trimmed = fmCode.trim().toUpperCase();
    if (!FM_CODE_REGEX.test(trimmed)) {
      setFmCodeError("Invalid format — use FM-XXXX-XXXX");
      return;
    }
    setFmCodeError("");
    onFMCodeLookup(trimmed);
  }

  function handlePasteAnalyse() {
    if (!pasteText.trim()) return;
    const result = parseReportText(pasteText);
    setParseResult(result);
    if (result.foundCount > 0) {
      setValues((prev) => ({
        ...prev,
        ...Object.fromEntries(Object.entries(result.results).map(([k, v]) => [k, String(v)])),
      }));
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <Nav>
        {onBackToReport && (
          <button onClick={onBackToReport} className="btn-secondary px-3.5 py-[7px]">
            Back to Report &rarr;
          </button>
        )}
      </Nav>

      <div className="max-w-[680px] mx-auto px-5 pt-9 pb-20">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="font-serif text-[clamp(26px,5vw,40px)] text-gray-900 mb-2.5 leading-tight">
            Understand Your Semen Analysis
          </h1>
          <p className="text-sm text-gray-500 max-w-[460px] mx-auto leading-relaxed">
            Enter your report values. We'll explain every number in plain English and show you exactly what to do next.
          </p>
          <p className="text-xs text-gray-400 mt-2.5">
            Your data stays on your device. We never collect your name, email, or phone number.
          </p>
        </header>

        {/* Paste from Report */}
        <div className="mb-5 text-center">
          <button
            type="button"
            onClick={() => setShowPaste((p) => !p)}
            className="border-[1.5px] border-dashed border-brand-600 rounded-xl px-5 py-2.5 text-[13px] text-brand-600 font-semibold bg-transparent cursor-pointer hover:bg-brand-50 transition-colors"
          >
            {showPaste ? "▾ Hide" : "Paste from your lab report"} — auto-fill values
          </button>

          {showPaste && (
            <div className="mt-3 text-left">
              <textarea
                value={pasteText}
                onChange={(e) => { setPasteText(e.target.value); setParseResult(null); }}
                placeholder={"Paste your lab report text here...\n\nExample:\nSperm Count: 45 million/mL\nTotal Motility: 55%\nMorphology: 5%\nVolume: 3.2 mL\npH: 7.4\nWBC: 0.3 million/mL"}
                className="w-full min-h-[120px] border-[1.5px] border-gray-300 rounded-xl p-3 text-[13px] resize-y bg-white box-border focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
                aria-label="Paste lab report text"
              />
              <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={handlePasteAnalyse} className="btn-primary px-4 py-2">
                  Extract Values
                </button>
                {parseResult && (
                  <span className={`text-[13px] font-medium ${parseResult.foundCount > 0 ? "text-green-700" : "text-red-500"}`}>
                    {parseResult.foundCount > 0
                      ? `Found ${parseResult.foundCount} of 6 values — check and adjust below`
                      : "Couldn't extract values — please enter manually"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Card */}
        <div className="card p-7">
          <form onSubmit={handleSubmit} noValidate>
            {/* Progress Bar */}
            <div className="flex items-center gap-2.5 mb-4" role="progressbar" aria-valuenow={filledCount} aria-valuemin={0} aria-valuemax={6} aria-label="Form completion">
              <div className="flex-1 h-1 bg-sand-300 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${filledCount === 6 ? "bg-green-600" : "bg-brand-600"}`}
                  style={{ width: `${(filledCount / 6) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${filledCount === 6 ? "text-green-600" : "text-gray-400"}`}>
                {filledCount} of 6
              </span>
            </div>

            {/* Field Grid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 mb-1">
              {INPUT_FIELDS.map((field) => {
                const hasError = touched[field.key] && errors[field.key];
                return (
                  <div
                    key={field.key}
                    className={`border-[1.5px] rounded-xl p-3 transition-colors focus-within:border-brand-600 ${hasError ? "border-red-400" : "border-sand-300"}`}
                  >
                    {/* Label + Tooltip */}
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor={field.key} className="text-xs font-semibold text-gray-500">
                        {field.label}
                      </label>
                      <div className="relative" ref={activeTooltip === field.key ? tooltipRef : null}>
                        <button
                          type="button"
                          aria-label={`What is ${field.label}?`}
                          aria-expanded={activeTooltip === field.key}
                          onClick={() => setActiveTooltip(activeTooltip === field.key ? null : field.key)}
                          className={`w-7 h-7 rounded-full border-none cursor-pointer text-xs font-bold flex items-center justify-center transition-colors ${
                            activeTooltip === field.key
                              ? "bg-brand-600 text-white"
                              : "bg-sand-400 text-gray-500 hover:bg-brand-600 hover:text-white"
                          }`}
                        >
                          ?
                        </button>
                        {activeTooltip === field.key && (
                          <div role="tooltip" className="absolute right-0 bottom-[calc(100%+8px)] w-[min(220px,70vw)] bg-gray-900 text-white text-xs leading-relaxed rounded-lg p-2.5 z-50">
                            {field.tooltip}
                            <div className="absolute -bottom-[5px] right-3 w-2.5 h-2.5 bg-gray-900 rotate-45" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Input */}
                    <div className="relative">
                      <input
                        id={field.key}
                        type="number"
                        inputMode="decimal"
                        step={field.step}
                        placeholder="—"
                        value={values[field.key] ?? ""}
                        onChange={(e) => handleChange(field, e.target.value)}
                        onBlur={() => handleBlur(field)}
                        className="fm-input"
                        style={field.unit ? { paddingRight: 64 } : undefined}
                        aria-invalid={!!hasError}
                        aria-describedby={hasError ? `${field.key}-error` : `${field.key}-hint`}
                      />
                      {field.unit && (
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] text-gray-300 pointer-events-none">
                          {field.unit}
                        </span>
                      )}
                    </div>

                    {/* Hint / Error */}
                    <p
                      id={hasError ? `${field.key}-error` : `${field.key}-hint`}
                      role={hasError ? "alert" : undefined}
                      className={`text-[11px] mt-1.5 mb-0 ${hasError ? "text-red-500" : "text-gray-300"}`}
                    >
                      {hasError ? `⚠ ${errors[field.key]}` : field.hint}
                    </p>
                    {field.extraNote && !hasError && (
                      <p className="text-[11px] text-gray-400 mt-0.5 italic">{field.extraNote}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Optional Fields */}
            <div className="mt-5 border-t border-sand-100 pt-4">
              <button
                type="button"
                onClick={() => setShowOptional((p) => !p)}
                className="bg-transparent border-none cursor-pointer text-[13px] text-brand-600 font-semibold p-0"
              >
                {showOptional ? "▾" : "▸"} Personalise my advice (optional)
              </button>
              {showOptional && (
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {[
                    { id: "age", label: "Age", unit: "years", value: age, setter: setAge, error: ageError, errSetter: setAgeError },
                    { id: "monthsTrying", label: "Months trying to conceive", unit: "months", value: monthsTrying, setter: setMonthsTrying, error: monthsError, errSetter: setMonthsError },
                  ].map((f) => (
                    <div key={f.id} className="border-[1.5px] border-sand-300 rounded-xl p-2.5">
                      <label htmlFor={f.id} className="text-[11px] font-semibold text-gray-400 block mb-1.5">
                        {f.label}
                      </label>
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
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] text-gray-300">
                          {f.unit}
                        </span>
                      </div>
                      {f.error && (
                        <p role="alert" className="text-[11px] text-red-500 mt-1">{f.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid}
              className="btn-primary w-full mt-6 py-4 text-[15px]"
            >
              Analyse My Report &rarr;
            </button>
          </form>
        </div>

        {/* FM Code Lookup */}
        <div className="text-center mt-6">
          {!showFMCode ? (
            <button
              type="button"
              onClick={() => setShowFMCode(true)}
              className="bg-transparent border-none cursor-pointer text-[13px] text-brand-600 underline"
            >
              Have an FM Code? Access your previous results &rarr;
            </button>
          ) : (
            <div className="max-w-[360px] mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="FM-XXXX-XXXX"
                  value={fmCode}
                  onChange={(e) => { setFmCode(e.target.value); setFmCodeError(""); }}
                  className={`flex-1 border-[1.5px] rounded-lg px-3 py-2.5 text-sm bg-white tracking-wider uppercase focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 ${
                    fmCodeError || lookupError ? "border-red-400" : "border-gray-300"
                  }`}
                  aria-label="FM Code"
                  aria-invalid={!!(fmCodeError || lookupError)}
                />
                <button type="button" onClick={handleFMCodeLoad} className="btn-primary px-4 py-2.5">
                  Load
                </button>
              </div>
              {(fmCodeError || lookupError) && (
                <p role="alert" className="text-xs text-red-500 mt-1.5 text-left">
                  {fmCodeError || lookupError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
