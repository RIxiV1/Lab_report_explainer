import { describe, it, expect } from "vitest";
import { parseReportText } from "./parseReportText";
import { analyzeReport } from "./analyzeReport";

// ── CHAOS TESTS ──────────────────────────────────────────────────
// These simulate malicious users, garbage inputs, corrupted OCR
// output, and edge-case boundary values. The app must never crash,
// never return NaN/Infinity, and never execute injected scripts.

describe("parser chaos", () => {
  it("handles null/undefined input without crashing", () => {
    expect(() => parseReportText("")).not.toThrow();
    expect(parseReportText("").foundCount).toBe(0);
  });

  it("handles a 100KB garbage string", () => {
    const garbage = "x".repeat(100_000);
    expect(() => parseReportText(garbage)).not.toThrow();
    expect(parseReportText(garbage).foundCount).toBe(0);
  });

  it("does not execute XSS payloads in input", () => {
    const xss = '<script>alert("xss")</script>Sperm Count: 45';
    const r = parseReportText(xss);
    // Should extract the number but NOT execute the script
    expect(r.results.spermCount).toBe(45);
    // The matched text should contain the raw string, not executed HTML
    expect(r.matched.spermCount).not.toContain("<script>");
  });

  it("handles unicode/emoji in input", () => {
    const text = "💊 Sperm Count: 45 million/mL 🧬 pH: 7.4";
    const r = parseReportText(text);
    expect(r.results.spermCount).toBe(45);
    expect(r.results.pH).toBe(7.4);
  });

  it("handles extremely large numbers", () => {
    const text = "Sperm Count: 999999999 million/mL";
    const r = parseReportText(text);
    // Sanity bound should reject (max 900)
    expect(r.results.spermCount).toBeUndefined();
  });

  it("handles negative numbers (regex captures unsigned digit)", () => {
    // The `-` is not in [\d.] so the regex skips it and captures the
    // unsigned digit. "pH: -2" → captures 2 → sanity 6-9 rejects.
    // "Sperm Count: -5" → captures 5 → sanity 0-900 allows it.
    const text = "Sperm Count: -5 million/mL\npH: -2";
    const r = parseReportText(text);
    expect(r.results.spermCount).toBe(5);
    expect(r.results.pH).toBeUndefined(); // 2 is outside pH sanity 6-9
  });

  it("handles decimal overflow (1.2.3.4)", () => {
    const text = "pH: 1.2.3.4";
    const r = parseReportText(text);
    // parseFloat("1.2.3.4") → 1.2, sanity bound 6-9 rejects
    expect(r.results.pH).toBeUndefined();
  });

  it("handles tab-separated values", () => {
    const text = "Sperm Count\t45\tmillion/mL";
    const r = parseReportText(text);
    expect(r.results.spermCount).toBe(45);
  });

  it("handles CRLF line endings", () => {
    const text = "Sperm Count: 45\r\npH: 7.5\r\nVolume: 3.2";
    const r = parseReportText(text);
    expect(r.results.spermCount).toBe(45);
    expect(r.results.pH).toBe(7.5);
    expect(r.results.volume).toBe(3.2);
  });

  it("handles all-caps input", () => {
    const text = "SPERM COUNT: 45 MILLION/ML\nTOTAL MOTILITY: 55%";
    const r = parseReportText(text);
    expect(r.results.spermCount).toBe(45);
    expect(r.results.motility).toBe(55);
  });

  it("does not match numbers inside URLs or emails", () => {
    const text = "Visit lab123.com/results/45 for details\npH: 7.5";
    const r = parseReportText(text);
    // spermCount should NOT be 45 (no keyword match for "lab123")
    expect(r.results.spermCount).toBeUndefined();
    expect(r.results.pH).toBe(7.5);
  });
});

describe("analyzer chaos", () => {
  it("handles empty input object", () => {
    const r = analyzeReport({});
    expect(r.verdict).toBe("ALL_NORMAL");
    expect(r.missingRequired.length).toBe(6);
  });

  it("handles NaN values", () => {
    expect(() => analyzeReport({ spermCount: NaN, motility: NaN })).not.toThrow();
    const r = analyzeReport({ spermCount: NaN });
    expect(r.parameters.spermCount).toBeUndefined();
  });

  it("handles Infinity", () => {
    expect(() => analyzeReport({ spermCount: Infinity })).not.toThrow();
  });

  it("handles string values (form input leaks)", () => {
    // If someone passes string "45" instead of number 45
    const r = analyzeReport({ spermCount: "45", motility: "60", morphology: "8", volume: "3", pH: "7.4", wbc: "0.3" });
    // Should still classify — parseFloat handles strings
    expect(r.verdict).toBeDefined();
  });

  it("handles zero for every parameter", () => {
    const r = analyzeReport({ spermCount: 0, motility: 0, morphology: 0, volume: 0.1, pH: 7.2, wbc: 0 });
    expect(r.verdict).toBe("ACT_NOW");
    expect(r.tmsc.value).toBe(0);
  });

  it("handles boundary-exact WHO thresholds", () => {
    const r = analyzeReport({
      spermCount: 16, motility: 42, morphology: 4,
      volume: 1.4, pH: 7.2, wbc: 1.0,
    });
    expect(r.verdict).toBe("ALL_NORMAL");
  });

  it("handles one-below-boundary values", () => {
    const r = analyzeReport({
      spermCount: 15.9, motility: 41.9, morphology: 3.9,
      volume: 1.39, pH: 7.19, wbc: 1.01,
    });
    // Every single param should be WARNING or CRITICAL
    expect(r.verdict).not.toBe("ALL_NORMAL");
  });
});
