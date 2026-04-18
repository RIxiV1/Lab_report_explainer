import { t } from "../../lib/i18n";

const DOCTOR_URL = "https://www.formen.health/pages/book-doctor-appointment";

export default function DoctorCTA({ result, lang }) {
  return (
    <section className="mb-14 no-print content-container-narrow">
      <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 card-tonal !bg-gradient-to-br from-[#F2F3F9] to-[#EAECFA] border-none">
        <div className="flex-1">
          <p className="font-serif text-[24px] font-bold text-brand-900 mb-2 leading-tight">
            {result.verdict === "ALL_NORMAL" ? t(lang, "cta_normal_title")
              : result.verdict === "ACT_NOW" ? t(lang, "cta_act_now_title")
              : t(lang, "cta_attention_title")}
          </p>
          <p className="text-[14px] text-gray-600 max-w-[460px] leading-relaxed font-medium">
            {result.verdict === "ALL_NORMAL" ? t(lang, "cta_normal_body")
              : result.verdict === "ACT_NOW" ? t(lang, "cta_act_now_body")
              : t(lang, "cta_attention_body")}
          </p>
        </div>
        <a href={DOCTOR_URL} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0 !py-3.5 !px-8">
          {t(lang, "btn_book_call")}
        </a>
      </div>
    </section>
  );
}
