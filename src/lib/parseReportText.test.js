import { describe, it, expect } from "vitest";
import { parseReportText } from "./parseReportText";

describe("parseReportText", () => {
  it("extracts all 6 values from a clean report", () => {
    const text = `
      Sperm Count: 45 million/mL
      Total Motility: 55%
      Morphology: 5%
      Volume: 3.2 mL
      pH: 7.4
      WBC: 0.3 million/mL
    `;
    const r = parseReportText(text);
    expect(r.foundCount).toBe(6);
    expect(r.results.spermCount).toBe(45);
    expect(r.results.motility).toBe(55);
    expect(r.results.morphology).toBe(5);
    expect(r.results.volume).toBe(3.2);
    expect(r.results.pH).toBe(7.4);
    expect(r.results.wbc).toBe(0.3);
  });

  it("handles Indian lab format with pus cells", () => {
    const text = `
      Sperm Concentration - 22 million/mL
      Motility (Total) - 48
      Normal Forms: 6%
      Semen Volume: 2.8 mL
      pH - 7.6
      Pus Cells: 0.5 million/mL
    `;
    const r = parseReportText(text);
    expect(r.foundCount).toBe(6);
    expect(r.results.spermCount).toBe(22);
    expect(r.results.wbc).toBe(0.5);
  });

  it("handles Kruger morphology format", () => {
    const text = "Kruger strict criteria: 3%";
    const r = parseReportText(text);
    expect(r.results.morphology).toBe(3);
  });

  it("returns zero foundCount for garbage input", () => {
    const r = parseReportText("hello world no numbers here");
    expect(r.foundCount).toBe(0);
    expect(Object.keys(r.results)).toHaveLength(0);
  });

  it("handles partial results", () => {
    const text = "Sperm Count: 30 million/mL\npH: 7.5";
    const r = parseReportText(text);
    expect(r.foundCount).toBe(2);
    expect(r.results.spermCount).toBe(30);
    expect(r.results.pH).toBe(7.5);
  });

  // ── Dr Lal PathLabs / Indian lab edge cases ──────────────────────

  it("does not grade /hpf pus cells against million/mL threshold, but surfaces as a warning", () => {
    const text = "Pus Cells 2-3 /hpf\nRBC Nil /hpf";
    const r = parseReportText(text);
    expect(r.results.wbc).toBeUndefined();
    expect(r.unitWarnings.wbc).toBeDefined();
    expect(r.unitWarnings.wbc.value).toBe(2);
    expect(r.unitWarnings.wbc.rawUnit).toBe("/hpf");
  });

  it("accepts WBC when explicitly in million/mL", () => {
    const text = "WBC 0.5 million/mL";
    const r = parseReportText(text);
    expect(r.results.wbc).toBe(0.5);
  });

  it("prefers 'Total motile' over 'All progressive' (WHO canonical wins)", () => {
    const text = "Total motile (a+b+c) 55.00 %\nAll progressive (a+b) 35.00 %";
    const r = parseReportText(text);
    expect(r.results.motility).toBe(55);
  });

  it("falls back to 'All progressive' when Total motile is out of sanity (>100%)", () => {
    // Real case from Dr Lal PathLabs sample where total motile was 117% (garbage)
    const text = "Total motile (a+b+c) 117.00 %\nAll progressive (a+b) 73.00 %";
    const r = parseReportText(text);
    expect(r.results.motility).toBe(73);
  });

  it("does not match 'Non-progressive' as motility", () => {
    const text = "Non-progressive (c) 44.00 %";
    const r = parseReportText(text);
    expect(r.results.motility).toBeUndefined();
  });

  it("rejects motility if motility + immotile > 105% (impossible sum)", () => {
    // Scenario: OCR scrambled a table and the parser grabbed the
    // immotile value as motility. Total motile 60 + immotile 60 = 120 → reject.
    const text = "Total motile (a+b+c) 60 %\nImmotile (d) 60 %";
    const r = parseReportText(text);
    expect(r.results.motility).toBeUndefined();
    expect(r.unitWarnings.motility).toBeDefined();
    expect(r.unitWarnings.motility.title).toMatch(/add up/i);
  });

  it("accepts motility when motility + immotile sums to ~100 (valid)", () => {
    const text = "Total motile (a+b+c) 55 %\nImmotile (d) 40 %";
    const r = parseReportText(text);
    expect(r.results.motility).toBe(55);
    expect(r.unitWarnings.motility).toBeUndefined();
  });

  it("tolerates small rounding when immotile is absent", () => {
    // Sanity check only fires if BOTH values are present.
    const text = "Total motile (a+b+c) 55 %";
    const r = parseReportText(text);
    expect(r.results.motility).toBe(55);
  });

  it("does not merge pH value with nearby unrelated digits (regression: 7.707 bug)", () => {
    // Previously normalize() would merge "7.5" and "7171001" (from CAP
    // accreditation footer) into "7.57171001" or similar, yielding
    // implausible pH values like 7.707 when the greedy [\d.]+ captured
    // partial digits across a row boundary.
    const text = "pH (pH paper) 7.5\nCAP (7171001) ISO 27001:2013 Certified";
    const r = parseReportText(text);
    expect(r.results.pH).toBe(7.5);
  });

  it("does not merge two separate numeric cells on the same line", () => {
    // A common lab table row: "Volume 4.00 mL 1.4 - 7.6" (value + unit +
    // reference range). Should extract just 4.00, not 4.001 or similar.
    const text = "Ejaculate Volume 4.00 mL 1.4 - 7.6 mL";
    const r = parseReportText(text);
    expect(r.results.volume).toBe(4);
  });

  it("does not corrupt motility by merging Vitality 5.00 with adjacent digits", () => {
    // User-reported failure: motility was coming out as 5 instead of a
    // plausible value, because aggressive digit merging fused Vitality
    // with other cells.
    const text = `Motility
All progressive (a+b) 73.00 %
Vitality (Eosin-Nigrosin stain) 5.00 % >54`;
    const r = parseReportText(text);
    expect(r.results.motility).toBe(73);
  });

  // ── Regression coverage for major Indian + UK lab formats ────────
  // Fixtures reflect typical phrasing/ordering. Not perfect — real PDFs
  // may vary — but much better than testing only one format.

  it("extracts SRL Diagnostics format", () => {
    const text = `
      SEMEN ANALYSIS
      Volume    3.2    ml    1.4 - 7.6
      pH    7.8    7.2 - 8.0
      Sperm Concentration    45    million/ml    >= 16
      Total Motility    52    %    >= 42
      Progressive Motility    38    %    >= 30
      Normal Morphology    5    %    >= 4
      Pus Cells    0.2    million/ml    < 1
    `;
    const r = parseReportText(text);
    expect(r.results.volume).toBe(3.2);
    expect(r.results.pH).toBe(7.8);
    expect(r.results.spermCount).toBe(45);
    expect(r.results.motility).toBe(52);
    expect(r.results.morphology).toBe(5);
    expect(r.results.wbc).toBe(0.2);
  });

  it("extracts Thyrocare format", () => {
    const text = `
      SEMEN ANALYSIS COMPLETE
      SEMEN VOLUME                 2.8 mL
      PH                           7.6
      SPERM CONCENTRATION          38.0 million/mL
      TOTAL MOTILITY               48 %
      MORPHOLOGY (NORMAL FORMS)    6 %
      LEUKOCYTES                   0.4 million/mL
    `;
    const r = parseReportText(text);
    expect(r.results.volume).toBe(2.8);
    expect(r.results.pH).toBe(7.6);
    expect(r.results.spermCount).toBe(38);
    expect(r.results.motility).toBe(48);
    expect(r.results.morphology).toBe(6);
    expect(r.results.wbc).toBe(0.4);
  });

  it("extracts Metropolis Healthcare format", () => {
    const text = `
      Semen Analysis Report
      Ejaculate Volume : 3.5 mL ( 1.4 - 7.6 )
      pH : 7.4 ( 7.2 - 8.0 )
      Sperm Count : 65 million/mL ( >= 16 )
      Total Motility : 55 % ( >= 42 )
      Progressive (a+b) : 40 %
      Morphology : 8 % ( >= 4 )
      WBC : 0.5 million/mL ( < 1 )
    `;
    const r = parseReportText(text);
    expect(r.results.volume).toBe(3.5);
    expect(r.results.pH).toBe(7.4);
    expect(r.results.spermCount).toBe(65);
    expect(r.results.motility).toBe(55);
    expect(r.results.morphology).toBe(8);
    expect(r.results.wbc).toBe(0.5);
  });

  it("extracts Apollo Diagnostics format with /hpf WBC (surfaces warning)", () => {
    const text = `
      Semen Analysis
      Volume - 2.5 mL
      pH - 7.5
      Sperm Concentration - 28 million/mL
      Total Motility - 44 %
      Normal Forms (Kruger) - 3 %
      Pus Cells - 4-5 /hpf
    `;
    const r = parseReportText(text);
    expect(r.results.volume).toBe(2.5);
    expect(r.results.spermCount).toBe(28);
    expect(r.results.morphology).toBe(3);
    expect(r.results.motility).toBe(44);
    expect(r.results.wbc).toBeUndefined();
    expect(r.unitWarnings.wbc).toBeDefined();
    expect(r.unitWarnings.wbc.rawUnit).toBe("/hpf");
  });

  it("extracts UK / CREATE Fertility-style format", () => {
    const text = `
      Semen Analysis
      Sample Volume           1.9 ml
      pH value                7.3
      Sperm concentration     22.5 x10^6/ml
      Total motility          45 %
      Progressive motility    32 %
      Morphology              4 %
      Leukocytes              0.3 x10^6/ml
    `;
    const r = parseReportText(text);
    expect(r.results.volume).toBe(1.9);
    expect(r.results.pH).toBe(7.3);
    expect(r.results.spermCount).toBe(22.5);
    expect(r.results.motility).toBe(45);
    expect(r.results.morphology).toBe(4);
    expect(r.results.wbc).toBe(0.3);
  });

  // ── Cross-report contamination guards ────────────────────────────
  // Indian labs sometimes deliver a packaged report containing CBC,
  // urinalysis and semen analysis on adjacent pages. The parser must
  // not pick up haemoglobin, urine specific gravity, or CBC WBC values
  // as if they were semen-analysis fields.

  it("does NOT capture haemoglobin concentration as sperm count", () => {
    const text = "Hemoglobin Concentration: 14.5 g/dL\nMCV: 89 fL";
    const r = parseReportText(text);
    expect(r.results.spermCount).toBeUndefined();
  });

  it("does NOT capture urine specific gravity as sperm count", () => {
    const text = "Urinalysis\nSpecific gravity (density): 1.020\nProtein: Nil";
    const r = parseReportText(text);
    expect(r.results.spermCount).toBeUndefined();
  });

  it("still captures explicit 'Sperm Density' phrasing", () => {
    const text = "Sperm Density: 45 million/mL";
    const r = parseReportText(text);
    expect(r.results.spermCount).toBe(45);
  });

  it("flags CBC WBC values (thousand/μL) instead of misclassifying as pus cells", () => {
    const text = "WBC: 7.5 thousand/uL\nRBC: 4.5 million/uL";
    const r = parseReportText(text);
    expect(r.results.wbc).toBeUndefined();
    expect(r.unitWarnings.wbc).toBeDefined();
    expect(r.unitWarnings.wbc.title).toMatch(/blood-count/i);
  });

  it("flags CBC WBC values (K/μL) instead of misclassifying as pus cells", () => {
    const text = "WBC 6.2 K/uL";
    const r = parseReportText(text);
    expect(r.results.wbc).toBeUndefined();
  });

  it("still accepts WBC in correct semen-analysis units (million/mL)", () => {
    const text = "Pus Cells (WBC): 0.4 million/mL";
    const r = parseReportText(text);
    expect(r.results.wbc).toBe(0.4);
  });

  it("extracts Dr Lal PathLabs format correctly", () => {
    const text = `
      Ejaculate Volume 4.00 mL
      pH (pH paper) 7.5
      Total Sperm Concentration 160.0 million/mL >15
      Total motile (a+b+c) 55.00 % >42
      All progressive (a+b) 35.00 %
      Normal forms 23.00 % >4
      Pus Cells 2-3 /hpf Nil
    `;
    const r = parseReportText(text);
    expect(r.results.volume).toBe(4);
    expect(r.results.pH).toBe(7.5);
    expect(r.results.spermCount).toBe(160);
    expect(r.results.motility).toBe(55); // total motile, not all progressive
    expect(r.results.morphology).toBe(23);
    expect(r.results.wbc).toBeUndefined(); // /hpf units → skip
  });
});
