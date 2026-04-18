import { useState } from "react";
import { t } from "../../lib/i18n";

const SIGN_OFF = {
  en: {
    ALL_NORMAL: "You've taken the first step — and the news is good. Keep these habits going.",
    ATTENTION: "You've taken the first step. Small changes add up — start today and re-test in 90 days.",
    ACT_NOW: "You've taken the hardest step — looking at the numbers. Now take the next one: talk to a doctor. This is treatable.",
  },
  hg: {
    ALL_NORMAL: "Pehla step le liya — aur khabar acchi hai. Aise hi chalte raho.",
    ATTENTION: "Pehla step le liya. Chhoti chhoti cheezein farak dalti hain — aaj se shuru karo aur 90 din baad dobara test karo.",
    ACT_NOW: "Sabse mushkil step le liya — numbers dekhe. Ab agla step lo: doctor se baat karo. Iska ilaaj hota hai.",
  },
};

export default function ResultsFooter({ result, fmCode, lang, onCompare, onReset }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(fmCode)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
      .catch(() => {
        try {
          const el = document.createElement("textarea");
          el.value = fmCode;
          el.style.position = "fixed";
          el.style.opacity = "0";
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          document.body.removeChild(el);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy this code:", fmCode);
        }
      });
  }

  const signOff = (lang === "hg" ? SIGN_OFF.hg : SIGN_OFF.en)[result.verdict] || SIGN_OFF.en.ATTENTION;

  return (
    <div className="content-container-narrow">
      {/* Emotional close */}
      <div className="mb-14 text-center py-10 border-t border-brand-900/5">
        <p className="font-serif text-[20px] text-brand-900/60 italic leading-relaxed max-w-[560px] mx-auto">
          "{signOff}"
        </p>
      </div>

      {/* FM code + actions */}
      <div className="py-8 border-t border-brand-900/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="text-left">
            <p className="text-[10px] text-brand-900/40 uppercase tracking-[0.2em] font-bold mb-1">{t(lang, "footer_save_code")}</p>
            <p className="font-mono text-xl font-bold text-brand-900 tracking-[0.15em]">{fmCode}</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] no-print">
            <button onClick={handleCopy} className="font-bold uppercase tracking-widest text-brand-600 hover:text-brand-800 cursor-pointer bg-brand-50 px-4 py-2 transition-all">{copied ? "Copied!" : "Copy Code"}</button>
            <button onClick={onCompare} className="font-bold uppercase tracking-widest text-brand-600 hover:text-brand-800 cursor-pointer bg-transparent border-none transition-colors">Compare</button>
            <button onClick={onReset} className="font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none transition-colors">Reset</button>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-4 leading-relaxed max-w-[500px] no-print font-medium">{t(lang, "footer_save_hint")}</p>
      </div>
    </div>
  );
}
