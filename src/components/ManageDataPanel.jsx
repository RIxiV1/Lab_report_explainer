import { useState, useEffect, useMemo } from "react";
import { getStorageStats, wipeAllData } from "../lib/resultStore";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date) {
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export default function ManageDataPanel({ onClose, onDataWiped }) {
  const [confirming, setConfirming] = useState(false);
  const [wiped, setWiped] = useState(false);
  const stats = useMemo(() => getStorageStats(), [wiped]);

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

  function handleWipe() {
    wipeAllData();
    setWiped(true);
    setConfirming(false);
    if (onDataWiped) onDataWiped();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-brand-900/60 backdrop-blur-[8px]" />
      <div
        className="relative bg-white p-8 max-w-[440px] w-full animate-editorial whisper-shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-semibold uppercase tracking-clinical text-neutral-400 mb-3">Your data</p>
        <h2 className="font-serif text-[22px] font-bold text-gray-900 mb-5 leading-tight">
          Manage what's stored on this phone
        </h2>

        {wiped ? (
          <>
            <p className="text-[14px] text-gray-700 leading-relaxed mb-6">
              All your reports have been deleted from this phone.
            </p>
            <button
              onClick={onClose}
              className="btn-primary px-5 py-2.5 text-[11px]"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <div className="bg-[#EFF5F6] p-4 mb-5 space-y-2.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-gray-500 uppercase tracking-wide">Reports stored</span>
                <span className="font-serif text-[20px] font-bold text-gray-900 tabular-nums">{stats.resultCount}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-gray-500 uppercase tracking-wide">Oldest</span>
                <span className="text-[13px] text-gray-800">{formatDate(stats.oldestDate)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-gray-500 uppercase tracking-wide">Newest</span>
                <span className="text-[13px] text-gray-800">{formatDate(stats.newestDate)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-gray-500 uppercase tracking-wide">Space used</span>
                <span className="text-[13px] text-gray-800 tabular-nums">{formatBytes(stats.approxBytes)}</span>
              </div>
            </div>

            <p className="text-[12px] text-gray-600 leading-relaxed mb-5">
              All your reports are saved only on this phone. Nothing was ever uploaded.
              Reports older than 6 months are auto-deleted.
            </p>

            {confirming ? (
              <div className="p-4 bg-orange-50 border-l-[3px] border-orange-500 mb-5">
                <p className="text-[13px] font-semibold text-gray-900 mb-1">Delete everything?</p>
                <p className="text-[12px] text-gray-700 leading-relaxed mb-3">
                  This removes all your reports, drafts and progress from this phone. It can't be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleWipe}
                    className="bg-orange-600 text-white text-[11px] font-semibold uppercase tracking-wide px-4 py-2 cursor-pointer hover:bg-orange-700 transition-colors"
                  >
                    Yes, delete all
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="text-[11px] text-gray-600 uppercase tracking-wide font-semibold cursor-pointer bg-transparent border-none hover:text-gray-900 transition-colors px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setConfirming(true)}
                  disabled={stats.resultCount === 0 && stats.approxBytes === 0}
                  className="text-[11px] text-orange-700 hover:text-orange-900 uppercase tracking-wide font-semibold cursor-pointer bg-transparent border-none disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Delete all my data
                </button>
                <button
                  onClick={onClose}
                  className="text-[11px] text-neutral-400 uppercase tracking-wide font-semibold cursor-pointer bg-transparent border-none hover:text-neutral-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
