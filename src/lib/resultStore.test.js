// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  generateCode,
  saveResult,
  loadResult,
  getDraft,
  saveDraft,
  clearDraft,
  getLastResultPointer,
  saveLastResultPointer,
  clearLastResultPointer,
  getActions,
  saveActions,
  getStorageStats,
  wipeAllData,
  cleanupExpiredResults,
} from "./resultStore";

// Vitest runs in Node with jsdom — localStorage is available.

beforeEach(() => {
  localStorage.clear();
});

describe("generateCode", () => {
  it("produces FM-XXXX-XXXX format", () => {
    const code = generateCode();
    expect(code).toMatch(/^FM-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it("generates unique codes", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateCode()));
    expect(codes.size).toBe(100);
  });

  it("excludes ambiguous characters (0, 1, O, I)", () => {
    const codes = Array.from({ length: 200 }, () => generateCode()).join("");
    expect(codes).not.toMatch(/[01OI]/);
  });
});

describe("saveResult / loadResult", () => {
  it("round-trips a result object", () => {
    const result = { verdict: "ALL_NORMAL", parameters: {} };
    saveResult("FM-ABCD-2345", result);
    const loaded = loadResult("FM-ABCD-2345");
    expect(loaded.result).toEqual(result);
    expect(loaded.timestamp).toBeTruthy();
  });

  it("returns null for non-existent code", () => {
    expect(loadResult("FM-ZZZZ-9999")).toBeNull();
  });

  it("returns null for invalid code format", () => {
    expect(loadResult("not-a-code")).toBeNull();
    expect(loadResult("")).toBeNull();
    expect(loadResult("FM-abc-1234")).toBeNull(); // lowercase
  });

  it("handles corrupt JSON gracefully", () => {
    localStorage.setItem("fm_result_FM-ABCD-2345", "not json");
    expect(loadResult("FM-ABCD-2345")).toBeNull();
  });
});

describe("draft persistence", () => {
  it("round-trips a draft", () => {
    saveDraft({ values: { spermCount: "45" }, age: "30" });
    expect(getDraft()).toEqual({ values: { spermCount: "45" }, age: "30" });
  });

  it("clearDraft removes the draft", () => {
    saveDraft({ values: {} });
    clearDraft();
    expect(getDraft()).toEqual({});
  });

  it("getDraft returns {} when nothing saved", () => {
    expect(getDraft()).toEqual({});
  });
});

describe("lastResultPointer", () => {
  it("round-trips pointer", () => {
    saveLastResultPointer("FM-AAAA-BBBB", "17 Apr 2026");
    expect(getLastResultPointer()).toEqual({ code: "FM-AAAA-BBBB", date: "17 Apr 2026" });
  });

  it("clearLastResultPointer removes it", () => {
    saveLastResultPointer("FM-AAAA-BBBB", "17 Apr 2026");
    clearLastResultPointer();
    expect(getLastResultPointer()).toBeNull();
  });
});

describe("actions persistence", () => {
  it("round-trips action checkbox state", () => {
    saveActions("FM-ABCD-2345", { "Immediate-0": true });
    expect(getActions("FM-ABCD-2345")).toEqual({ "Immediate-0": true });
  });

  it("returns {} for unknown code", () => {
    expect(getActions("FM-ZZZZ-9999")).toEqual({});
  });

  it("rejects invalid codes", () => {
    saveActions("bad-code", { a: true });
    expect(getActions("bad-code")).toEqual({});
  });
});

describe("getStorageStats", () => {
  it("counts stored results", () => {
    saveResult("FM-AAAA-1111", { v: 1 });
    saveResult("FM-BBBB-2222", { v: 2 });
    const stats = getStorageStats();
    expect(stats.resultCount).toBe(2);
    expect(stats.approxBytes).toBeGreaterThan(0);
  });

  it("returns 0 for empty storage", () => {
    const stats = getStorageStats();
    expect(stats.resultCount).toBe(0);
    expect(stats.oldestDate).toBeNull();
  });
});

describe("wipeAllData", () => {
  it("removes all fm_ keys", () => {
    saveResult("FM-AAAA-1111", {});
    saveDraft({ values: {} });
    saveLastResultPointer("FM-AAAA-1111", "today");
    const removed = wipeAllData();
    expect(removed).toBeGreaterThan(0);
    expect(loadResult("FM-AAAA-1111")).toBeNull();
    expect(getDraft()).toEqual({});
    expect(getLastResultPointer()).toBeNull();
  });

  it("does not remove non-fm_ keys", () => {
    localStorage.setItem("other_app_key", "keep");
    wipeAllData();
    expect(localStorage.getItem("other_app_key")).toBe("keep");
  });
});

describe("cleanupExpiredResults", () => {
  it("removes results older than 6 months", () => {
    const old = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem("fm_result_FM-XOLD-XOLD", JSON.stringify({ result: {}, timestamp: old }));
    const removed = cleanupExpiredResults();
    expect(removed).toBe(1);
    expect(loadResult("FM-XOLD-XOLD")).toBeNull();
  });

  it("keeps recent results", () => {
    saveResult("FM-NEW2-NEW2", { v: 1 });
    const removed = cleanupExpiredResults();
    expect(removed).toBe(0);
    expect(loadResult("FM-NEW2-NEW2")).toBeTruthy();
  });
});
