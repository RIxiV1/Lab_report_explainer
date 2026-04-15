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

  it("skips WBC when reported in /hpf units (not million/mL)", () => {
    const text = "Pus Cells 2-3 /hpf\nRBC Nil /hpf";
    const r = parseReportText(text);
    expect(r.results.wbc).toBeUndefined();
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
