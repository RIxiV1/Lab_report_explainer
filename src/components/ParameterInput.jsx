// Single semen-analysis input row, including label, info tooltip,
// real-time valid checkmark, value+unit input, animated underline,
// hint/error text, and per-field unit warning. Extracted from
// InputForm so the parent renders cleanly.
//
// Props are intentionally pre-derived (hasError, isFieldValid) so this
// component stays presentation-only. Parent owns validation logic and
// the shared tooltip ref.

export default function ParameterInput({
  field,
  rawValue,
  hasError,
  errorText,
  isFieldValid,
  unitWarning,
  isTooltipOpen,
  tooltipRef,
  onChange,
  onBlur,
  onTooltipToggle,
}) {
  const hintId = `${field.key}-hint`;
  const warningId = unitWarning && !hasError ? `${field.key}-warning` : null;
  const describedBy = [hintId, warningId].filter(Boolean).join(" ");

  return (
    <div className="bg-white p-5 transition-colors hover:bg-surface-hover">
      <div className="flex items-center gap-2 mb-3">
        <label htmlFor={field.key} className="label-clinical">{field.label}</label>
        {/* Real-time valid checkmark — instant positive feedback */}
        {isFieldValid && (
          <span
            aria-hidden="true"
            className="text-wellness-600 text-[12px] leading-none"
            style={{ animation: 'editorial-fade-up 0.2s ease forwards' }}
            title="Looks valid"
          >
            ✓
          </span>
        )}
        <div className="relative ml-auto" ref={isTooltipOpen ? tooltipRef : null}>
          <button
            type="button"
            aria-label={`About ${field.label}`}
            aria-expanded={isTooltipOpen}
            onClick={onTooltipToggle}
            className="text-[10px] text-gray-500 hover:text-brand-500 cursor-pointer bg-transparent border-none uppercase tracking-wide font-semibold transition-colors"
          >
            Info
          </button>
          {isTooltipOpen && (
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
          value={rawValue ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="fm-input"
          style={field.unit ? { paddingRight: 52 } : undefined}
          aria-invalid={!!hasError}
          aria-describedby={describedBy}
          aria-required="true"
        />
        {field.unit && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] text-gray-500 font-medium pointer-events-none">
            {field.unit}
          </span>
        )}
      </div>

      {/* Underline reflects state: error (orange) > valid (green) > neutral */}
      <div
        className="h-[2px] mt-1 transition-all"
        style={{
          background: hasError
            ? '#c2410c'
            : isFieldValid
              ? '#8BB992'
              : 'linear-gradient(90deg, rgba(198,197,210,0.25) 0%, rgba(198,197,210,0.08) 100%)',
        }}
      />

      <p
        id={hintId}
        className={`text-[11px] mt-2 ${hasError ? "text-orange-600 font-medium" : "text-gray-500"}`}
        role={hasError ? "alert" : undefined}
        aria-live={hasError ? "polite" : undefined}
      >
        {hasError ? errorText : field.hint}
      </p>

      {unitWarning && !hasError && (
        <div id={warningId} role="note" className="mt-2 p-3 bg-yellow-50 border-l-[3px] border-yellow-500">
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
