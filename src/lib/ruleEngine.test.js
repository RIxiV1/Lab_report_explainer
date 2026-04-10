import { describe, it, expect } from "vitest";
import { analyzeReport } from "./ruleEngine";

const HEALTHY = {
  spermCount: 50,
  motility: 60,
  morphology: 8,
  volume: 3.0,
  pH: 7.4,
  wbc: 0.3,
};

function analyze(overrides = {}) {
  return analyzeReport({ ...HEALTHY, ...overrides });
}

describe("analyzeReport", () => {
  // --- Verdict classification ---

  it("returns ALL_NORMAL for healthy values", () => {
    const r = analyze();
    expect(r.verdict).toBe("ALL_NORMAL");
    expect(r.snippetKey).toBe("ALL_NORMAL");
    expect(r.concernCount).toBe(0);
  });

  it("returns ATTENTION for a single warning", () => {
    const r = analyze({ spermCount: 10 }); // WARNING range (5-16)
    expect(r.verdict).toBe("ATTENTION");
    expect(r.snippetKey).toBe("ISOLATED_LOW_COUNT");
  });

  it("returns ACT_NOW for a single critical", () => {
    const r = analyze({ spermCount: 3 }); // CRITICAL (<5)
    expect(r.verdict).toBe("ACT_NOW");
    expect(r.snippetKey).toBe("CRITICAL_COUNT");
  });

  it("returns ACT_NOW when 3+ warnings", () => {
    const r = analyze({ spermCount: 10, motility: 35, morphology: 3 });
    expect(r.verdict).toBe("ACT_NOW");
    expect(r.snippetKey).toBe("BORDERLINE_MULTIPLE");
  });

  // --- Individual parameter classification ---

  describe("sperm count", () => {
    it("classifies >=16 as NORMAL", () => {
      expect(analyze({ spermCount: 16 }).parameters.spermCount.status).toBe("NORMAL");
    });
    it("classifies 5-15 as WARNING", () => {
      expect(analyze({ spermCount: 5 }).parameters.spermCount.status).toBe("WARNING");
      expect(analyze({ spermCount: 15 }).parameters.spermCount.status).toBe("WARNING");
    });
    it("classifies <5 as CRITICAL", () => {
      expect(analyze({ spermCount: 4 }).parameters.spermCount.status).toBe("CRITICAL");
      expect(analyze({ spermCount: 0 }).parameters.spermCount.status).toBe("CRITICAL");
    });
  });

  describe("motility", () => {
    it("classifies >=42 as NORMAL", () => {
      expect(analyze({ motility: 42 }).parameters.motility.status).toBe("NORMAL");
    });
    it("classifies 30-41 as WARNING", () => {
      expect(analyze({ motility: 30 }).parameters.motility.status).toBe("WARNING");
    });
    it("classifies <30 as CRITICAL", () => {
      expect(analyze({ motility: 29 }).parameters.motility.status).toBe("CRITICAL");
    });
  });

  describe("morphology", () => {
    it("classifies >=4 as NORMAL", () => {
      expect(analyze({ morphology: 4 }).parameters.morphology.status).toBe("NORMAL");
    });
    it("classifies 2-3 as WARNING", () => {
      expect(analyze({ morphology: 3 }).parameters.morphology.status).toBe("WARNING");
    });
    it("classifies <2 as CRITICAL", () => {
      expect(analyze({ morphology: 1 }).parameters.morphology.status).toBe("CRITICAL");
    });
  });

  describe("volume", () => {
    it("classifies 1.4-7.6 as NORMAL", () => {
      expect(analyze({ volume: 1.4 }).parameters.volume.status).toBe("NORMAL");
      expect(analyze({ volume: 7.6 }).parameters.volume.status).toBe("NORMAL");
    });
    it("classifies 0.5-1.3 and 7.7-10 as WARNING", () => {
      expect(analyze({ volume: 0.5 }).parameters.volume.status).toBe("WARNING");
      expect(analyze({ volume: 9 }).parameters.volume.status).toBe("WARNING");
    });
    it("classifies <0.5 and >10 as CRITICAL", () => {
      expect(analyze({ volume: 0.3 }).parameters.volume.status).toBe("CRITICAL");
      expect(analyze({ volume: 12 }).parameters.volume.status).toBe("CRITICAL");
    });
  });

  describe("pH", () => {
    it("classifies 7.2-8.0 as NORMAL", () => {
      expect(analyze({ pH: 7.2 }).parameters.pH.status).toBe("NORMAL");
      expect(analyze({ pH: 8.0 }).parameters.pH.status).toBe("NORMAL");
    });
    it("classifies 8.1-8.5 as WARNING", () => {
      expect(analyze({ pH: 8.3 }).parameters.pH.status).toBe("WARNING");
    });
    it("classifies <7.2 or >8.5 as CRITICAL", () => {
      expect(analyze({ pH: 7.0 }).parameters.pH.status).toBe("CRITICAL");
      expect(analyze({ pH: 9.0 }).parameters.pH.status).toBe("CRITICAL");
    });
  });

  describe("WBC", () => {
    it("classifies <1 as NORMAL", () => {
      expect(analyze({ wbc: 0.5 }).parameters.wbc.status).toBe("NORMAL");
    });
    it("classifies 1-2 as WARNING", () => {
      expect(analyze({ wbc: 1.5 }).parameters.wbc.status).toBe("WARNING");
    });
    it("classifies >2 as CRITICAL", () => {
      expect(analyze({ wbc: 3 }).parameters.wbc.status).toBe("CRITICAL");
    });
  });

  // --- Snippet key selection ---

  it("detects ALL_THREE_LOW when all core params critical", () => {
    const r = analyze({ spermCount: 1, motility: 10, morphology: 0 });
    expect(r.snippetKey).toBe("ALL_THREE_LOW");
  });

  it("prioritizes motility over count for critical", () => {
    const r = analyze({ spermCount: 2, motility: 10 });
    expect(r.snippetKey).toBe("CRITICAL_MOTILITY");
  });

  it("selects LOW_COUNT_LOW_MOTILITY for two warning combo", () => {
    const r = analyze({ spermCount: 10, motility: 35 });
    expect(r.snippetKey).toBe("LOW_COUNT_LOW_MOTILITY");
  });

  it("selects LOW_VOLUME for critically low volume", () => {
    const r = analyze({ volume: 0.2 });
    expect(r.snippetKey).toBe("LOW_VOLUME");
  });

  it("selects HIGH_VOLUME for critically high volume", () => {
    const r = analyze({ volume: 15 });
    expect(r.snippetKey).toBe("HIGH_VOLUME");
  });

  it("selects ELEVATED_WBC for critical wbc", () => {
    const r = analyze({ wbc: 5 });
    expect(r.snippetKey).toBe("ELEVATED_WBC");
  });

  it("selects ABNORMAL_PH_LOW for low pH", () => {
    const r = analyze({ pH: 6.5 });
    expect(r.snippetKey).toBe("ABNORMAL_PH_LOW");
  });

  it("selects ABNORMAL_PH_HIGH for high pH", () => {
    const r = analyze({ pH: 9.0 });
    expect(r.snippetKey).toBe("ABNORMAL_PH_HIGH");
  });

  // --- Tone modifiers ---

  it("sets urgencyFlag HIGH when TTC > 12 months", () => {
    const r = analyze({ ttcMonths: 18 });
    expect(r.urgencyFlag).toBe("HIGH");
  });

  it("sets urgencyFlag NORMAL when TTC <= 12", () => {
    const r = analyze({ ttcMonths: 6 });
    expect(r.urgencyFlag).toBe("NORMAL");
  });

  it("sets ageFlag true when age > 40", () => {
    expect(analyze({ age: 45 }).ageFlag).toBe(true);
  });

  it("sets ageFlag false when age <= 40", () => {
    expect(analyze({ age: 30 }).ageFlag).toBe(false);
  });

  it("handles missing optional fields gracefully", () => {
    const r = analyze();
    expect(r.urgencyFlag).toBe("NORMAL");
    expect(r.ageFlag).toBe(false);
  });
});
