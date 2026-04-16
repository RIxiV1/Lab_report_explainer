import { useState } from "react";
import { loadResult } from "../lib/resultStore";
import { PARAM_ORDER, PARAM_META, FM_CODE_REGEX, STATUS_CONFIG, STATUS_LABELS, STATUS_RANK } from "../lib/constants";
import Nav from "./Nav";

function getDelta(oldVal, newVal, higherBetter) {
  if (oldVal == null || newVal == null) return null;
  const diff = newVal - oldVal;
  if (diff === 0) return { label: "No change", color: "text-gray-500" };
  const arrow = diff > 0 ? "↑" : "↓";
  const label = oldVal !== 0
    ? `${arrow} ${Math.abs((diff / oldVal) * 100).toFixed(0)}%`
    : `${arrow} ${Math.abs(diff).toFixed(1)}`; // fall back to absolute delta when pct is undefined
  let color = "text-gray-500";
  if (higherBetter === true) color = diff > 0 ? "text-green-700" : "text-red-700";
  else if (higherBetter === false) color = diff < 0 ? "text-green-700" : "text-red-700";
  return { label, color };
}

export default function CompareView({ onBack, onLogoClick, initialCode }) {
  // codeA = older report (user types this in)
  // codeB = newer report (pre-filled with current session's code)
  const [codeA, setCodeA] = useState("");
  const [codeB, setCodeB] = useState(initialCode || "");
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [error, setError] = useState("");

  function loadCode(code, setter) {
    const trimmed = code.trim().toUpperCase();
    if (!FM_CODE_REGEX.test(trimmed)) {
      setError(`Invalid code format: ${code}`);
      return false;
    }
    const stored = loadResult(trimmed);
    if (!stored) {
      setError(`No results found for ${trimmed}. Results are stored on this device only.`);
      return false;
    }
    setter(stored.result);
    setError("");
    return true;
  }

  function handleCompare() {
    setError("");
    setResultA(null);
    setResultB(null);
    if (!loadCode(codeA, setResultA)) return;
    if (!loadCode(codeB, setResultB)) return;
  }

  const hasResults = resultA && resultB;

  const improvedCount = hasResults
    ? PARAM_ORDER.filter((key) => {
        const a = resultA.parameters[key], b = resultB.parameters[key];
        return a && b && STATUS_RANK[b.status] > STATUS_RANK[a.status];
      }).length
    : 0;

  const declinedCount = hasResults
    ? PARAM_ORDER.filter((key) => {
        const a = resultA.parameters[key], b = resultB.parameters[key];
        return a && b && STATUS_RANK[b.status] < STATUS_RANK[a.status];
      }).length
    : 0;

  return (
    <div className="min-h-screen bg-[#F4FAFB]">
      <Nav onLogoClick={onLogoClick}>
        <button onClick={onBack} className="btn-secondary px-3.5 py-[7px]">&larr; Back to Report</button>
      </Nav>

      <div className="max-w-[600px] mx-auto px-6 pt-16 pb-24 animate-editorial">
        <h1 className="font-serif text-[clamp(28px,6vw,40px)] font-bold text-gray-900 mb-3 tracking-tight">Compare Two Reports</h1>
        <p className="text-[14px] text-gray-500 mb-10 leading-relaxed">
          Enter two FM codes from reports saved on this device.
          Comparison works only across reports analysed on the same browser.
        </p>

        {/* Code Inputs — editorial underline style */}
        <div className="flex flex-col gap-5 mb-6">
          {[
            { label: "Older Report", value: codeA, setter: setCodeA },
            { label: "Newer Report", value: codeB, setter: setCodeB },
          ].map((input) => (
            <div key={input.label}>
              <label className="label-clinical block mb-2">{input.label}</label>
              <input
                type="text"
                placeholder="FM-XXXX-XXXX"
                value={input.value}
                onChange={(e) => { input.setter(e.target.value); setError(""); }}
                className="w-full bg-transparent px-0 py-2.5 text-sm tracking-wider uppercase box-border focus:outline-none border-b-2 border-neutral-300/30 focus:border-brand-500 transition-colors"
                aria-label={`${input.label} FM Code`}
              />
            </div>
          ))}
        </div>

        {error && <p role="alert" aria-live="polite" className="text-[13px] text-orange-600 mb-4">{error}</p>}

        <button onClick={handleCompare} className="btn-primary px-7 py-3 mb-12">
          Compare Reports
        </button>

        {hasResults && (
          <>
            {/* Summary Badges */}
            <div className="flex gap-3 flex-wrap mb-8">
              {improvedCount > 0 && (
                <div className="bg-wellness-100 px-3.5 py-1.5 text-[13px] font-semibold text-wellness-800">
                  {improvedCount} improved
                </div>
              )}
              {declinedCount > 0 && (
                <div className="bg-red-100 px-3.5 py-1.5 text-[13px] font-semibold text-red-700">
                  {declinedCount} declined
                </div>
              )}
              {improvedCount === 0 && declinedCount === 0 && (
                <div className="bg-[#E3E9EA] px-3.5 py-1.5 text-[13px] font-semibold text-gray-500">
                  No status changes
                </div>
              )}
            </div>

            {/* Parameter Comparison Cards */}
            <div className="flex flex-col gap-[1px] bg-[#E3E9EA]">
              {PARAM_ORDER.map((key) => {
                const meta = PARAM_META[key];
                const pA = resultA.parameters[key];
                const pB = resultB.parameters[key];
                if (!pA || !pB) return null;
                const delta = getDelta(pA.value, pB.value, meta.higherBetter);
                const cfgA = STATUS_CONFIG[pA.status];
                const cfgB = STATUS_CONFIG[pB.status];

                return (
                  <div key={key} className="card-tonal p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{meta.label}</div>
                        {meta.unit && <div className="text-[11px] text-gray-500">{meta.unit}</div>}
                      </div>
                      {delta && (
                        <span className={`text-[15px] font-bold ${delta.color}`}>{delta.label}</span>
                      )}
                    </div>

                    <div className="flex gap-[1px] bg-[#E3E9EA]">
                      <div className="flex-1 bg-[#EFF5F6] p-3 text-center">
                        <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Before</div>
                        <div className="font-serif text-xl font-bold text-gray-900">{pA.value}</div>
                        <div className="mt-2">
                          <span className={`text-[10px] font-semibold ${cfgA.badgeBg} ${cfgA.badgeText} px-2 py-0.5`}>
                            {STATUS_LABELS[pA.status]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-300 px-2">&rarr;</div>
                      <div className="flex-1 bg-[#EFF5F6] p-3 text-center">
                        <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">After</div>
                        <div className="font-serif text-xl font-bold text-gray-900">{pB.value}</div>
                        <div className="mt-2">
                          <span className={`text-[10px] font-semibold ${cfgB.badgeBg} ${cfgB.badgeText} px-2 py-0.5`}>
                            {STATUS_LABELS[pB.status]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
