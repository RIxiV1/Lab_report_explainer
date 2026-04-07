import { useState } from "react";

const tests = [
  {
    name: "DNA Fragmentation Index (DFI)",
    cost: "₹3,000–₹8,000",
    actionable: true,
    plain: "Measures damage to the DNA inside each sperm. Even if sperm look normal and move well, damaged DNA can cause poor embryo development or repeated miscarriage.",
    when: "Recurrent pregnancy loss, failed IVF/ICSI, unexplained male infertility despite normal routine results.",
    costDetail: "₹3,000–₹8,000 depending on lab and method (TUNEL, SCD, or SCSA).",
    actionableDetail: "Yes — lifestyle changes, antioxidant therapy, and varicocele repair can meaningfully reduce DFI scores.",
  },
  {
    name: "Reactive Oxygen Species (ROS) Testing",
    cost: "₹2,000–₹5,000",
    actionable: true,
    plain: "Measures oxidative stress in semen. Too many free radicals damage the sperm membrane and DNA — often caused by smoking, obesity, or environmental toxins.",
    when: "Unexplained infertility, lifestyle risk factors present.",
    costDetail: "₹2,000–₹5,000 depending on lab.",
    actionableDetail: "Yes — antioxidant supplements (Vitamin C, E, CoQ10), smoking cessation, dietary changes.",
  },
  {
    name: "Capacitation / CAP-Score",
    cost: "₹4,000–₹10,000",
    actionable: true,
    plain: "Tests whether your sperm can complete the biological changes needed to actually penetrate and fertilise an egg. Sperm can look fine on a routine test but fail at this stage.",
    when: "Unexplained infertility, failed IUI, IVF/ICSI failure.",
    costDetail: "₹4,000–₹10,000 depending on availability.",
    actionableDetail: "Yes — guides choice of assisted reproductive technique.",
  },
  {
    name: "Anti-Sperm Antibodies (ASA)",
    cost: "₹1,500–₹4,000",
    actionable: true,
    plain: "Detects if your immune system is mistakenly attacking your own sperm, impairing their movement and ability to fertilise.",
    when: "Unexplained infertility, testicular injury or infection history, post-vasectomy reversal.",
    costDetail: "₹1,500–₹4,000 depending on lab.",
    actionableDetail: "Yes — corticosteroids, sperm washing, ART options available.",
  },
  {
    name: "Scrotal Doppler Ultrasound",
    cost: "₹1,000–₹3,000",
    actionable: true,
    plain: "An ultrasound to detect varicocele — enlarged veins in the scrotum that raise testicular temperature and damage sperm production. One of the most common and treatable causes of male infertility.",
    when: "Abnormal semen parameters, palpable varicocele, testicular discomfort.",
    costDetail: "₹1,000–₹3,000 depending on centre.",
    actionableDetail: "Yes — varicocelectomy can significantly improve parameters.",
  },
  {
    name: "Hormone Panel (FSH, LH, Testosterone, Prolactin)",
    cost: "₹800–₹2,500",
    actionable: true,
    plain: "Blood tests checking if your brain and testes are communicating properly. Hormonal imbalances upstream can cause low sperm production even when the testes themselves are healthy.",
    when: "Low sperm count, low libido, suspected hormonal disorder.",
    costDetail: "₹800–₹2,500 depending on panel breadth.",
    actionableDetail: "Yes — hormonal treatment, lifestyle changes, specialist referral.",
  },
  {
    name: "Genetic Testing (Karyotype + Y-Microdeletion)",
    cost: "₹5,000–₹15,000",
    actionable: false,
    plain: "Checks for chromosomal abnormalities or missing sections of the Y chromosome responsible for sperm production. Relevant when count is very low or absent.",
    when: "Severe oligospermia or azoospermia, recurrent pregnancy loss, before IVF/ICSI.",
    costDetail: "₹5,000–₹15,000 depending on scope.",
    actionableDetail: "Partially — guides ART decisions and genetic counselling, but some causes are not reversible.",
  },
  {
    name: "Acrosome Reaction Test",
    cost: "₹3,000–₹7,000",
    actionable: true,
    plain: "Tests whether the sperm's tip (acrosome) can activate properly to penetrate an egg. Sperm that can't complete this step cannot fertilise naturally.",
    when: "IVF failure despite good embryo quality.",
    costDetail: "₹3,000–₹7,000 depending on lab.",
    actionableDetail: "Yes — ICSI bypasses this requirement entirely.",
  },
  {
    name: "Hyaluronan Binding Assay (HBA)",
    cost: "₹2,500–₹6,000",
    actionable: true,
    plain: "Measures sperm maturity. Mature sperm bind to hyaluronan found naturally in the egg. Helps identify the best sperm for ICSI.",
    when: "Recurrent IVF/ICSI failure, high DFI score.",
    costDetail: "₹2,500–₹6,000 depending on lab.",
    actionableDetail: "Yes — informs PICSI (physiological ICSI) selection.",
  },
  {
    name: "IZUMO1 Protein Testing",
    cost: "₹8,000–₹20,000+",
    actionable: false,
    plain: "A newer test checking for a protein on the sperm surface essential for sperm-egg fusion. Absence means sperm can reach the egg but cannot fuse with it.",
    when: "Total fertilisation failure in IVF.",
    costDetail: "₹8,000–₹20,000+ — limited availability.",
    actionableDetail: "Limited — primarily guides ART protocol decisions.",
  },
];

export default function AndrologistSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      style={{
        maxWidth: 780,
        margin: "0 auto",
        padding: "48px 20px",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        color: "#1a2332",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            margin: "0 0 10px",
            lineHeight: 1.25,
            color: "#0d2137",
          }}
        >
          What Your Andrologist Might Recommend
        </h2>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "#5a6a7a",
            margin: 0,
          }}
        >
          If your semen analysis shows abnormalities, your doctor may suggest one
          or more of these advanced tests. Here's what they mean — in plain
          English.
        </p>
      </div>

      {/* Accordion */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tests.map((t, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              style={{
                border: "1px solid " + (isOpen ? "#0d9488" : "#e2e8f0"),
                borderRadius: 12,
                overflow: "hidden",
                background: isOpen ? "#f0fdfa" : "#fff",
                transition: "border-color 0.2s, background 0.2s",
              }}
            >
              {/* Header row */}
              <button
                onClick={() => toggle(i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  padding: "14px 16px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    fontSize: 14,
                    color: "#94a3b8",
                    flexShrink: 0,
                  }}
                >
                  ▶
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#0d2137",
                    flex: "1 1 200px",
                  }}
                >
                  {t.name}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    background: "#e0f7f5",
                    color: "#0d7d74",
                    padding: "3px 10px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.cost}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    background: t.actionable ? "#dcfce7" : "#f1f5f9",
                    color: t.actionable ? "#15803d" : "#64748b",
                    padding: "3px 10px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.actionable ? "✓ Actionable" : "~ Limited"}
                </span>
              </button>

              {/* Expanded body */}
              {isOpen && (
                <div
                  style={{
                    padding: "0 16px 18px 40px",
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "#374151",
                  }}
                >
                  <p style={{ margin: "0 0 12px" }}>
                    <strong style={{ color: "#0d2137" }}>
                      In plain English:
                    </strong>{" "}
                    {t.plain}
                  </p>
                  <p style={{ margin: "0 0 12px" }}>
                    <strong style={{ color: "#0d2137" }}>
                      When it's ordered:
                    </strong>{" "}
                    {t.when}
                  </p>
                  <p style={{ margin: "0 0 12px" }}>
                    <strong style={{ color: "#0d2137" }}>Cost:</strong>{" "}
                    {t.costDetail}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: "#0d2137" }}>
                      What's actionable:
                    </strong>{" "}
                    {t.actionableDetail}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer + CTA */}
      <p
        style={{
          fontSize: 13,
          color: "#94a3b8",
          lineHeight: 1.6,
          marginTop: 32,
          marginBottom: 20,
        }}
      >
        These tests are not a next step for everyone. If your routine semen
        analysis is within WHO guidelines, most of these tests are not
        necessary. Discuss with a qualified andrologist.
      </p>

      <a
        href="https://www.formen.health/pages/book-doctor-appointment"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          background: "#0d9488",
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          padding: "13px 28px",
          borderRadius: 10,
          textDecoration: "none",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#0f766e")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#0d9488")}
      >
        Book a Free Doctor Consultation →
      </a>
    </section>
  );
}
