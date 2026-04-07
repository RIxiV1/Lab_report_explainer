import { useState } from "react";

const DEEPER_EXPLANATIONS = {
  "Sperm Count":
    "Sperm concentration tells us how many sperm are available per millilitre. WHO defines ≥16 million/mL as normal, though total count (concentration × volume) is equally important for natural conception.",
  Motility:
    "Motility measures the percentage of sperm that are moving. WHO distinguishes between progressive motility (sperm swimming forward) and total motility. Progressive motility ≥30% is considered normal.",
  Morphology:
    "Morphology uses Kruger strict criteria — one of the most stringent standards in lab medicine. Only 4% of sperm need to be 'textbook perfect' for this to be classified as normal. This value is frequently misread as catastrophic when it's actually a lab standard.",
  Volume:
    "Semen volume reflects the secretions from the seminal vesicles and prostate. Very low volume (hypospermia) can indicate a blockage or hormonal issue. Very high volume can dilute sperm concentration.",
  pH: "Semen should be slightly alkaline (pH 7.2–8.0) to protect sperm from the acidic environment of the vagina. Low pH may indicate ejaculatory duct issues; high pH may point to infection.",
  WBC: "White blood cells (pus cells) in semen can indicate infection or inflammation in the reproductive tract. Elevated WBC (>1 million/mL) is called leukocytospermia and is worth investigating with a urologist.",
};

const STATUS_STYLES = {
  NORMAL: { border: "border-l-green-500", dot: "bg-green-500" },
  WARNING: { border: "border-l-amber-500", dot: "bg-amber-500" },
  CRITICAL: { border: "border-l-red-400", dot: "bg-red-400" },
};

export default function ParameterCard({
  paramName,
  value,
  unit,
  whoRange,
  status,
  contextualizingLine,
}) {
  const [expanded, setExpanded] = useState(false);
  const styles = STATUS_STYLES[status] || STATUS_STYLES.NORMAL;
  const deeper = DEEPER_EXPLANATIONS[paramName] || null;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-l-4 ${styles.border} p-5`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-gray-900 text-base">{paramName}</span>
        <span className={`w-3 h-3 rounded-full ${styles.dot} shrink-0`} />
      </div>

      {/* Value */}
      <div className="mb-1">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
        <span className="ml-1.5 text-sm text-gray-500">{unit}</span>
      </div>

      {/* WHO range */}
      <p className="text-xs text-gray-400 mb-3">WHO: {whoRange}</p>

      {/* Contextualizing line */}
      <p className="text-sm text-gray-500 leading-relaxed mb-3">
        {contextualizingLine}
      </p>

      {/* Learn more */}
      {deeper && (
        <>
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none"
          >
            {expanded ? "Show less ▴" : "Learn more ▾"}
          </button>

          {expanded && (
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              {deeper}
            </p>
          )}
        </>
      )}
    </div>
  );
}
