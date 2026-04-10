import { useState, memo } from "react";
import { STATUS_CONFIG } from "../lib/constants";

const DEEPER_EXPLANATIONS = {
  "Sperm Count": "Sperm concentration tells us how many sperm are available per millilitre. WHO defines ≥16 million/mL as normal, though total count (concentration × volume) is equally important for natural conception.",
  "Motility": "Motility measures the percentage of sperm that are moving. WHO distinguishes between progressive motility (sperm swimming forward) and total motility. Progressive motility ≥30% is considered normal.",
  "Morphology": "Morphology uses Kruger strict criteria — one of the most stringent standards in lab medicine. Only 4% of sperm need to be 'textbook perfect' for this to be classified as normal. This is frequently misread as catastrophic when it's a normal lab standard.",
  "Volume": "Semen volume reflects secretions from the seminal vesicles and prostate. Very low volume (hypospermia) can indicate a blockage or hormonal issue. Very high volume can dilute sperm concentration.",
  "pH": "Semen should be slightly alkaline (pH 7.2–8.0) to protect sperm from the acidic vaginal environment. Low pH may indicate ejaculatory duct issues; high pH may point to infection.",
  "WBC": "White blood cells (pus cells) in semen can indicate infection or inflammation in the reproductive tract. Elevated WBC (>1 million/mL) is called leukocytospermia and is worth investigating with a urologist.",
};

export default memo(function ParameterCard({ paramName, value, unit, whoRange, status, contextualizingLine }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NORMAL;
  const deeper = DEEPER_EXPLANATIONS[paramName] || null;

  return (
    <div className={`card border-l-[3px] ${cfg.border} p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-bold text-gray-700">{paramName}</span>
        <span className={`text-[11px] font-semibold ${cfg.badgeText} ${cfg.badgeBg} px-2.5 py-0.5 rounded-full`}>
          {cfg.label}
        </span>
      </div>

      {/* Value */}
      <div className="mb-1">
        <span className="text-[28px] font-extrabold text-gray-900 leading-none">{value}</span>
        {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
      </div>

      {/* WHO range */}
      <p className="text-[11px] text-gray-300 mb-2.5">WHO: {whoRange}</p>

      {/* Context line */}
      <p className="text-[13px] text-gray-500 leading-snug mb-2.5">{contextualizingLine}</p>

      {/* Learn more */}
      {deeper && (
        <>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="bg-transparent border-none cursor-pointer text-xs text-brand-600 font-semibold p-0"
            aria-expanded={expanded}
          >
            {expanded ? "Show less ▴" : "Learn more ▾"}
          </button>
          {expanded && (
            <p className="text-xs text-gray-500 leading-relaxed mt-2 mb-0 p-2.5 bg-gray-50 rounded-lg">
              {deeper}
            </p>
          )}
        </>
      )}
    </div>
  );
});
