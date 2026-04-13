import { useState, useEffect } from "react";
import Nav from "./Nav";

const tips = [
  "Did you know? Morphology is the most commonly misread value in semen reports.",
  "Sperm parameters naturally fluctuate. One test is never the full picture.",
  "1 in 7 couples face fertility challenges. You are not alone.",
  "Your FM Code is being created. Save it to return to these results anytime.",
];

const steps = [
  { label: "Comparing against WHO 2021 reference ranges", threshold: 20 },
  { label: "Identifying your primary findings", threshold: 50 },
  { label: "Generating your personalised next steps", threshold: 80 },
];

const DURATION_MS = 3500;

export default function ProcessingScreen({ onComplete, onBack }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();

    const tipTimer = setInterval(() => {
      setTipIndex((p) => (p + 1) % tips.length);
    }, 1500);

    const progressTimer = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / DURATION_MS) * 100, 100);
      setProgress(pct);
    }, 50);

    const doneTimer = setTimeout(() => onComplete?.(), DURATION_MS);

    return () => {
      clearInterval(tipTimer);
      clearInterval(progressTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-[#F4FAFB] flex flex-col">
      <Nav>
        <button onClick={onBack} className="btn-secondary px-3.5 py-[7px]">&larr; Go back</button>
      </Nav>

      {/* Progress bar — editorial thin line */}
      <div className="h-[2px] bg-[#E3E9EA]">
        <div
          className="h-full transition-[width] duration-100 ease-linear"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #36458E, #111852)',
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="text-center max-w-[440px] animate-editorial">
          <h2 className="font-serif text-[22px] font-bold text-gray-900 mb-2">Analysing your report…</h2>
          <p className="text-sm text-gray-400 mb-10">This only takes a moment.</p>

          {/* Tip card — whisper shadow */}
          <div className="card-tonal p-5 mb-8">
            <p key={tipIndex} className="text-[15px] text-gray-600 leading-relaxed animate-editorial">
              💡 {tips[tipIndex]}
            </p>
          </div>

          {/* Steps */}
          <div className="text-left inline-block">
            {steps.map((step, i) => {
              const done = progress > step.threshold;
              return (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <div
                    className="w-5 h-5 flex-shrink-0 flex items-center justify-center transition-all duration-300"
                    style={{
                      background: done
                        ? 'linear-gradient(135deg, #36458E, #111852)'
                        : '#E3E9EA',
                      boxShadow: done ? '0 4px 12px rgba(54,69,142,0.2)' : 'none',
                    }}
                  >
                    {done && <span className="text-white text-[11px] leading-none">✓</span>}
                  </div>
                  <span
                    className={`text-[13px] transition-all duration-300 ${
                      done ? "text-brand-600 font-medium" : "text-gray-300"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Skip */}
          <button
            onClick={() => onComplete?.()}
            className="mt-6 bg-transparent border-none cursor-pointer text-[13px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip →
          </button>
        </div>
      </div>
    </div>
  );
}
