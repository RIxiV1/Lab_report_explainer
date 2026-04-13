import { useState, memo } from "react";
import { suggestions } from "../lib/suggestions";

const TAB_STYLES = {
  Food:                  { active: "bg-wellness-100 text-wellness-800 font-bold", inactive: "bg-transparent text-gray-500" },
  Supplements:           { active: "bg-brand-50 text-brand-800 font-bold",        inactive: "bg-transparent text-gray-500" },
  "Tests When Required": { active: "bg-purple-50 text-purple-700 font-bold",      inactive: "bg-transparent text-gray-500" },
};

const ITEM_STYLES = {
  Food:                  { openBg: "bg-wellness-100",   closedBg: "bg-white" },
  Supplements:           { openBg: "bg-brand-50",       closedBg: "bg-white" },
  "Tests When Required": { openBg: "bg-purple-50",      closedBg: "bg-white" },
};

// Score-based specialist routing.
// Research from the earlier UX analysis: users want a clear next-step
// recommendation rather than having to interpret their score themselves.
function getRoutingGuidance(score) {
  if (score == null) return null;
  if (score >= 75) {
    return {
      label: "Optimise and maintain",
      text: "Lifestyle optimisation is your strongest next step. Small, consistent changes over 90 days keep your numbers trending upward.",
      accent: "bg-wellness-100 text-wellness-800",
    };
  }
  if (score >= 50) {
    return {
      label: "Consider a specialist visit",
      text: "Consider consulting a fertility specialist within the next 3 months. Lifestyle changes combined with targeted support often show meaningful results within a 90-day sperm cycle.",
      accent: "bg-yellow-50 text-yellow-800",
    };
  }
  return {
    label: "Specialist visit recommended soon",
    text: "We recommend seeing a reproductive urologist soon. Most causes at this level are treatable — and a specialist can identify the right path for your situation quickly.",
    accent: "bg-orange-50 text-orange-800",
  };
}

export default memo(function AndrologistSection({ verdict, fertilityIndex }) {
  const showTests = verdict === "ATTENTION" || verdict === "ACT_NOW";
  const visibleSuggestions = showTests ? suggestions : suggestions.filter((s) => s.category !== "Tests When Required");
  const [openCategory, setOpenCategory] = useState(0);
  const [openItem, setOpenItem] = useState(null);
  const routing = getRoutingGuidance(fertilityIndex?.score);

  return (
    <section id="andrologist-section" className="max-w-[780px] mx-auto px-6 py-20 text-gray-900 scroll-mt-28">
      {/* Header */}
      <div className="mb-10">
        <p className="label-clinical mb-3">What Helps</p>
        <h2 className="font-serif text-[28px] font-bold mb-4 leading-tight text-gray-900">
          Improve Your Numbers
        </h2>
        <p className="text-[14px] leading-relaxed text-gray-500 max-w-[560px]">
          Clinical-evidence-backed foods, supplements, and tests that support
          male fertility. Small, consistent changes over 90 days make a real difference.
        </p>
      </div>

      {/* Score-based routing banner */}
      {routing && (
        <div className={`${routing.accent} p-6 mb-10 whisper-shadow-sm`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 opacity-80">
            {routing.label}
          </p>
          <p className="text-[14px] leading-relaxed">
            {routing.text}
          </p>
        </div>
      )}

      {/* Category Tabs — square, tonal */}
      <div className="flex gap-[1px] bg-[#E3E9EA] mb-8" role="tablist" aria-label="Recommendation categories">
        {visibleSuggestions.map((cat, catIdx) => {
          const isActive = openCategory === catIdx;
          const styles = TAB_STYLES[cat.category] || TAB_STYLES.Food;
          return (
            <button
              key={catIdx}
              role="tab"
              aria-selected={isActive}
              onClick={() => { setOpenCategory(catIdx); setOpenItem(null); }}
              className={`flex items-center gap-2 px-5 py-3 text-[12px] uppercase tracking-wide cursor-pointer transition-all flex-1 justify-center ${
                isActive ? styles.active : styles.inactive
              }`}
              style={{ border: 'none' }}
            >
              <span className="text-base">{cat.icon}</span>
              {cat.category}
            </button>
          );
        })}
      </div>

      {/* Active Category Items */}
      {visibleSuggestions.map((cat, catIdx) => {
        if (catIdx !== openCategory) return null;
        const itemStyle = ITEM_STYLES[cat.category] || ITEM_STYLES.Food;
        return (
          <div key={catIdx} role="tabpanel" className="flex flex-col gap-[1px] bg-[#E3E9EA] whisper-shadow-sm">
            {cat.items.map((item, itemIdx) => {
              const key = `${catIdx}-${itemIdx}`;
              const isOpen = openItem === key;
              return (
                <div
                  key={itemIdx}
                  className={`overflow-hidden transition-all ${
                    isOpen ? itemStyle.openBg : itemStyle.closedBg
                  }`}
                >
                  <button
                    onClick={() => setOpenItem(isOpen ? null : key)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center gap-3 p-5 border-none bg-transparent cursor-pointer text-left"
                  >
                    <span className={`text-sm text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}>
                      &#9654;
                    </span>
                    <span className="font-semibold text-[15px] text-gray-900 flex-1">
                      {item.name}
                    </span>
                    {item.dosage && (
                      <span className="text-[10px] font-bold bg-brand-50 text-brand-700 px-2.5 py-0.5 whitespace-nowrap uppercase tracking-wide">
                        {item.dosage}
                      </span>
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pl-12 text-sm leading-relaxed text-gray-700">
                      <p className="mb-3">
                        <strong className="text-gray-900">Why it helps:</strong> {item.plain}
                      </p>

                      {item.examples && (
                        <p className="mb-3">
                          <strong className="text-gray-900">Best sources:</strong> {item.examples}
                        </p>
                      )}
                      {item.tip && (
                        <p className="mb-3 bg-white p-4 text-[13px]" style={{ border: '1px solid rgba(198,197,210,0.15)' }}>
                          <strong className="text-gray-900">Tip:</strong> {item.tip}
                        </p>
                      )}

                      {item.dosage && (
                        <p className="mb-3">
                          <strong className="text-gray-900">Suggested dosage:</strong> {item.dosage}
                        </p>
                      )}
                      {item.evidence && (
                        <p className="mb-3 bg-white p-4 text-[13px]" style={{ border: '1px solid rgba(198,197,210,0.15)' }}>
                          <strong className="text-gray-900">Evidence:</strong> {item.evidence}
                        </p>
                      )}
                      {item.source && (
                        <p className="mb-0 text-[11px] text-gray-400 italic leading-snug">
                          <strong>Source:</strong> {item.source}{" "}
                          {item.sourceId && <span className="text-brand-600 not-italic font-semibold">[{item.sourceId}]</span>}
                        </p>
                      )}

                      {item.when && (
                        <p className="mb-3">
                          <strong className="text-gray-900">When it's needed:</strong> {item.when}
                        </p>
                      )}
                      {item.cost && (
                        <p className="mb-0">
                          <strong className="text-gray-900">Estimated cost:</strong> {item.cost}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Disclaimer */}
      <p className="text-[13px] text-gray-400 leading-relaxed mt-10 mb-6">
        These suggestions are based on published research and WHO guidelines.
        Individual needs vary — always consult a qualified doctor before starting
        supplements or ordering tests.
      </p>

      <a
        href="https://www.formen.health/pages/book-doctor-appointment"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-block no-underline"
      >
        Book a Free Doctor Consultation &rarr;
      </a>
    </section>
  );
});
