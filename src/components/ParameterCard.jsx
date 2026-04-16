import { useState, memo } from "react";

const DEEPER = {
  spermCount: "How many sperm are in each millilitre of your sample. Healthy is 16 million or more (WHO 2021).",
  motility: "How many sperm are actually swimming. Healthy is 42% or more in total (WHO 2021).",
  morphology: "How many sperm have a normal shape under the microscope. Even 4% counts as normal — sperm rarely look 'textbook perfect'. Important: this only tells us about sperm shape. It does NOT predict whether a baby will have any health issues.",
  volume: "The total amount of semen in one sample. Reflects fluid from the prostate and seminal vesicles.",
  pH: "How acidic or alkaline the sample is. Semen is naturally a little alkaline (7.2 or higher) to protect the sperm.",
  wbc: "Pus cells in semen. If raised (1 million per mL or more), it can be a sign of inflammation or infection.",
};

const STATUS_BORDER = {
  NORMAL:   "status-border-normal",
  WARNING:  "status-border-warning",
  CRITICAL: "status-border-critical",
};

// Per-status tonal wash + status-word colour. Wash kept ≤ 5% opacity
// so the value text contrast still passes WCAG AA. Status word uses
// the same hue as the top stripe for visual unity.
const STATUS_WASH = {
  NORMAL:   { bg: "rgba(139,185,146,0.04)",  word: "text-wellness-800" },
  WARNING:  { bg: "rgba(255,184,0,0.05)",    word: "text-yellow-800" },
  CRITICAL: { bg: "rgba(154,74,45,0.05)",    word: "text-orange-700" },
};

const STATUS_WORD = {
  NORMAL:   "in range",
  WARNING:  "watch",
  CRITICAL: "needs focus",
};

export default memo(function ParameterCard({ paramKey, paramName, value, unit, whoRange, status, contextualizingLine }) {
  const [expanded, setExpanded] = useState(false);
  const borderTop = STATUS_BORDER[status] || STATUS_BORDER.NORMAL;
  const wash = STATUS_WASH[status] || STATUS_WASH.NORMAL;
  const statusWord = STATUS_WORD[status];
  const deeper = DEEPER[paramKey] || null;
  const deeperId = `${paramKey}-deeper`;

  return (
    <div
      className={`card-tonal ${borderTop} p-6 flex flex-col group relative`}
      style={{ background: wash.bg, boxShadow: '0 24px 48px rgba(22,29,30,0.06), 0 1px 0 rgba(17,24,82,0.04)' }}
    >
      {/* Header — name + status as italic serif annotation (medical-journal style, not a chip) */}
      <div className="mb-1 flex items-baseline gap-2 flex-wrap">
        <p className="text-[14px] font-bold tracking-wide text-gray-900 leading-none">{paramName}</p>
        {status !== "NORMAL" && statusWord && (
          <span className={`font-serif italic text-[12px] ${wash.word} leading-none`}>
            {statusWord}
          </span>
        )}
      </div>

      {/* WHO range — small, subdued */}
      <p className="text-[11px] text-gray-500 font-medium mb-5">{whoRange}</p>

      {/* Hero number — bigger, with units as marginalia (small italic gray) */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="font-serif text-[clamp(44px,9vw,60px)] text-brand-900 font-bold leading-none tracking-tight tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-[10px] italic text-gray-400 font-normal ml-1 tracking-wide">
            {unit}
          </span>
        )}
      </div>

      <p className="text-[13px] text-gray-600 leading-relaxed mb-6 flex-1">
        {contextualizingLine || "Everything looks good here."}
      </p>

      {deeper && (
        <div className="pt-3 mt-auto" style={{ borderTop: '1px solid rgba(198, 197, 210, 0.15)' }}>
          <button
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
            aria-controls={deeperId}
            className="text-[11px] uppercase tracking-wider font-bold text-brand-500 flex items-center gap-2 hover:text-brand-800 transition-colors cursor-pointer bg-transparent border-none"
            style={{ transition: 'all 0.2s cubic-bezier(0.2,0,0,1)' }}
          >
            <span className="w-5 h-5 bg-surface-high text-neutral-400 flex items-center justify-center text-[11px] font-serif italic">
              {expanded ? "×" : "i"}
            </span>
            {expanded ? "Hide" : "What it means"}
          </button>

          {/* Inline reveal — animates within the card. The grid uses
              items-start so neighbouring cards aren't stretched when
              this expands. */}
          {expanded && (
            <div
              id={deeperId}
              className="mt-4 pt-4 animate-editorial"
              style={{ borderTop: '1px solid rgba(198, 197, 210, 0.2)' }}
            >
              <p className="text-[13px] text-neutral-700 leading-[1.7]">{deeper}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
