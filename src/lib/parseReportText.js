// Parses pasted lab report text and extracts semen analysis values.
//
// Handles:
//   - Simple "Key: Value" text (pasted from a screenshot or email)
//   - Indian lab formats (SRL, Thyrocare, Metropolis, Dr Lal PathLabs)
//   - UK/CREATE Fertility-style tables with unit annotations
//   - PDFs with mild spacing artefacts around decimal points
//
// IMPORTANT: we deliberately do NOT merge digit-space-digit (e.g. "5 0"
// → "50"). Many lab reports place multiple numeric values on the same
// visual line (value + reference range + other cells). Aggressive
// digit merging corrupts pH 7.5 into 7.707 when an adjacent cell has
// nearby digits. OCR-glitched single-digit splits are a rarer failure
// mode and are better handled by the paste-text fallback.

function normalize(text) {
  let t = text.replace(/[ \t\r\f\v]+/g, " "); // collapse horizontal whitespace only
  t = t.replace(/ *\n+ */g, "\n");            // clean up newlines; keep as row boundaries
  t = t.replace(/(\d) \./g, "$1.");           // "5 ." → "5."  (decimal repair)
  t = t.replace(/\. (\d)/g, ".$1");           // ". 5" → ".5"  (decimal repair)
  t = t.replace(/(\d) %/g, "$1%");            // "5 %" → "5%"
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
    // Order matters: WHO canonical is "total motility" (a+b+c), threshold ≥42%.
    // "Total motile" phrasing is common on Indian labs. Fall back to
    // "all progressive" (a+b), threshold ≥30% — different threshold,
    // so we tag which type was matched and the analyzer grades accordingly.
    keywords: [
      { kw: "total motility",   subtype: "total" },
      { kw: "total motile",     subtype: "total" },
      { kw: "motility total",   subtype: "total" },
      { kw: "all progressive",  subtype: "progressive" },
      { kw: "progressive motility", subtype: "progressive" },
      { kw: "motility",         subtype: "total" }, // bare "motility" defaults to total
    ],
    guard: (matchedText) => !/immotile|non[-\s]*progressive/.test(matchedText.toLowerCase()),
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
    // Indian labs commonly report pus cells as "/hpf" (per high-power field).
    // /hpf is NOT arithmetically convertible to million/mL. But clinically,
    // ≥1 pus cell/hpf suggests possible leukocytospermia (infection) — we
    // must surface this rather than silently dropping it. The extracted
    // number goes into `unitWarnings` instead of `results` so the UI can
    // show a flagged finding without feeding a mis-unit'd value into the
    // rule engine.
    flagIfNear: /\/\s*hpf|per\s*hpf|high[-\s]*power/i,
  },
];

// Look up to 40 chars beyond the matched number to check for unit markers
// that would invalidate the reading (e.g. "/hpf" on pus cells).
const REJECT_LOOKAHEAD = 40;

function findValue(text, param) {
  const { key, keywords, guard, fallbackRegex, flagIfNear } = param;
  const bounds = SANITY[key];

  for (const entry of keywords) {
    // keywords can be strings (plain) or { kw, subtype } objects (for tagged matches)
    const kw = typeof entry === "string" ? entry : entry.kw;
    const subtype = typeof entry === "string" ? undefined : entry.subtype;
    const regex = new RegExp(`\\b${fuzzy(kw)}${GAP}([\\d.]+)`, "i");
    const match = text.match(regex);
    if (match) {
      if (guard && !guard(match[0])) continue;
      const value = parseFloat(match[1]);
      if (isNaN(value)) continue;
      if (bounds && (value < bounds.min || value > bounds.max)) continue;
      if (flagIfNear) {
        const after = text.slice(match.index + match[0].length, match.index + match[0].length + REJECT_LOOKAHEAD);
        if (flagIfNear.test(after)) {
          return { value, matched: match[0].trim(), unitMismatch: true, rawUnit: "/hpf", subtype };
        }
      }
      return { value, matched: match[0].trim(), subtype };
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
  const subtypes = {}; // e.g. { motility: "total" | "progressive" }
  const unitWarnings = {};

  for (const param of PARAMS) {
    const found = findValue(normalized, param);
    if (!found) continue;
    matched[param.key] = found.matched;
    if (found.subtype) subtypes[param.key] = found.subtype;
    if (found.unitMismatch) {
      unitWarnings[param.key] = { value: found.value, rawUnit: found.rawUnit };
    } else {
      results[param.key] = found.value;
    }
  }

  return {
    results,
    matched,
    subtypes,
    unitWarnings,
    foundCount: Object.keys(results).length,
  };
}
