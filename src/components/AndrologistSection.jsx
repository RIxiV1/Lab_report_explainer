import { useState } from "react";

const suggestions = [
  {
    category: "Food",
    icon: "🥗",
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    items: [
      {
        name: "Zinc-Rich Foods",
        plain: "Zinc is essential for testosterone production and sperm development. Low zinc levels are directly linked to reduced sperm count and quality.",
        examples: "Oysters, pumpkin seeds, lean beef, chickpeas, lentils, cashews.",
        tip: "Aim for 11 mg/day — roughly 85g of beef or a handful of pumpkin seeds covers it.",
      },
      {
        name: "Antioxidant-Rich Fruits & Vegetables",
        plain: "Antioxidants neutralize free radicals that damage sperm DNA and membranes. Colorful produce is your best natural source.",
        examples: "Berries (blueberries, strawberries), tomatoes, spinach, kale, bell peppers, pomegranate.",
        tip: "Aim for 5+ servings of colorful fruits and vegetables daily.",
      },
      {
        name: "Omega-3 Fatty Acids",
        plain: "Omega-3s improve sperm membrane fluidity, which is critical for motility and the ability to penetrate an egg.",
        examples: "Salmon, mackerel, sardines, walnuts, flaxseeds, chia seeds.",
        tip: "2-3 servings of fatty fish per week provides a solid omega-3 foundation.",
      },
      {
        name: "Folate-Rich Foods",
        plain: "Folate supports DNA synthesis during sperm production. Low folate is associated with higher rates of chromosomal abnormalities in sperm.",
        examples: "Dark leafy greens, asparagus, avocado, citrus fruits, beans, fortified cereals.",
        tip: "Pair with vitamin B12 sources for maximum DNA synthesis support.",
      },
      {
        name: "Selenium Sources",
        plain: "Selenium is a key component of proteins that protect sperm from oxidative damage and support healthy sperm formation.",
        examples: "Brazil nuts (1-2 per day is enough), eggs, sunflower seeds, brown rice, mushrooms.",
        tip: "Just 2 Brazil nuts daily can meet your full selenium requirement — don't overdo it.",
      },
      {
        name: "Vitamin D Sources",
        plain: "Vitamin D receptors are found in sperm cells, and deficiency is linked to lower motility and count. Most men in urban India are deficient.",
        examples: "Egg yolks, fortified milk, fatty fish, mushrooms exposed to sunlight.",
        tip: "Morning sunlight (15-20 min) is the most effective source. Supplement if your levels are below 30 ng/mL.",
      },
    ],
  },
  {
    category: "Supplements",
    icon: "💊",
    color: "#0d7d74",
    bg: "#f0fdfa",
    border: "#99f6e4",
    items: [
      {
        name: "Coenzyme Q10 (CoQ10)",
        plain: "CoQ10 powers the mitochondria in sperm tails — the engine that drives motility. Supplementation has shown improvements in both count and motility in clinical studies.",
        dosage: "200-400 mg/day",
        evidence: "Multiple RCTs show significant improvement in sperm concentration and motility after 3-6 months.",
      },
      {
        name: "Zinc",
        plain: "Zinc plays a direct role in testosterone production, sperm maturation, and maintaining sperm membrane integrity.",
        dosage: "25-50 mg/day (elemental zinc)",
        evidence: "Zinc supplementation in deficient men has shown 74% increase in sperm count in some studies.",
      },
      {
        name: "L-Carnitine",
        plain: "L-Carnitine transports fatty acids into sperm mitochondria for energy production, directly fueling sperm movement.",
        dosage: "2-3 g/day (as L-carnitine or acetyl-L-carnitine)",
        evidence: "Well-studied for improving progressive motility, especially in men with asthenozoospermia.",
      },
      {
        name: "Vitamin C & Vitamin E",
        plain: "This antioxidant duo works together — Vitamin C protects in water-based environments, Vitamin E in fat-based cell membranes — to shield sperm from oxidative damage.",
        dosage: "Vitamin C: 500-1000 mg/day, Vitamin E: 400 IU/day",
        evidence: "Combined supplementation reduces sperm DNA fragmentation and improves morphology.",
      },
      {
        name: "Ashwagandha (Withania somnifera)",
        plain: "An adaptogen that reduces cortisol and oxidative stress while supporting testosterone levels. Well-studied in the Indian medical system.",
        dosage: "300-600 mg/day (standardized root extract, KSM-66)",
        evidence: "Clinical trials show improvements in sperm count, motility, and testosterone in stressed/infertile men.",
      },
      {
        name: "Folic Acid + Vitamin B12",
        plain: "Both B-vitamins are essential for DNA synthesis during the 74-day sperm production cycle. Deficiency increases chromosomal errors.",
        dosage: "Folic acid: 400-800 mcg/day, B12: 1000 mcg/day",
        evidence: "Combined supplementation improves sperm count and reduces DNA fragmentation.",
      },
    ],
  },
  {
    category: "Tests When Required",
    icon: "🔬",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#c4b5fd",
    items: [
      {
        name: "DNA Fragmentation Index (DFI)",
        plain: "Measures damage to the DNA inside each sperm. Even if sperm look normal and move well, damaged DNA can cause poor embryo development or repeated miscarriage.",
        when: "Recurrent pregnancy loss, failed IVF/ICSI, unexplained infertility despite normal routine results.",
        cost: "₹3,000–₹8,000",
      },
      {
        name: "Hormone Panel (FSH, LH, Testosterone, Prolactin)",
        plain: "Blood tests checking if your brain and testes are communicating properly. Hormonal imbalances can cause low sperm production even when the testes are healthy.",
        when: "Low sperm count, low libido, suspected hormonal disorder.",
        cost: "₹800–₹2,500",
      },
      {
        name: "Scrotal Doppler Ultrasound",
        plain: "Detects varicocele — enlarged veins in the scrotum that raise testicular temperature and damage sperm production. One of the most common and treatable causes of male infertility.",
        when: "Abnormal semen parameters, palpable varicocele, testicular discomfort.",
        cost: "₹1,000–₹3,000",
      },
      {
        name: "Reactive Oxygen Species (ROS) Testing",
        plain: "Measures oxidative stress in semen. Too many free radicals damage sperm membrane and DNA — often caused by smoking, obesity, or environmental toxins.",
        when: "Unexplained infertility, lifestyle risk factors present.",
        cost: "₹2,000–₹5,000",
      },
      {
        name: "Anti-Sperm Antibodies (ASA)",
        plain: "Detects if your immune system is mistakenly attacking your own sperm, impairing their movement and ability to fertilise.",
        when: "Unexplained infertility, testicular injury or infection history, post-vasectomy reversal.",
        cost: "₹1,500–₹4,000",
      },
      {
        name: "Genetic Testing (Karyotype + Y-Microdeletion)",
        plain: "Checks for chromosomal abnormalities or missing sections of the Y chromosome responsible for sperm production.",
        when: "Severe oligospermia or azoospermia, recurrent pregnancy loss, before IVF/ICSI.",
        cost: "₹5,000–₹15,000",
      },
    ],
  },
];

export default function AndrologistSection() {
  const [openCategory, setOpenCategory] = useState(0);
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItem(openItem === key ? null : key);
  };

  return (
    <section
      id="andrologist-section"
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
          What Can Help Improve Your Numbers
        </h2>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "#5a6a7a",
            margin: 0,
          }}
        >
          Based on clinical evidence — here are the foods, supplements, and tests
          that can support your fertility. Small, consistent changes over 90 days
          can make a real difference.
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {suggestions.map((cat, catIdx) => {
          const isActive = openCategory === catIdx;
          return (
            <button
              key={catIdx}
              onClick={() => { setOpenCategory(catIdx); setOpenItem(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 999,
                border: `1.5px solid ${isActive ? cat.border : "#e2e8f0"}`,
                background: isActive ? cat.bg : "#fff",
                color: isActive ? cat.color : "#64748b",
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              {cat.category}
            </button>
          );
        })}
      </div>

      {/* Active Category Items */}
      {suggestions.map((cat, catIdx) => {
        if (catIdx !== openCategory) return null;
        return (
          <div key={catIdx} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cat.items.map((item, itemIdx) => {
              const key = `${catIdx}-${itemIdx}`;
              const isOpen = openItem === key;
              return (
                <div
                  key={itemIdx}
                  style={{
                    border: `1px solid ${isOpen ? cat.color : "#e2e8f0"}`,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: isOpen ? cat.bg : "#fff",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                >
                  {/* Item Header */}
                  <button
                    onClick={() => toggleItem(catIdx, itemIdx)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
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
                        flex: 1,
                      }}
                    >
                      {item.name}
                    </span>
                    {/* Cost badge for tests */}
                    {item.cost && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          background: "#ede9fe",
                          color: "#7c3aed",
                          padding: "3px 10px",
                          borderRadius: 999,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.cost}
                      </span>
                    )}
                    {/* Dosage badge for supplements */}
                    {item.dosage && (
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
                        {item.dosage}
                      </span>
                    )}
                  </button>

                  {/* Expanded Body */}
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
                        <strong style={{ color: "#0d2137" }}>Why it helps:</strong>{" "}
                        {item.plain}
                      </p>

                      {/* Food-specific fields */}
                      {item.examples && (
                        <p style={{ margin: "0 0 12px" }}>
                          <strong style={{ color: "#0d2137" }}>Best sources:</strong>{" "}
                          {item.examples}
                        </p>
                      )}
                      {item.tip && (
                        <p style={{ margin: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                          <strong style={{ color: "#0d2137" }}>💡 Tip:</strong>{" "}
                          {item.tip}
                        </p>
                      )}

                      {/* Supplement-specific fields */}
                      {item.dosage && (
                        <p style={{ margin: "0 0 12px" }}>
                          <strong style={{ color: "#0d2137" }}>Suggested dosage:</strong>{" "}
                          {item.dosage}
                        </p>
                      )}
                      {item.evidence && (
                        <p style={{ margin: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                          <strong style={{ color: "#0d2137" }}>📊 Evidence:</strong>{" "}
                          {item.evidence}
                        </p>
                      )}

                      {/* Test-specific fields */}
                      {item.when && (
                        <p style={{ margin: "0 0 12px" }}>
                          <strong style={{ color: "#0d2137" }}>When it's needed:</strong>{" "}
                          {item.when}
                        </p>
                      )}
                      {item.cost && (
                        <p style={{ margin: 0 }}>
                          <strong style={{ color: "#0d2137" }}>Estimated cost:</strong>{" "}
                          {item.cost}
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
        These suggestions are based on published research and WHO guidelines.
        Individual needs vary — always consult a qualified doctor before starting
        supplements or ordering tests.
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
