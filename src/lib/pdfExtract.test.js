import { describe, it, expect } from "vitest";
import { reconstructByPosition, reconstructByEOL, reconstructByStream } from "./pdfExtract";

// Mock textContent objects matching the shape pdfjs returns.
function makeTextContent(items) {
  return {
    items: items.map((item) => ({
      str: item.str,
      transform: [item.height || 12, 0, 0, item.height || 12, item.x, item.y],
      width: item.width ?? item.str.length * 6,
      height: item.height || 12,
      hasEOL: item.hasEOL || false,
    })),
  };
}

describe("reconstructByPosition", () => {
  it("groups items on the same Y into one line", () => {
    const tc = makeTextContent([
      { str: "Sperm Count", x: 50, y: 700 },
      { str: "45", x: 300, y: 700 },
      { str: "million/mL", x: 330, y: 700 },
    ]);
    const result = reconstructByPosition(tc);
    expect(result).toContain("Sperm Count");
    expect(result).toContain("45");
    // Should be on ONE line
    expect(result.split("\n").length).toBe(1);
  });

  it("keeps items on different Y as separate lines", () => {
    const tc = makeTextContent([
      { str: "Sperm Count", x: 50, y: 700 },
      { str: "45", x: 300, y: 700 },
      { str: "pH", x: 50, y: 680 },
      { str: "7.5", x: 300, y: 680 },
    ]);
    const result = reconstructByPosition(tc);
    const lines = result.split("\n");
    expect(lines.length).toBe(2);
    expect(lines[0]).toContain("Sperm Count");
    expect(lines[1]).toContain("pH");
  });

  it("does NOT split '43' into '4 3' when items are adjacent", () => {
    // Simulates pdf.js splitting "43%" across two text items
    // at nearly the same X position (item.width makes them adjacent).
    const tc = makeTextContent([
      { str: "Total motility", x: 50, y: 700, width: 80 },
      { str: "%", x: 135, y: 700, width: 8 },
      { str: "4", x: 200, y: 700, width: 6 },
      { str: "3", x: 206, y: 700, width: 6 },  // adjacent to "4"
      { str: "%", x: 212, y: 700, width: 8 },
    ]);
    const result = reconstructByPosition(tc);
    // "4" and "3" should be joined WITHOUT space → "43"
    expect(result).toMatch(/43/);
    expect(result).not.toMatch(/4\s+3/);
  });

  it("DOES add space between distant items (different columns)", () => {
    const tc = makeTextContent([
      { str: "Volume", x: 50, y: 700, width: 40 },
      { str: "3.2", x: 300, y: 700, width: 20 },  // far from "Volume"
    ]);
    const result = reconstructByPosition(tc);
    expect(result).toMatch(/Volume\s+3\.2/);
  });

  it("handles empty textContent", () => {
    const tc = makeTextContent([]);
    expect(reconstructByPosition(tc)).toBe("");
  });

  it("filters out whitespace-only items", () => {
    const tc = makeTextContent([
      { str: "pH", x: 50, y: 700 },
      { str: "   ", x: 100, y: 700 },
      { str: "7.5", x: 300, y: 700 },
    ]);
    const result = reconstructByPosition(tc);
    expect(result).toContain("pH");
    expect(result).toContain("7.5");
  });

  it("sorts by Y descending (top of page first)", () => {
    const tc = makeTextContent([
      { str: "Bottom", x: 50, y: 100 },
      { str: "Top", x: 50, y: 700 },
    ]);
    const lines = reconstructByPosition(tc).split("\n");
    expect(lines[0]).toContain("Top");
    expect(lines[1]).toContain("Bottom");
  });
});

describe("reconstructByEOL", () => {
  it("inserts newlines where hasEOL is true", () => {
    const tc = makeTextContent([
      { str: "Line 1", x: 0, y: 700, hasEOL: true },
      { str: "Line 2", x: 0, y: 688, hasEOL: true },
    ]);
    const lines = reconstructByEOL(tc).trim().split("\n");
    expect(lines.length).toBe(2);
  });

  it("joins items on same line with space when no EOL", () => {
    const tc = makeTextContent([
      { str: "Sperm", x: 0, y: 700, hasEOL: false },
      { str: "Count", x: 40, y: 700, hasEOL: false },
      { str: "45", x: 100, y: 700, hasEOL: true },
    ]);
    const result = reconstructByEOL(tc);
    expect(result).toContain("Sperm Count 45");
  });
});

describe("reconstructByStream", () => {
  it("joins all items with spaces", () => {
    const tc = makeTextContent([
      { str: "A", x: 0, y: 0 },
      { str: "B", x: 0, y: 0 },
      { str: "C", x: 0, y: 0 },
    ]);
    expect(reconstructByStream(tc)).toBe("A B C");
  });

  it("handles empty strings", () => {
    const tc = makeTextContent([
      { str: "", x: 0, y: 0 },
      { str: "X", x: 0, y: 0 },
    ]);
    expect(reconstructByStream(tc)).toBe(" X");
  });
});
