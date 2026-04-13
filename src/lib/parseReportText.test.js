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
});
