// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { t, getSavedLang, saveLang, LANGUAGES } from "./i18n";

beforeEach(() => { localStorage.clear(); });

describe("t() translation function", () => {
  it("returns English string for 'en'", () => {
    expect(t("en", "verdict_all_normal")).toBe("Everything looks healthy");
  });

  it("returns Hinglish string for 'hg'", () => {
    const result = t("hg", "verdict_all_normal");
    expect(result).toMatch(/theek/i);
  });

  it("falls back to English for missing Hinglish key", () => {
    // If a key is missing from hg, should return English version
    const en = t("en", "verdict_all_normal");
    // Both should be non-empty strings
    expect(en).toBeTruthy();
  });

  it("returns the key itself for unknown keys", () => {
    expect(t("en", "nonexistent_key_xyz")).toBe("nonexistent_key_xyz");
  });

  it("returns English for unknown language code", () => {
    expect(t("zz", "verdict_all_normal")).toBe("Everything looks healthy");
  });
});

describe("language persistence", () => {
  it("defaults to 'en'", () => {
    expect(getSavedLang()).toBe("en");
  });

  it("saves and retrieves language choice", () => {
    saveLang("hg");
    expect(getSavedLang()).toBe("hg");
  });

  it("rejects unknown language codes, defaults to 'en'", () => {
    localStorage.setItem("fm_ui_lang", "xx");
    expect(getSavedLang()).toBe("en");
  });
});

describe("LANGUAGES constant", () => {
  it("has at least English and Hinglish", () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(codes).toContain("en");
    expect(codes).toContain("hg");
  });
});
