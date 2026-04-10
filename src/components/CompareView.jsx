import { useState } from "react";
import { useFMCode } from "../hooks/useFMCode";
import { PARAM_ORDER, PARAM_META, FM_CODE_REGEX, STATUS_CONFIG, STATUS_LABELS, STATUS_RANK } from "../lib/constants";
import Nav from "./Nav";

function getDelta(oldVal, newVal, higherBetter) {
  if (oldVal == null || newVal == null) return null;
  const diff = newVal - oldVal;
  if (diff === 0) return { label: "No change", color: "text-gray-400" };
  const pct = oldVal !== 0 ? Math.abs((diff / oldVal) * 100).toFixed(0) : "—";
  const arrow = diff > 0 ? "↑" : "↓";
  let color = "text-gray-400";
  if (higherBetter === true) color = diff > 0 ? "text-green-700" : "text-red-700";
  else if (higherBetter === false) color = diff < 0 ? "text-green-700" : "text-red-700";
  return { label: `${arrow} ${pct}%`, color };
}

export default function CompareView({ onBack, initialCode }) {
  const { loadResult } = useFMCode();
  const [codeA, setCodeA] = useState(initialCode || "");
  const [codeB, setCodeB] = useState("");
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
    if (!loadCode(codeA, setResultA)) return;
    loadCode(codeB, setResultB);
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
    <div className="min-h-screen bg-cream">
      <Nav>
        <button onClick={onBack} className="btn-secondary px-3.5 py-[7px]">&larr; Back to Report</button>
      </Nav>

      <div className="max-w-[600px] mx-auto px-5 pt-9 pb-20">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Compare Two Reports</h1>
        <p className="text-sm text-gray-500 mb-7 leading-relaxed">
          Enter two FM codes to see how your numbers have changed.
        </p>

        {/* Code Inputs */}
        <div className="flex flex-col gap-3 mb-5">
          {[
            { label: "Older Report", value: codeA, setter: setCodeA },
            { label: "Newer Report", value: codeB, setter: setCodeB },
          ].map((input) => (
            <div key={input.label}>
              <label className="text-xs font-semibold text-gray-400 block mb-1.5">{input.label}</label>
              <input
                type="text"
                placeholder="FM-XXXX-XXXX"
                value={input.value}
                onChange={(e) => { input.setter(e.target.value); setError(""); }}
                className="w-full border-[1.5px] border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white tracking-wider uppercase box-border focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
                aria-label={`${input.label} FM Code`}
              />
            </div>
          ))}
        </div>

        {error && <p role="alert" className="text-[13px] text-red-500 mb-4">{error}</p>}

        <button onClick={handleCompare} className="btn-primary px-7 py-3 text-sm mb-8">
          Compare Reports
        </button>

        {hasResults && (
          <>
            {/* Summary Badges */}
            <div className="flex gap-3 flex-wrap mb-5">
              {improvedCount > 0 && (
                <div className="bg-green-100 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-green-700">
                  {improvedCount} improved
                </div>
              )}
              {declinedCount > 0 && (
                <div className="bg-red-100 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-red-700">
                  {declinedCount} declined
                </div>
              )}
              {improvedCount === 0 && declinedCount === 0 && (
                <div className="bg-gray-100 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-gray-500">
                  No status changes
                </div>
              )}
            </div>

            {/* Parameter Comparison Cards */}
            <div className="flex flex-col gap-3">
              {PARAM_ORDER.map((key) => {
                const meta = PARAM_META[key];
                const pA = resultA.parameters[key];
                const pB = resultB.parameters[key];
                if (!pA || !pB) return null;
                const delta = getDelta(pA.value, pB.value, meta.higherBetter);
                const cfgA = STATUS_CONFIG[pA.status];
                const cfgB = STATUS_CONFIG[pB.status];

                return (
                  <div key={key} className="card rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{meta.label}</div>
                        {meta.unit && <div className="text-[11px] text-gray-400">{meta.unit}</div>}
                      </div>
                      {delta && (
                        <span className={`text-[15px] font-bold ${delta.color}`}>{delta.label}</span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1 bg-cream rounded-xl p-2.5 text-center">
                        <div className="text-[11px] text-gray-400 mb-1">Before</div>
                        <div className="text-xl font-extrabold text-gray-900">{pA.value}</div>
                        <div className="mt-1.5">
                          <span className={`text-[10px] font-semibold ${cfgA.badgeBg} ${cfgA.badgeText} px-2 py-0.5 rounded-full`}>
                            {STATUS_LABELS[pA.status]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-300">&rarr;</div>
                      <div className="flex-1 bg-cream rounded-xl p-2.5 text-center">
                        <div className="text-[11px] text-gray-400 mb-1">After</div>
                        <div className="text-xl font-extrabold text-gray-900">{pB.value}</div>
                        <div className="mt-1.5">
                          <span className={`text-[10px] font-semibold ${cfgB.badgeBg} ${cfgB.badgeText} px-2 py-0.5 rounded-full`}>
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
