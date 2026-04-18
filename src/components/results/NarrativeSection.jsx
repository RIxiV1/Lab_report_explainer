import { useState, useEffect } from "react";
import { TIMELINE_ORDER, FERTIQ_URL } from "../../lib/constants";
import { getActions, saveActions } from "../../lib/resultStore";
import { t } from "../../lib/i18n";

export default function NarrativeSection({ snippet, result, fmCode, lang }) {
  const [checkedActions, setCheckedActions] = useState({});

  useEffect(() => {
    if (!fmCode) return;
    setCheckedActions(getActions(fmCode));
  }, [fmCode]);

  function toggleAction(timeline, index) {
    const key = `${timeline}-${index}`;
    setCheckedActions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (fmCode) saveActions(fmCode, next);
      return next;
    });
  }

  const actionGroups = {};
  TIMELINE_ORDER.forEach((tl) => (actionGroups[tl] = []));
  (snippet?.actions || []).forEach((a) => {
    const key = a.timeline || "Immediate";
    if (!actionGroups[key]) actionGroups[key] = [];
    actionGroups[key].push(a);
  });

  return (
    <div className="content-container-narrow">
      {/* "Normal but not conceiving" callout */}
      {snippet?.notConceivingNote && (
        <section className="mb-14">
          <div className="p-6 border-l-[3px] border-brand-500 bg-brand-50/60">
            <p className="text-[11px] uppercase tracking-wider font-bold text-brand-800 mb-2">Still not conceiving?</p>
            <p className="text-[14px] text-gray-800 leading-relaxed">{snippet.notConceivingNote}</p>
          </div>
        </section>
      )}

      {/* Next Steps timeline with progress bar */}
      {snippet?.actions?.length > 0 && (
        <section className="mb-14">
          <div className="flex items-end justify-between mb-5 flex-wrap gap-2">
            <h2 className="font-serif text-[24px] font-bold text-gray-900 tracking-tight leading-none">{t(lang, "section_next_steps")}</h2>
            {(() => {
              const total = snippet.actions.length;
              const done = Object.values(checkedActions).filter(Boolean).length;
              if (total === 0) return null;
              return (
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-brand-900/40 font-bold uppercase tracking-widest">Progress</span>
                    <span className="text-[10px] text-brand-900 font-bold tabular-nums">{Math.round((done / total) * 100)}%</span>
                  </div>
                  <div className="w-[120px] h-[3px] bg-brand-900/5 overflow-hidden rounded-full">
                    <div
                      className="h-full transition-all duration-700 cubic-bezier(0.2, 0, 0, 1)"
                      style={{
                        width: `${(done / total) * 100}%`,
                        background: done === total ? '#8BB992' : '#36458E',
                      }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="card-tonal overflow-hidden">
            {TIMELINE_ORDER.map((timeline, index) => {
              const items = actionGroups[timeline];
              if (!items?.length) return null;
              return (
                <div key={timeline} style={index > 0 ? { borderTop: '1px solid rgba(198,197,210,0.12)' } : undefined}>
                  <div className="bg-surface-mid px-5 py-2" style={{ borderBottom: '1px solid rgba(198,197,210,0.08)' }}>
                    <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500">{timeline}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    {items.map((action, i) => {
                      const key = `${timeline}-${i}`;
                      const checked = !!checkedActions[key];
                      return (
                        <div key={i} className={`flex gap-3 items-start ${checked ? "opacity-30" : ""}`} style={{ transition: 'opacity 0.3s' }}>
                          <button
                            type="button" onClick={() => toggleAction(timeline, i)}
                            className={`no-print w-[18px] h-[18px] shrink-0 mt-0.5 flex items-center justify-center cursor-pointer ${checked ? "bg-brand-500" : "bg-white"}`}
                            style={{ border: checked ? '1.5px solid #36458E' : '1.5px solid rgba(198,197,210,0.4)' }}
                          >
                            {checked && <span className="text-white text-[10px] leading-none">✓</span>}
                          </button>
                          <p className={`text-[13px] leading-relaxed text-gray-800 flex-1 ${checked ? "line-through" : ""}`}>{action.action}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* FertiQ card */}
      {snippet?.actions?.some((a) => a.fertiQ) && (
        <section className="mb-14 no-print">
          <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 card-tonal !bg-gradient-to-br from-[#FAF7F1] to-[#F4EDE0] border-none">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-900/30 mb-2">Clinical Supplement</p>
              <p className="font-serif text-[24px] font-bold text-gray-900 mb-2 leading-tight">FertiQ by ForMen Health</p>
              <p className="text-[14px] text-gray-600 max-w-[480px] leading-relaxed font-medium">
                {snippet.fertiQContext || "A daily fertility supplement with CoQ10, zinc, and antioxidants. Built to support the lifestyle steps above — not replace medical care."}
              </p>
            </div>
            <a href={FERTIQ_URL} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0 !py-3.5 !px-8">Get FertiQ</a>
          </div>
        </section>
      )}
    </div>
  );
}
