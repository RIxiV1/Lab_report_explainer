import { useState, memo } from "react";
import { suggestions } from "../lib/suggestions";

const TAB_STYLES = {
  Food:                  { active: "border-green-300 bg-green-50 text-green-700 font-bold", inactive: "border-gray-200 bg-white text-gray-500" },
  Supplements:           { active: "border-teal-300 bg-teal-50 text-teal-700 font-bold",   inactive: "border-gray-200 bg-white text-gray-500" },
  "Tests When Required": { active: "border-purple-300 bg-purple-50 text-purple-700 font-bold", inactive: "border-gray-200 bg-white text-gray-500" },
};

const ITEM_STYLES = {
  Food:                  { openBorder: "border-green-600", openBg: "bg-green-50",   closedBorder: "border-gray-200" },
  Supplements:           { openBorder: "border-teal-600",  openBg: "bg-teal-50",    closedBorder: "border-gray-200" },
  "Tests When Required": { openBorder: "border-purple-600", openBg: "bg-purple-50", closedBorder: "border-gray-200" },
};

export default memo(function AndrologistSection({ verdict }) {
  const showTests = verdict === "ATTENTION" || verdict === "ACT_NOW";
  const visibleSuggestions = showTests ? suggestions : suggestions.filter((s) => s.category !== "Tests When Required");
  const [openCategory, setOpenCategory] = useState(0);
  const [openItem, setOpenItem] = useState(null);

  return (
    <section id="andrologist-section" className="max-w-[780px] mx-auto px-5 py-12 text-gray-900 scroll-mt-28">
      {/* Header */}
      <div className="mb-9">
        <h2 className="text-[28px] font-bold mb-2.5 leading-tight text-gray-900">
          What Can Help Improve Your Numbers
        </h2>
        <p className="text-[15px] leading-relaxed text-gray-500">
          Based on clinical evidence — here are the foods, supplements, and tests
          that can support your fertility. Small, consistent changes over 90 days
          can make a real difference.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2.5 mb-7 flex-wrap" role="tablist" aria-label="Recommendation categories">
        {visibleSuggestions.map((cat, catIdx) => {
          const isActive = openCategory === catIdx;
          const styles = TAB_STYLES[cat.category] || TAB_STYLES.Food;
          return (
            <button
              key={catIdx}
              role="tab"
              aria-selected={isActive}
              onClick={() => { setOpenCategory(catIdx); setOpenItem(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-[1.5px] text-sm cursor-pointer transition-all ${
                isActive ? styles.active : styles.inactive
              }`}
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
        const itemStyles = ITEM_STYLES[cat.category] || ITEM_STYLES.Food;
        return (
          <div key={catIdx} role="tabpanel" className="flex flex-col gap-2.5">
            {cat.items.map((item, itemIdx) => {
              const key = `${catIdx}-${itemIdx}`;
              const isOpen = openItem === key;
              return (
                <div
                  key={itemIdx}
                  className={`border rounded-xl overflow-hidden transition-all ${
                    isOpen ? `${itemStyles.openBorder} ${itemStyles.openBg}` : `${itemStyles.closedBorder} bg-white`
                  }`}
                >
                  <button
                    onClick={() => setOpenItem(isOpen ? null : key)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center gap-2.5 p-4 border-none bg-transparent cursor-pointer text-left"
                  >
                    <span className={`text-sm text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}>
                      &#9654;
                    </span>
                    <span className="font-semibold text-[15px] text-gray-900 flex-1">
                      {item.name}
                    </span>
                    {item.dosage && (
                      <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        {item.dosage}
                      </span>
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pl-10 text-sm leading-relaxed text-gray-700">
                      <p className="mb-3">
                        <strong className="text-gray-900">Why it helps:</strong> {item.plain}
                      </p>

                      {item.examples && (
                        <p className="mb-3">
                          <strong className="text-gray-900">Best sources:</strong> {item.examples}
                        </p>
                      )}
                      {item.tip && (
                        <p className="mb-0 bg-white border border-gray-200 rounded-lg p-3 text-[13px]">
                          <strong className="text-gray-900">Tip:</strong> {item.tip}
                        </p>
                      )}

                      {item.dosage && (
                        <p className="mb-3">
                          <strong className="text-gray-900">Suggested dosage:</strong> {item.dosage}
                        </p>
                      )}
                      {item.evidence && (
                        <p className="mb-3 bg-white border border-gray-200 rounded-lg p-3 text-[13px]">
                          <strong className="text-gray-900">Evidence:</strong> {item.evidence}
                        </p>
                      )}
                      {item.source && (
                        <p className="mb-0 text-[11px] text-gray-400 italic leading-snug">
                          <strong>Source:</strong> {item.source}{" "}
                          {item.sourceId && <span className="text-teal-600 not-italic font-semibold">[{item.sourceId}]</span>}
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
      <p className="text-[13px] text-gray-400 leading-relaxed mt-8 mb-5">
        These suggestions are based on published research and WHO guidelines.
        Individual needs vary — always consult a qualified doctor before starting
        supplements or ordering tests.
      </p>

      <a
        href="https://www.formen.health/pages/book-doctor-appointment"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-teal-600 text-white text-[15px] font-semibold px-7 py-3 rounded-xl no-underline hover:bg-teal-700 transition-colors"
      >
        Book a Free Doctor Consultation &rarr;
      </a>
    </section>
  );
});
