import { useState, useRef, useEffect } from "react";

const FIELDS = [
  {
    key: "spermCount",
    label: "Sperm Count",
    unit: "million/mL",
    hint: "WHO guideline: ≥ 16 million/mL",
    tooltip: "The concentration of sperm per millilitre of semen.",
    min: 0,
    max: 500,
    step: "any",
    extraNote: null,
  },
  {
    key: "motility",
    label: "Total Motility",
    unit: "%",
    hint: "WHO guideline: ≥ 42%",
    tooltip: "The percentage of sperm that are moving.",
    min: 0,
    max: 100,
    step: "any",
    extraNote: null,
  },
  {
    key: "morphology",
    label: "Morphology (normal forms)",
    unit: "%",
    hint: "WHO guideline: ≥ 4% (Kruger strict)",
    tooltip:
      "The percentage of sperm with a normal shape, using Kruger strict criteria.",
    min: 0,
    max: 100,
    step: "any",
    extraNote:
      "Even 2–3% is more common than you think. Enter what's on your report.",
  },
  {
    key: "volume",
    label: "Semen Volume",
    unit: "mL",
    hint: "WHO guideline: 1.4 – 7.6 mL",
    tooltip: "The total amount of semen produced in one ejaculate.",
    min: 0,
    max: 30,
    step: "any",
    extraNote: null,
  },
  {
    key: "pH",
    label: "pH",
    unit: null,
    hint: "WHO guideline: 7.2 – 8.0",
    tooltip: "The acidity level of semen — should be slightly alkaline.",
    min: 6.0,
    max: 9.0,
    step: "0.1",
    extraNote: null,
  },
  {
    key: "wbc",
    label: "WBC / Pus Cells",
    unit: "million/mL",
    hint: "WHO guideline: < 1 million/mL",
    tooltip:
      "White blood cells in semen — elevated levels may indicate infection.",
    min: 0,
    max: 50,
    step: "any",
    extraNote: null,
  },
];

const FM_CODE_REGEX = /^FM-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;

export default function InputForm({ onSubmit, onFMCodeLookup }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showOptional, setShowOptional] = useState(false);
  const [age, setAge] = useState("");
  const [monthsTrying, setMonthsTrying] = useState("");
  const [ageError, setAgeError] = useState("");
  const [monthsError, setMonthsError] = useState("");
  const [showFMCode, setShowFMCode] = useState(false);
  const [fmCode, setFmCode] = useState("");
  const [fmCodeError, setFmCodeError] = useState("");
  const tooltipRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setActiveTooltip(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function validate(field, raw) {
    if (raw === "" || raw === undefined) return "Required";
    const v = parseFloat(raw);
    if (isNaN(v)) return "Must be a number";
    if (v < field.min || v > field.max)
      return `Must be between ${field.min} and ${field.max}`;
    return "";
  }

  function handleChange(field, raw) {
    setValues((prev) => ({ ...prev, [field.key]: raw }));
    if (touched[field.key]) {
      setErrors((prev) => ({ ...prev, [field.key]: validate(field, raw) }));
    }
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field.key]: true }));
    setErrors((prev) => ({
      ...prev,
      [field.key]: validate(field, values[field.key]),
    }));
  }

  function isFormValid() {
    return FIELDS.every((f) => {
      const raw = values[f.key];
      return raw !== "" && raw !== undefined && validate(f, raw) === "";
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    const newTouched = {};
    FIELDS.forEach((f) => {
      newTouched[f.key] = true;
      newErrors[f.key] = validate(f, values[f.key]);
    });
    setTouched(newTouched);
    setErrors(newErrors);

    let optionalAgeErr = "";
    let optionalMonthsErr = "";
    if (age !== "") {
      const a = parseFloat(age);
      if (isNaN(a) || a < 18 || a > 80) optionalAgeErr = "Must be 18–80";
    }
    if (monthsTrying !== "") {
      const m = parseFloat(monthsTrying);
      if (isNaN(m) || m < 0 || m > 120) optionalMonthsErr = "Must be 0–120";
    }
    setAgeError(optionalAgeErr);
    setMonthsError(optionalMonthsErr);

    const hasRequired = FIELDS.every((f) => newErrors[f.key] === "");
    if (!hasRequired || optionalAgeErr || optionalMonthsErr) return;

    const formData = {};
    FIELDS.forEach((f) => (formData[f.key] = parseFloat(values[f.key])));
    if (age !== "") formData.age = parseFloat(age);
    if (monthsTrying !== "") formData.monthsTrying = parseFloat(monthsTrying);
    onSubmit(formData);
  }

  function handleFMCodeLoad() {
    const trimmed = fmCode.trim();
    if (!FM_CODE_REGEX.test(trimmed)) {
      setFmCodeError("Please enter a valid FM code (format: FM-XXXX-XXXX)");
      return;
    }
    setFmCodeError("");
    onFMCodeLookup(trimmed);
  }

  const valid = isFormValid();

  return (
    <div
      className="min-h-screen w-full flex items-start justify-center px-4 py-8 sm:py-12"
      style={{ background: "#FAF8F5" }}
    >
      <style>{`
        .fm-form h1 { font-family: 'DM Serif Display', serif; }
        .fm-input:focus { outline: none; box-shadow: 0 0 0 2px rgba(13,110,110,0.25); }
        .fm-input.error { border-color: #f87171; }
        .fm-input.error:focus { box-shadow: 0 0 0 2px rgba(248,113,113,0.25); }
        .fm-btn-submit:not(:disabled):hover { background: #0a5a5a; }
        .fm-btn-submit:not(:disabled):active { transform: scale(0.99); }
        .fm-btn-submit:disabled { opacity: 0.45; cursor: not-allowed; }
        .fm-tooltip-enter { animation: tooltipFade 0.15s ease; }
        @keyframes tooltipFade { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="fm-form w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: "#1a1a1a" }}
          >
            Understand Your Semen Analysis
          </h1>
          <p className="text-base sm:text-lg mb-4" style={{ color: "#555" }}>
            Enter your values below. We'll explain what they mean in plain
            English and show you exactly what to do next.{" "}
            <span className="font-medium" style={{ color: "#0D6E6E" }}>
              Takes 60 seconds.
            </span>
          </p>
          <div
            className="inline-flex items-center gap-1.5 text-sm rounded-full px-4 py-1.5"
            style={{ background: "#edf5f5", color: "#0D6E6E" }}
          >
            <span>🔒</span>
            <span>No login required. Your data stays on your device.</span>
          </div>
        </div>

        {/* Required Fields */}
        <div className="space-y-5">
          {FIELDS.map((field) => {
            const hasError = touched[field.key] && errors[field.key];
            return (
              <div key={field.key}>
                {/* Label row */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label
                    htmlFor={field.key}
                    className="text-sm font-semibold"
                    style={{ color: "#1a1a1a" }}
                  >
                    {field.label}
                  </label>
                  <div className="relative" ref={activeTooltip === field.key ? tooltipRef : null}>
                    <button
                      type="button"
                      aria-label={`Info about ${field.label}`}
                      className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold leading-none"
                      style={{
                        background: activeTooltip === field.key ? "#0D6E6E" : "#d4d4d4",
                        color: activeTooltip === field.key ? "#fff" : "#555",
                        transition: "background 0.15s",
                      }}
                      onClick={() =>
                        setActiveTooltip(
                          activeTooltip === field.key ? null : field.key
                        )
                      }
                    >
                      i
                    </button>
                    {activeTooltip === field.key && (
                      <div
                        className="fm-tooltip-enter absolute z-20 left-1/2 bottom-full mb-2 w-60 rounded-lg px-3 py-2 text-xs text-white shadow-lg"
                        style={{
                          background: "#1a1a1a",
                          transform: "translateX(-50%)",
                        }}
                      >
                        {field.tooltip}
                        <div
                          className="absolute left-1/2 top-full -translate-x-1/2"
                          style={{
                            width: 0,
                            height: 0,
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderTop: "6px solid #1a1a1a",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Input row */}
                <div className="relative">
                  <input
                    id={field.key}
                    type="number"
                    inputMode="decimal"
                    step={field.step}
                    placeholder="0"
                    value={values[field.key] ?? ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    onBlur={() => handleBlur(field)}
                    className={`fm-input w-full rounded-lg border bg-white px-3 text-base ${
                      hasError
                        ? "error border-red-400"
                        : "border-gray-200 focus:border-teal-600"
                    }`}
                    style={{
                      minHeight: 48,
                      paddingRight: field.unit ? 80 : 12,
                      color: "#1a1a1a",
                    }}
                  />
                  {field.unit && (
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
                      style={{ color: "#999" }}
                    >
                      {field.unit}
                    </span>
                  )}
                </div>

                {/* Hint */}
                <p className="text-xs mt-1" style={{ color: "#999" }}>
                  {field.hint}
                </p>

                {/* Error */}
                {hasError && (
                  <p className="text-xs mt-0.5 text-red-500 font-medium">
                    {errors[field.key]}
                  </p>
                )}

                {/* Extra note */}
                {field.extraNote && (
                  <p
                    className="text-xs mt-1 italic"
                    style={{ color: "#777" }}
                  >
                    {field.extraNote}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Optional Section */}
        <div className="mt-8">
          <button
            type="button"
            className="text-sm font-medium flex items-center gap-1"
            style={{ color: "#0D6E6E" }}
            onClick={() => setShowOptional((p) => !p)}
          >
            Personalise my advice{" "}
            <span
              className="inline-block transition-transform duration-200"
              style={{
                transform: showOptional ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▾
            </span>
          </button>

          {showOptional && (
            <div className="mt-4 space-y-4 p-4 rounded-xl" style={{ background: "#f0edea" }}>
              {/* Age */}
              <div>
                <label
                  htmlFor="age"
                  className="text-sm font-semibold block mb-1.5"
                  style={{ color: "#1a1a1a" }}
                >
                  Age (years)
                </label>
                <input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 32"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    setAgeError("");
                  }}
                  className={`fm-input w-full rounded-lg border bg-white px-3 text-base ${
                    ageError
                      ? "error border-red-400"
                      : "border-gray-200 focus:border-teal-600"
                  }`}
                  style={{ minHeight: 48, color: "#1a1a1a" }}
                />
                {ageError && (
                  <p className="text-xs mt-0.5 text-red-500 font-medium">
                    {ageError}
                  </p>
                )}
              </div>

              {/* Months Trying */}
              <div>
                <label
                  htmlFor="monthsTrying"
                  className="text-sm font-semibold block mb-1.5"
                  style={{ color: "#1a1a1a" }}
                >
                  Months trying to conceive
                </label>
                <input
                  id="monthsTrying"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 6"
                  value={monthsTrying}
                  onChange={(e) => {
                    setMonthsTrying(e.target.value);
                    setMonthsError("");
                  }}
                  className={`fm-input w-full rounded-lg border bg-white px-3 text-base ${
                    monthsError
                      ? "error border-red-400"
                      : "border-gray-200 focus:border-teal-600"
                  }`}
                  style={{ minHeight: 48, color: "#1a1a1a" }}
                />
                <p className="text-xs mt-1" style={{ color: "#999" }}>
                  This helps us calibrate the urgency of our advice.
                </p>
                {monthsError && (
                  <p className="text-xs mt-0.5 text-red-500 font-medium">
                    {monthsError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!valid}
          className="fm-btn-submit w-full rounded-lg text-white text-base font-semibold mt-8 transition-all duration-150"
          style={{
            background: "#0D6E6E",
            minHeight: 56,
          }}
        >
          Analyse My Report →
        </button>

        {/* FM Code Section */}
        <div className="mt-6 text-center">
          {!showFMCode ? (
            <button
              type="button"
              className="text-sm underline"
              style={{ color: "#0D6E6E" }}
              onClick={() => setShowFMCode(true)}
            >
              Have an FM Code? Access your previous results →
            </button>
          ) : (
            <div className="mt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="FM-XXXX-XXXX"
                  value={fmCode}
                  onChange={(e) => {
                    setFmCode(e.target.value);
                    setFmCodeError("");
                  }}
                  className={`fm-input flex-1 rounded-lg border bg-white px-3 text-sm ${
                    fmCodeError
                      ? "error border-red-400"
                      : "border-gray-200 focus:border-teal-600"
                  }`}
                  style={{ minHeight: 44, color: "#1a1a1a" }}
                />
                <button
                  type="button"
                  onClick={handleFMCodeLoad}
                  className="rounded-lg px-4 text-sm font-semibold text-white shrink-0"
                  style={{ background: "#0D6E6E", minHeight: 44 }}
                >
                  Load Results
                </button>
              </div>
              {fmCodeError && (
                <p className="text-xs mt-1.5 text-red-500 font-medium text-left">
                  {fmCodeError}
                </p>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
