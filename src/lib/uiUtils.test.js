import { describe, it, expect } from "vitest";
import { displayValue, formatDate, todayLabel } from "./uiUtils";

describe("displayValue", () => {
  it("returns integers untouched", () => {
    expect(displayValue(42)).toBe(42);
    expect(displayValue(0)).toBe(0);
  });

  it("returns 1-decimal numbers untouched", () => {
    expect(displayValue(7.4)).toBe(7.4);
    expect(displayValue(1.9)).toBe(1.9);
  });

  it("rounds multi-decimal OCR artifacts to 1 decimal", () => {
    expect(displayValue(7.707)).toBe(7.7);
    expect(displayValue(3.14159)).toBe(3.1);
  });

  it("handles null/undefined → em-dash", () => {
    expect(displayValue(null)).toBe("—");
    expect(displayValue(undefined)).toBe("—");
  });

  it("parses string numbers", () => {
    expect(displayValue("45")).toBe(45);
    expect(displayValue("7.707")).toBe(7.7);
  });

  it("returns non-numeric strings as-is", () => {
    expect(displayValue("hello")).toBe("hello");
  });
});

describe("formatDate", () => {
  it("formats a Date in en-IN locale", () => {
    const d = new Date(2026, 3, 17); // April 17, 2026
    const result = formatDate(d);
    expect(result).toMatch(/17/);
    expect(result).toMatch(/Apr/);
    expect(result).toMatch(/2026/);
  });

  it("returns em-dash for null", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });
});

describe("todayLabel", () => {
  it("returns a non-empty string", () => {
    const label = todayLabel();
    expect(label).toBeTruthy();
    expect(typeof label).toBe("string");
  });
});
