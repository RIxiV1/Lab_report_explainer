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

// Extracts an immotile percentage if the report lists one (e.g.
// "Immotile (d) 40%"). Used only for cross-validation, NOT returned
// as a user-facing field.
const IMMOTILE_REGEX = /\bimmotile\b[^\d\n]{0,60}?([\d.]+)/i;

function findImmotile(text) {
  const m = text.match(IMMOTILE_REGEX);
  if (!m) return null;
  const v = parseFloat(m[1]);
  if (isNaN(v) || v < 0 || v > 100) return null;
  return v;
}

// Tolerance for motility+immotile summing to 100. Rounding across lab
// reports (e.g. 55 + 40 = 95) is normal; anything above 105 is an
// impossible sum and means one of the values is misread.
const MOTILITY_SUM_TOLERANCE = 5;

export function parseReportText(text) {
  const normalized = normalize(text);
  const results = {};
  const matched = {};
  const subtypes = {};
  const warnings = {};

  for (const param of PARAMS) {
    const found = findValue(normalized, param);
    if (!found) continue;
    matched[param.key] = found.matched;
    if (found.subtype) subtypes[param.key] = found.subtype;
    if (found.unitMismatch) {
      warnings[param.key] = buildUnitWarning(param.key, found);
    } else {
      results[param.key] = found.value;
    }
  }

  // ── Cross-validation: motility + immotile should sum to ~100 ──────
  // If we extracted a motility value and the report also has an
  // "Immotile" row, confirm they aren't contradictory. OCR scrambles on
  // Indian lab tables can make the parser grab the immotile value by
  // mistake — in which case the sum exceeds 100%, which is physiologically
  // impossible. Drop the motility value and surface a warning.
  if (results.motility !== undefined) {
    const immotile = findImmotile(normalized);
    if (immotile !== null) {
      const sum = results.motility + immotile;
      if (sum > 100 + MOTILITY_SUM_TOLERANCE) {
        warnings.motility = {
          value: results.motility,
          title: "Motility values didn't add up",
          message: `Your report's motility (${results.motility}%) and immotile (${immotile}%) sum to ${sum}%, which isn't possible. This usually means the parser picked up the wrong row. Please enter motility manually after checking your report.`,
        };
        delete results.motility;
        delete subtypes.motility;
      }
    }
  }

  return {
    results,
    matched,
    subtypes,
    unitWarnings: warnings, // kept key-name for backward compat
    foundCount: Object.keys(results).length,
  };
}

// Converts a raw parser-level warning into a UI-renderable shape.
// Parser gives us { value, rawUnit } when units don't match our scale;
// we turn that into a human-readable title + message here so the UI
// can render any warning type uniformly.
function buildUnitWarning(paramKey, found) {
  if (paramKey === "wbc" && found.rawUnit === "/hpf") {
    return {
      value: found.value,
      rawUnit: found.rawUnit,
      title: `Pus cells reported as ${found.value} ${found.rawUnit}`,
      message: `Your lab used per-high-power-field, which can't be graded against the million/mL threshold used here. Clinically, 1 or more pus cells per HPF can indicate possible infection — worth showing to your doctor. If your lab also gave a value in million/mL, please enter that manually.`,
    };
  }
  return {
    value: found.value,
    rawUnit: found.rawUnit,
    title: `Unit mismatch on this value`,
    message: `Reported as ${found.value}${found.rawUnit ? " " + found.rawUnit : ""}, which doesn't match our expected unit. Please verify with your lab.`,
  };
}
