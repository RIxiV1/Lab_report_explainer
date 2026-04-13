// Parses pasted lab report text and extracts semen analysis values.
//
// Handles:
//   - Simple "Key: Value" text (pasted from a screenshot or email)
//   - Indian lab formats (SRL, Thyrocare, Metropolis, Dr Lal PathLabs)
//   - UK/CREATE Fertility-style tables with unit annotations
//   - PDFs where text extraction inserts spurious spaces between
//     characters (e.g. "v olume", "1 . 9 0", "Total   m otility %")

function normalize(text) {
  let t = text.replace(/\s+/g, " ");
  let prev;
  do {
    prev = t;
    t = t.replace(/(\d) (\d)/g, "$1$2");
    t = t.replace(/(\d) \./g, "$1.");
    t = t.replace(/\. (\d)/g, ".$1");
    t = t.replace(/(\d) %/g, "$1%");
  } while (t !== prev);
  return t;
}

function fuzzy(word) {
  return word.split("").map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s*");
}

const GAP = "[^\\d\\n]{0,60}?";

// Sanity bounds — reject values that are physically impossible.
// This catches lab data-entry errors and mis-parses.
const SANITY = {
  spermCount: { min: 0, max: 900 },
  motility:   { min: 0, max: 100 },
  morphology: { min: 0, max: 100 },
  volume:     { min: 0, max: 30 },
  pH:         { min: 6, max: 9 },
  wbc:        { min: 0, max: 100 },
};

const PARAMS = [
  {
    key: "spermCount",
    keywords: [
      "total sperm concentration",
      "sperm concentration",
      "density",
      "sperm count",
      "concentration",
    ],
  },
  {
    key: "motility",
    keywords: [
      "total motility",
      "motility total",
      "all progressive",
      "total motile",
      "motility",
    ],
    guard: (matchedText) => !/immotile/.test(matchedText.toLowerCase()),
  },
  {
    key: "morphology",
    keywords: [
      "normal forms",
      "normal morphology",
      "morphology",
      "kruger",
    ],
  },
  {
    key: "volume",
    keywords: [
      "ejaculate volume",
      "sample volume",
      "semen volume",
      "volume",
      "quantity",
    ],
  },
  {
    key: "pH",
    // Must match "pH" as a standalone label — NOT inside "Physical"
    // or "alphabet". Require word boundary or start-of-field context.
    keywords: ["ph paper", "ph value", "reaction"],
    // Fallback: bare "pH" with strict word-boundary matching
    fallbackRegex: /\bpH\s*(?:\([^)]*\))?\s*[:\-–]?\s*([\d.]+)/i,
  },
  {
    key: "wbc",
    keywords: [
      "pus cells",
      "wbc",
      "leukocytes",
      "white blood cells",
    ],
  },
];

function findValue(text, param) {
  const { key, keywords, guard, fallbackRegex } = param;
  const bounds = SANITY[key];

  for (const kw of keywords) {
    const regex = new RegExp(`\\b${fuzzy(kw)}${GAP}([\\d.]+)`, "i");
    const match = text.match(regex);
    if (match) {
      if (guard && !guard(match[0])) continue;
      const value = parseFloat(match[1]);
      if (isNaN(value)) continue;
      if (bounds && (value < bounds.min || value > bounds.max)) continue;
      return { value, matched: match[0].trim() };
    }
  }

  // Try fallback regex if keyword search failed
  if (fallbackRegex) {
    const match = text.match(fallbackRegex);
    if (match) {
      const value = parseFloat(match[1]);
      if (!isNaN(value) && bounds && value >= bounds.min && value <= bounds.max) {
        return { value, matched: match[0].trim() };
      }
    }
  }

  return null;
}

export function parseReportText(text) {
  const normalized = normalize(text);
  const results = {};
  const matched = {};

  for (const param of PARAMS) {
    const found = findValue(normalized, param);
    if (found) {
      results[param.key] = found.value;
      matched[param.key] = found.matched;
    }
  }

  return { results, matched, foundCount: Object.keys(results).length };
}
