import { useState, useRef, useEffect } from "react";

const FIELDS = [
  { key: "spermCount", label: "Sperm Count",          unit: "million/mL", hint: "WHO: ≥ 16 million/mL",      tooltip: "The concentration of sperm per millilitre of semen.",                               min: 0,   max: 500, step: "any", extraNote: null },
  { key: "motility",   label: "Total Motility",        unit: "%",          hint: "WHO: ≥ 42%",                tooltip: "The percentage of sperm that are moving.",                                          min: 0,   max: 100, step: "any", extraNote: null },
  { key: "morphology", label: "Morphology",            unit: "%",          hint: "WHO: ≥ 4% (Kruger strict)", tooltip: "The percentage of sperm with a normal shape, using Kruger strict criteria.",       min: 0,   max: 100, step: "any", extraNote: "Even 2–3% is more common than you think." },
  { key: "volume",     label: "Semen Volume",          unit: "mL",         hint: "WHO: 1.4 – 7.6 mL",         tooltip: "The total amount of semen produced in one ejaculate.",                              min: 0,   max: 30,  step: "any", extraNote: null },
  { key: "pH",         label: "pH",                    unit: null,         hint: "WHO: 7.2 – 8.0",             tooltip: "The acidity level of semen — should be slightly alkaline.",                       min: 6.0, max: 9.0, step: "0.1", extraNote: null },
  { key: "wbc",        label: "WBC / Pus Cells",       unit: "million/mL", hint: "WHO: < 1 million/mL",        tooltip: "White blood cells in semen — elevated levels may indicate infection.",              min: 0,   max: 50,  step: "any", extraNote: null },
];

const FM_CODE_REGEX = /^FM-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;

export default function InputForm({ onSubmit, onFMCodeLookup, lookupError }) {
  const [values, setValues]           = useState({});
  const [errors, setErrors]           = useState({});
  const [touched, setTouched]         = useState({});
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showOptional, setShowOptional]   = useState(false);
  const [age, setAge]                 = useState("");
  const [monthsTrying, setMonthsTrying]   = useState("");
  const [ageError, setAgeError]       = useState("");
  const [monthsError, setMonthsError] = useState("");
  const [showFMCode, setShowFMCode]   = useState(false);
  const [fmCode, setFmCode]           = useState("");
  const [fmCodeError, setFmCodeError] = useState("");
  const tooltipRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target))
        setActiveTooltip(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function validate(field, raw) {
    if (raw === "" || raw === undefined) return "Required";
    const v = parseFloat(raw);
    if (isNaN(v)) return "Must be a number";
    if (v < field.min || v > field.max) return `Enter ${field.min}–${field.max}`;
    return "";
  }

  function handleChange(field, raw) {
    setValues((p) => ({ ...p, [field.key]: raw }));
    if (touched[field.key])
      setErrors((p) => ({ ...p, [field.key]: validate(field, raw) }));
  }

  function handleBlur(field) {
    setTouched((p) => ({ ...p, [field.key]: true }));
    setErrors((p) => ({ ...p, [field.key]: validate(field, values[field.key]) }));
  }

  function isFormValid() {
    return FIELDS.every((f) => {
      const raw = values[f.key];
      return raw !== "" && raw !== undefined && validate(f, raw) === "";
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {}, newTouched = {};
    FIELDS.forEach((f) => { newTouched[f.key] = true; newErrors[f.key] = validate(f, values[f.key]); });
    setTouched(newTouched);
    setErrors(newErrors);

    let ageErr = "", monthsErr = "";
    if (age !== "") { const a = parseFloat(age); if (isNaN(a) || a < 18 || a > 80) ageErr = "Must be 18–80"; }
    if (monthsTrying !== "") { const m = parseFloat(monthsTrying); if (isNaN(m) || m < 0 || m > 120) monthsErr = "Must be 0–120"; }
    setAgeError(ageErr);
    setMonthsError(monthsErr);
    if (!FIELDS.every((f) => newErrors[f.key] === "") || ageErr || monthsErr) return;

    const formData = {};
    FIELDS.forEach((f) => (formData[f.key] = parseFloat(values[f.key])));
    if (age !== "") formData.age = parseFloat(age);
    if (monthsTrying !== "") formData.monthsTrying = parseFloat(monthsTrying);
    onSubmit(formData);
  }

  function handleFMCodeLoad() {
    const trimmed = fmCode.trim().toUpperCase();
    if (!FM_CODE_REGEX.test(trimmed)) { setFmCodeError("Invalid format — use FM-XXXX-XXXX"); return; }
    setFmCodeError("");
    onFMCodeLookup(trimmed);
  }

  const valid = isFormValid();

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5" }}>
      <style>{`
        .fm-h1 { font-family: 'DM Serif Display', serif; }
        .fm-input:focus { outline: none; border-color: #0D6E6E !important; box-shadow: 0 0 0 3px rgba(13,110,110,0.1); }
        .fm-field:focus-within { border-color: #0D6E6E; }
        .fm-submit:not(:disabled):hover { background: #0a5757 !important; }
        .fm-submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .fm-tooltip-btn { transition: background 0.15s; }
        .fm-tooltip-btn:hover { background: #0D6E6E !important; color: #fff !important; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #ece8e3", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: "#0D6E6E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔬</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0D6E6E", lineHeight: 1.1 }}>ForMen Health</div>
          <div style={{ fontSize: 11, color: "#999", lineHeight: 1.1 }}>Lab Report Explainer</div>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 20px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 className="fm-h1" style={{ fontSize: "clamp(26px, 5vw, 40px)", color: "#0d1f1f", marginBottom: 10, lineHeight: 1.2 }}>
            Understand Your Semen Analysis
          </h1>
          <p style={{ fontSize: 15, color: "#666", maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
            Enter your report values. We'll explain every number in plain English and show you exactly what to do next.
          </p>
          <p style={{ fontSize: 12, color: "#aaa", marginTop: 10 }}>
            🔒 Your data stays on your device. We never collect your name, email, or phone number.
          </p>
        </div>

        {/* Form */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ece8e3", padding: "28px 24px" }}>
          <form onSubmit={handleSubmit} noValidate>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 4 }}>
              {FIELDS.map((field) => {
                const hasError = touched[field.key] && errors[field.key];
                return (
                  <div key={field.key} className="fm-field" style={{ border: `1.5px solid ${hasError ? "#f87171" : "#e8e3dd"}`, borderRadius: 10, padding: "12px 14px", transition: "border-color 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <label htmlFor={field.key} style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>{field.label}</label>
                      <div style={{ position: "relative" }} ref={activeTooltip === field.key ? tooltipRef : null}>
                        <button
                          type="button"
                          aria-label={`What is ${field.label}?`}
                          onClick={() => setActiveTooltip(activeTooltip === field.key ? null : field.key)}
                          className="fm-tooltip-btn"
                          style={{ width: 28, height: 28, borderRadius: "50%", background: activeTooltip === field.key ? "#0D6E6E" : "#e0dbd5", color: activeTooltip === field.key ? "#fff" : "#777", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          ?
                        </button>
                        {activeTooltip === field.key && (
                          <div role="tooltip" style={{ position: "absolute", right: 0, bottom: "calc(100% + 8px)", width: 220, background: "#1a1a1a", color: "#fff", fontSize: 12, lineHeight: 1.55, borderRadius: 8, padding: "10px 12px", zIndex: 100 }}>
                            {field.tooltip}
                            <div style={{ position: "absolute", bottom: -5, right: 12, width: 10, height: 10, background: "#1a1a1a", transform: "rotate(45deg)" }} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ position: "relative" }}>
                      <input id={field.key} type="number" inputMode="decimal" step={field.step} placeholder="—"
                        value={values[field.key] ?? ""}
                        onChange={(e) => handleChange(field, e.target.value)}
                        onBlur={() => handleBlur(field)}
                        className="fm-input"
                        style={{ width: "100%", border: "none", background: "transparent", fontSize: 20, fontWeight: 700, color: "#1a1a1a", paddingRight: field.unit ? 64 : 0, fontFamily: "'DM Sans', sans-serif" }}
                      />
                      {field.unit && (
                        <span style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#bbb", pointerEvents: "none" }}>{field.unit}</span>
                      )}
                    </div>

                    <p style={{ fontSize: 11, color: hasError ? "#e55" : "#ccc", margin: "5px 0 0" }}>
                      {hasError ? `⚠ ${errors[field.key]}` : field.hint}
                    </p>
                    {field.extraNote && !hasError && (
                      <p style={{ fontSize: 11, color: "#bbb", margin: "2px 0 0", fontStyle: "italic" }}>{field.extraNote}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Optional */}
            <div style={{ marginTop: 20, borderTop: "1px solid #f0ebe5", paddingTop: 16 }}>
              <button type="button" onClick={() => setShowOptional((p) => !p)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#0D6E6E", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", padding: 0 }}>
                {showOptional ? "▾" : "▸"} Personalise my advice (optional)
              </button>
              {showOptional && (
                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { id: "age", label: "Age", unit: "years", value: age, setter: setAge, error: ageError, errSetter: setAgeError },
                    { id: "monthsTrying", label: "Months trying to conceive", unit: "months", value: monthsTrying, setter: setMonthsTrying, error: monthsError, errSetter: setMonthsError },
                  ].map((f) => (
                    <div key={f.id} style={{ border: "1.5px solid #e8e3dd", borderRadius: 10, padding: "10px 12px" }}>
                      <label htmlFor={f.id} style={{ fontSize: 11, fontWeight: 600, color: "#888", display: "block", marginBottom: 6 }}>{f.label}</label>
                      <div style={{ position: "relative" }}>
                        <input id={f.id} type="number" inputMode="numeric" placeholder="—" value={f.value}
                          onChange={(e) => { f.setter(e.target.value); f.errSetter(""); }}
                          className="fm-input"
                          style={{ width: "100%", border: "none", background: "transparent", fontSize: 18, fontWeight: 700, color: "#1a1a1a", paddingRight: 44, fontFamily: "'DM Sans', sans-serif" }}
                        />
                        <span style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#bbb" }}>{f.unit}</span>
                      </div>
                      {f.error && <p style={{ fontSize: 11, color: "#e55", margin: "4px 0 0" }}>⚠ {f.error}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={!valid} className="fm-submit"
              style={{ width: "100%", marginTop: 24, background: "#0D6E6E", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, padding: "16px 24px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s" }}>
              Analyse My Report →
            </button>
          </form>
        </div>

        {/* FM Code */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          {!showFMCode ? (
            <button type="button" onClick={() => setShowFMCode(true)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#0D6E6E", textDecoration: "underline", fontFamily: "'DM Sans', sans-serif" }}>
              Have an FM Code? Access your previous results →
            </button>
          ) : (
            <div style={{ maxWidth: 360, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" placeholder="FM-XXXX-XXXX" value={fmCode}
                  onChange={(e) => { setFmCode(e.target.value); setFmCodeError(""); }}
                  className="fm-input"
                  style={{ flex: 1, border: `1.5px solid ${fmCodeError || lookupError ? "#f87171" : "#ddd"}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", letterSpacing: "0.05em", textTransform: "uppercase" }}
                />
                <button type="button" onClick={handleFMCodeLoad}
                  style={{ background: "#0D6E6E", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Load
                </button>
              </div>
              {(fmCodeError || lookupError) && (
                <p style={{ fontSize: 12, color: "#e55", marginTop: 6, textAlign: "left" }}>
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
