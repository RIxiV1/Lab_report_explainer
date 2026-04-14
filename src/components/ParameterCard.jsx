import { useState, useEffect, memo } from "react";
import { STATUS_CONFIG } from "../lib/constants";

const DEEPER = {
  spermCount: "Sperm concentration tells us how many sperm are available per millilitre. WHO defines ≥16 million/mL as normal.",
  motility: "Motility measures the percentage of sperm that are moving. Total motility ≥42% is considered normal by WHO 2021 standards.",
  morphology: "Morphology uses Kruger strict criteria. Only 4% need to be 'textbook perfect' for a normal classification.",
  volume: "Semen volume reflects secretions from the seminal vesicles and prostate.",
  pH: "pH measures the acidity of semen. Semen is naturally slightly alkaline (≥7.2) to protect sperm.",
  wbc: "White blood cells (pus cells) in semen point to inflammation or infection if elevated (≥1 million/mL).",
};

const STATUS_BORDER = {
  NORMAL:   "status-border-normal",
  WARNING:  "status-border-warning",
  CRITICAL: "status-border-critical",
};

function InfoModal({ paramName, text, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-brand-900/60 backdrop-blur-[8px]" />
      <div
        className="relative bg-white p-8 max-w-[420px] w-full animate-editorial whisper-shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-semibold uppercase tracking-clinical text-neutral-400 mb-3">{paramName}</p>
        <p className="text-[14px] text-neutral-700 leading-[1.8]">{text}</p>
        <button
          onClick={onClose}
          className="mt-6 text-[11px] text-neutral-400 uppercase tracking-wide font-semibold cursor-pointer bg-transparent border-none hover:text-neutral-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default memo(function ParameterCard({ paramKey, paramName, value, unit, whoRange, status, contextualizingLine }) {
  const [showModal, setShowModal] = useState(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NORMAL;
  const borderTop = STATUS_BORDER[status] || STATUS_BORDER.NORMAL;
  const deeper = DEEPER[paramKey] || null;

  return (
    <>
      <div className={`card-tonal ${borderTop} p-6 flex flex-col group`}>
        <p className="text-[14px] font-bold tracking-wide text-gray-900 mb-1 leading-none">{paramName}</p>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] text-gray-500 font-medium">{whoRange}</span>
          {status !== "NORMAL" && (
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${cfg.badgeBg} ${cfg.badgeText}`}>
              {cfg.label}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="font-serif text-[38px] text-brand-900 font-bold leading-none tracking-tight">{value}</span>
          {unit && <span className="text-xs font-semibold text-gray-400 ml-1">{unit}</span>}
        </div>

        <p className="text-[13px] text-gray-600 leading-relaxed mb-6 flex-1">{contextualizingLine || "Everything looks good here."}</p>

        {deeper && (
          <div className="pt-3 mt-auto" style={{ borderTop: '1px solid rgba(198, 197, 210, 0.15)' }}>
            <button
              onClick={() => setShowModal(true)}
              className="text-[11px] uppercase tracking-wider font-bold text-brand-500 flex items-center gap-2 hover:text-brand-800 transition-colors cursor-pointer bg-transparent border-none group-hover:translate-x-0.5"
              style={{ transition: 'all 0.2s cubic-bezier(0.2,0,0,1)' }}
            >
              <span className="w-5 h-5 bg-surface-high text-neutral-400 flex items-center justify-center text-[11px] font-serif italic">i</span>
              What it means
            </button>
          </div>
        )}
      </div>

      {showModal && deeper && (
        <InfoModal paramName={paramName} text={deeper} onClose={() => setShowModal(false)} />
      )}
    </>
  );
});
