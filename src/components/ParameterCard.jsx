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

// Per-status tonal wash + status colour + dot colour. Wash kept ≤ 5%
// opacity so text contrast still passes WCAG AA. The dot is a stronger
// visual signal than italic text alone.
const STATUS_THEME = {
  NORMAL:   { bg: "rgba(139,185,146,0.04)", word: "text-wellness-600", dot: "#8BB992" },
  WARNING:  { bg: "rgba(255,184,0,0.05)",   word: "text-yellow-600",   dot: "#FFB800" },
  CRITICAL: { bg: "rgba(154,74,45,0.05)",   word: "text-orange-600",   dot: "#9A4A2D" },
};

const STATUS_WORD = {
  NORMAL:   "in range",
  WARNING:  "watch",
  CRITICAL: "needs focus",
};

function Sparkline({ paramKey, valueStr, status }) {
  const value = parseFloat(valueStr) || 0;
  let pct = 50;
  let normalStart = 50;
  let normalEnd = 100;
  
  if (paramKey === "spermCount") {
    pct = Math.min(100, (value / 60) * 100);
    normalStart = (16 / 60) * 100;
  } else if (paramKey === "motility") {
    pct = Math.min(100, value);
    normalStart = 42;
  } else if (paramKey === "morphology") {
    pct = Math.min(100, (value / 20) * 100);
    normalStart = (4 / 20) * 100;
  } else if (paramKey === "volume") {
    pct = Math.min(100, (value / 10) * 100);
    normalStart = 14;
    normalEnd = 76;
  } else if (paramKey === "pH") {
    pct = Math.max(0, Math.min(100, ((value - 6) / 3) * 100));
    normalStart = 40;
    normalEnd = 66.6;
  } else if (paramKey === "wbc") {
    pct = Math.min(100, (value / 5) * 100);
    normalStart = 0;
    normalEnd = 20;
  }

  const barColor = status === "NORMAL" ? "#6B8E7B" : status === "WARNING" ? "#D49A36" : "#B85B45";

  return (
    <div className="w-full h-[3px] rounded-full overflow-hidden mb-6 relative bg-brand-900/5">
      <div 
        className="absolute top-0 bottom-0 bg-[#6B8E7B]/10" 
        style={{ left: `${normalStart}%`, width: `${normalEnd - normalStart}%` }} 
      />
      <div 
        className="absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out" 
        style={{ width: `${pct}%`, backgroundColor: barColor }} 
      />
      <div 
        className="absolute top-1/2 w-2 h-2 rounded-full bg-white shadow-sm transition-all duration-1000 ease-out z-10" 
        style={{ left: `calc(${pct}% - 4px)`, transform: "translateY(-50%)", border: `1px solid ${barColor}` }} 
      />
    </div>
  );
}

export default memo(function ParameterCard({ paramKey, paramName, value, unit, whoRange, status, contextualizingLine }) {
  const [expanded, setExpanded] = useState(false);
  const borderTop = STATUS_BORDER[status] || STATUS_BORDER.NORMAL;
  const theme = STATUS_THEME[status] || STATUS_THEME.NORMAL;
  const statusWord = STATUS_WORD[status];
  const deeper = DEEPER[paramKey] || null;
  const deeperId = `${paramKey}-deeper`;

  return (
    <div
      className={`card-soft ${borderTop} p-6 flex flex-col group relative h-full w-full`}
    >
      {/* Header: name + status label (italic serif on right) */}
      <div className="flex items-start justify-between gap-4 mb-1">
        <p className="text-[15px] font-bold text-gray-900 leading-tight">
          {paramName}
        </p>
        {status !== "NORMAL" && statusWord && (
          <span className={`font-serif italic text-[13px] ${theme.word} leading-none shrink-0 translate-y-0.5`}>
            {statusWord}
          </span>
        )}
      </div>

      <p className="text-[11px] text-gray-400 font-medium mb-4">{whoRange}</p>

      {/* Value + unit */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-serif text-[clamp(48px,10vw,64px)] text-brand-900 font-bold leading-none tracking-tight tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-[11px] text-gray-400 font-medium leading-none">
            {unit}
          </span>
        )}
      </div>

      <Sparkline paramKey={paramKey} valueStr={value} status={status} />

      {/* Context line */}
      <p className="text-[13px] text-gray-600 leading-relaxed mb-6">
        {contextualizingLine || "Everything looks good here."}
      </p>

      {/* "i WHAT IT MEANS" button with fluid expansion */}
      {deeper && (
        <div className="mt-auto">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="group/btn flex items-center gap-2.5 cursor-pointer bg-transparent border-none p-0 transition-opacity hover:opacity-80"
          >
            <span className="w-5 h-5 bg-[#EDF1F3] text-[#7A869A] flex items-center justify-center text-[10px] font-serif italic font-bold leading-none">
              i
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">
              {expanded ? "HIDE CONTEXT" : "WHAT IT MEANS"}
            </span>
          </button>

          <div 
            id={deeperId}
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          >
            <div className="overflow-hidden">
              <div className="mt-4 pt-4 border-t border-brand-900/5">
                <p className="text-[12.5px] text-gray-700 leading-relaxed italic">
                  {deeper}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
