// Lightweight translation layer. Only the most user-visible strings
// are translated — verdict labels, section headings, status words,
// button labels, and the doctor CTA. Clinical parameter names (Sperm
// Count, Total Motility, etc.) stay in English because users need to
// match them against their actual lab report.
//
// To add a language: add a key to STRINGS, translate every field, and
// add the option to LANGUAGES.

const LANG_KEY = "fm_ui_lang";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hg", label: "Hinglish" },
];

const STRINGS = {
  en: {
    // Verdict labels
    verdict_all_normal: "Everything looks healthy",
    verdict_attention: "A few things to watch",
    verdict_act_now: "Some things need attention",

    // Section headings
    section_your_results: "Your Results",
    section_next_steps: "Next Steps",
    section_healthy_habits: "Healthy Habits",
    section_about_you: "About you (optional)",
    section_who_stamp: "measured against WHO 2021",

    // Status words (on parameter cards)
    status_in_range: "in range",
    status_watch: "watch",
    status_needs_focus: "needs focus",

    // Buttons
    btn_see_report: "See My Report →",
    btn_print: "Print",
    btn_download_pdf: "Download PDF",
    btn_share: "Share",
    btn_edit: "Edit Details",
    btn_book_call: "Book Free Call",
    btn_compare: "Compare",
    btn_reset: "Reset",
    btn_clear_all: "Clear all",

    // Doctor CTA
    cta_normal_title: "Normal numbers aren't the whole picture",
    cta_normal_body: "A standard semen analysis can't see DNA quality, hormone levels, or your partner's side. If you've been trying for a while, a 15-minute call is the fastest way to find out what to test next.",
    cta_act_now_title: "These results need a doctor's eyes",
    cta_act_now_body: "Don't wait. The findings here have well-established treatments — but only a fertility doctor can tell you which one fits your case.",
    cta_attention_title: "Talk to a fertility doctor",
    cta_attention_body: "A 15-minute call. A doctor will go through your exact numbers with you and decide if anything needs follow-up.",

    // Hero
    hero_eyebrow: "Summary of your report",
    hero_disclaimer: "A simple summary of your report, compared to WHO 2021 ranges. This is not a diagnosis. For any medical decision, please see a doctor.",
    hero_tmsc_label: "Total Motile Sperm Count",
    hero_below_one: "Below 1 million",

    // Privacy
    privacy_line: "Stays on your phone · nobody else sees it",

    // Footer
    footer_save_code: "Your save code",
    footer_save_hint: "Save this code to come back to your report on this phone — no signup, no password. Tap \"Reopen a previous report\" on the home screen.",
  },

  hg: {
    // Tone: friend giving advice. No formal Hindi (no shukranu, alp,
    // dhairyavaan). Keep English for medical terms. Use "theek hai",
    // "thoda kam", "ghabrao mat", "behtar hoga" etc.

    verdict_all_normal: "Sab theek hai, tension mat lo",
    verdict_attention: "Thoda dhyaan dena padega",
    verdict_act_now: "Kuch cheezein hain jinpe action lena hoga",

    section_your_results: "Tumhare Results",
    section_next_steps: "Ab Kya Karna Hai",
    section_healthy_habits: "Daily Healthy Tips",
    section_about_you: "Tumhare baare mein (optional)",
    section_who_stamp: "WHO 2021 ke hisaab se check kiya",

    status_in_range: "theek hai",
    status_watch: "thoda kam",
    status_needs_focus: "dhyaan do",

    btn_see_report: "Meri Report Dekho →",
    btn_print: "Print",
    btn_download_pdf: "PDF Download",
    btn_share: "Share Karo",
    btn_edit: "Edit Karo",
    btn_book_call: "Free Call Book Karo",
    btn_compare: "Compare Karo",
    btn_reset: "Reset",
    btn_clear_all: "Sab Hatao",

    cta_normal_title: "Ghabrao mat, lekin doctor se milna mat chhodna",
    cta_normal_body: "Semen test sirf Sperm Count, Motility aur shape check karta hai. DNA quality, hormones aur partner ki side ka pata isse nahi chalta. Agar kuch time se try kar rahe ho toh ek baar doctor se baat kar lo — 15 minute ki call hai bas.",
    cta_act_now_title: "Ye results doctor ko zaroor dikhao",
    cta_act_now_body: "Ghabrao mat, lekin late mat karo. Inka treatment hota hai — par kaunsa treatment sahi hoga ye doctor hi batayega.",
    cta_attention_title: "Ek baar fertility doctor se baat kar lo",
    cta_attention_body: "15 minute ki call hai. Doctor tumhare numbers samjha dega aur batayega ki kuch aur karna hai ya nahi.",

    hero_eyebrow: "Tumhari report ka summary",
    hero_disclaimer: "Ye report WHO 2021 ke guidelines se compare ki gayi hai. Ye diagnosis nahi hai — koi bhi medical decision lene se pehle doctor se milo.",
    hero_tmsc_label: "Total Motile Sperm Count",
    hero_below_one: "1 million se kam hai",

    privacy_line: "Tumhare phone pe hi rehta hai · koi aur nahi dekh sakta",

    footer_save_code: "Tumhara save code",
    footer_save_hint: "Is code se apni report dobara dekh sakte ho — koi signup ya password ki zaroorat nahi. Home screen pe \"Reopen a previous report\" pe click karo.",
  },
};

// Returns the saved language preference, defaulting to English.
export function getSavedLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && STRINGS[saved]) return saved;
  } catch {}
  return "en";
}

export function saveLang(code) {
  try { localStorage.setItem(LANG_KEY, code); } catch {}
}

// Returns the translation for a given key in the specified language.
// Falls back to English if the key is missing in the target language.
export function t(lang, key) {
  return STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
}
