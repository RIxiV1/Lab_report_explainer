import { PARAM_ORDER } from "../../lib/constants";
import { t } from "../../lib/i18n";

const DIET_POOL = [
  { emoji: "🥜", item: "Pumpkin seeds, cashews, chickpeas", why: "Zinc — sperm production", hg: "Kaddu ke beej, kaju, chole — sperm production ke liye zaroori", targets: ["spermCount"] },
  { emoji: "🐟", item: "Salmon, sardines, walnuts", why: "Omega-3 — cell energy", hg: "Salmon, sardines, akhrot — cell ki energy ke liye", targets: ["motility", "morphology"] },
  { emoji: "🫐", item: "Berries, tomatoes, dark greens", why: "Antioxidants — protect cells", hg: "Berries, tamatar, green sabzi — cells ko protect karte hain", targets: ["morphology", "wbc"] },
  { emoji: "🥚", item: "Eggs, paneer, lentils (dal)", why: "B12 + protein", hg: "Ande, paneer, dal — body ke building blocks", targets: [] },
  { emoji: "🍊", item: "Amla, orange, guava", why: "Vitamin C — absorption", hg: "Amla, santra, amrood — absorption badhate hain", targets: ["wbc"] },
  { emoji: "🌿", item: "Ashwagandha (supplement or tea)", why: "Supports testosterone", hg: "Ashwagandha — testosterone support karta hai", targets: ["spermCount", "motility"] },
];

const SWAP_POOL = [
  { emoji: "🔄", item: "Swap paratha → oats or daliya", why: "More fibre, less oil", hg: "Paratha hatao, oats ya daliya khao — zyada fibre, kam oil", targets: [] },
  { emoji: "🔄", item: "Swap cold drinks → nimbu paani", why: "Sugar kills sperm", hg: "Cold drink chhodo, nimbu paani piyo — sugar sperm ko nuksaan karta hai", targets: [] },
  { emoji: "🔄", item: "Swap chai (sugar) → green tea", why: "Antioxidants, less sugar", hg: "Cheeni wali chai kam karo, green tea piyo — antioxidants milte hain", targets: ["morphology", "wbc"] },
];

const LIFESTYLE_POOL = [
  { text: "Keep laptops off your lap. Avoid very hot baths.", hg: "Laptop hamesha table pe rakho, lap pe nahi. Bahut garam paani se mat nahao.", targets: ["spermCount", "motility"] },
  { text: "Sleep 7–9 hours. Exercise at least 150 minutes a week.", hg: "7-9 ghante so. Haftey mein kam se kam 150 minute exercise karo.", targets: [] },
  { text: "Cut down on alcohol. Stop smoking if you can.", hg: "Sharaab kam karo. Smoking band kar sako toh best hai.", targets: ["motility", "morphology"] },
  { text: "Drink 3+ litres of water daily to flush inflammation.", hg: "Din mein 3 litre se zyada paani piyo — infection flush hota hai.", targets: ["wbc"] },
  { text: "Wear loose cotton underwear — tight boxers trap heat.", hg: "Loose cotton underwear pehno — tight underwear garmi badhata hai.", targets: ["spermCount"] },
  { text: "Manage stress — cortisol directly lowers sperm production.", hg: "Stress kam karo — cortisol sperm production ko seedha kam karta hai.", targets: ["spermCount", "motility"] },
];

function prioritizeTips(pool, flaggedParams) {
  return pool.map((tip) => ({
    ...tip,
    score: tip.targets.filter((t) => flaggedParams.includes(t)).length,
  })).sort((a, b) => b.score - a.score);
}

export default function TipsSection({ result, lang }) {
  const providedKeys = PARAM_ORDER.filter((k) => result.parameters[k] !== undefined);
  const flagged = providedKeys.filter((k) => result.parameters[k]?.status !== "NORMAL");
  const dietTips = prioritizeTips([...DIET_POOL, ...SWAP_POOL], flagged);
  const lifeTips = prioritizeTips(LIFESTYLE_POOL, flagged);
  const isHg = lang === "hg";
  const allNormal = flagged.length === 0;

  return (
    <section className="mb-14 content-container-narrow">
      <h2 className="font-serif text-[28px] font-bold text-gray-900 tracking-tight mb-6">{t(lang, "section_healthy_habits")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-brand-900/5 card-tonal overflow-hidden border-none shadow-sm">
        <div className="bg-white p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-900/40 mb-3">
            {isHg ? (allNormal ? "Aise Hi Strong Raho" : "Kya Khayen") : (allNormal ? "Keep It Up" : "Diet")}
          </p>
          {allNormal && (
            <p className="text-[12px] text-gray-500 mb-4 italic">
              {isHg ? "Sab theek hai — ye tips follow karte raho taaki numbers strong rahein." : "Your numbers look good. These tips help keep them that way."}
            </p>
          )}
          <div className="space-y-4">
            {dietTips.map((tip, i) => (
              <p key={i} className="text-[13.5px] text-gray-700 leading-relaxed font-medium">
                <span className="mr-2 text-[16px]">{tip.emoji}</span>
                {isHg && tip.hg ? <span className="text-gray-800">{tip.hg}</span> : (
                  <><span className="text-gray-900">{tip.item}</span><span className="text-gray-400 font-normal"> — {tip.why}</span></>
                )}
                {tip.score > 0 && <span className="ml-2 text-[9px] bg-wellness-100 text-wellness-800 px-1.5 py-0.5 font-bold uppercase tracking-widest rounded-sm">{isHg ? "Zaroori" : "Priority"}</span>}
              </p>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 border-l border-brand-900/5">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-900/40 mb-3">
            {isHg ? (allNormal ? "Routine Jaari Rakho" : "Daily Routine") : (allNormal ? "Stay the Course" : "Lifestyle")}
          </p>
          {allNormal && (
            <p className="text-[12px] text-gray-500 mb-4 italic">
              {isHg ? "Ye healthy habits follow karte raho — consistency hi key hai." : "Consistency is key. Keep these habits going."}
            </p>
          )}
          <div className="space-y-4">
            {lifeTips.map((tip, i) => (
              <p key={i} className="text-[13.5px] text-gray-600 leading-relaxed font-medium">
                {isHg && tip.hg ? tip.hg : tip.text}
                {tip.score > 0 && <span className="ml-2 text-[9px] bg-wellness-100 text-wellness-800 px-1.5 py-0.5 font-bold uppercase tracking-widest rounded-sm">{isHg ? "Zaroori" : "Priority"}</span>}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
