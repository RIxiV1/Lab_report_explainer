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

const GAP = "[^\\d\\n]{0,80}?";

// Sanity bounds — reject values that are physically impossible.
// This catches lab data-entry errors and mis-parses.
const SANITY = {
  spermCount: { min: 0, max: 900 },
  motility: { min: 0, max: 100 },
  morphology: { min: 0, max: 100 },
  volume: { min: 0, max: 30 },
  pH: { min: 6, max: 9 },
  wbc: { min: 0, max: 100 },
};

const PARAMS = [
  {
    key: "spermCount",
    // Bare "concentration" / "density" deliberately removed — they
    // collide with other lab values (haemoglobin concentration,
    // urine specific gravity / density) when a CBC or urinalysis
    // shares the page. Always require an explicit "sperm" qualifier.
    keywords: [
      "total sperm concentration",
      "sperm concentration",
      "sperm density",
      "sperm count",
      "sperm number",
    ],
    // "Density (million per ml)" — used by CREATE Fertility and some
    // UK labs. Bare "density" collides with urine specific gravity, so
    // we require "million" in context to confirm it's sperm density.
    fallbackRegex: /\bdensity\s*\(?[^)\d\n]*million[^)\d\n]*\)?\s*([\d.]+)/i,
  },
  {
    key: "motility",
    // Order matters: WHO canonical is "total motility" (a+b+c), threshold ≥42%.
    // "Total motile" phrasing is common on Indian labs. Fall back to
    // "all progressive" (a+b), threshold ≥30% — different threshold,
    // so we tag which type was matched and the analyzer grades accordingly.
    keywords: [
      { kw: "total motility", subtype: "total" },
      { kw: "total motile", subtype: "total" },
      { kw: "motility total", subtype: "total" },
      { kw: "actively motile", subtype: "total" },
      { kw: "active motility", subtype: "total" },
      { kw: "all progressive", subtype: "progressive" },
      { kw: "progressive motility", subtype: "progressive" },
      { kw: "motility", subtype: "total" },
    ],
    guard: (matchedText) => !/immotile|non[-\s]*progressive/.test(matchedText.toLowerCase()),
  },
  {
    key: "morphology",
    keywords: [
      "normal forms",
      "normal morphology",
      "strict morphology",
      "strict criteria",
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
    // CBC reports use thousand/μL (a.k.a. K/μL or /cumm). A normal WBC
    // count of 7.5 thousand/μL would otherwise look like 7.5 million/mL
    // (1000x too high) and silently flag the user as having severe
    // leukocytospermia. Catch the unit and reject the value.
    rejectIfNear: /\b(?:thousand|k)\s*\/\s*[uµμ]l|cells\s*\/\s*[uµμ]?l|\/\s*cumm|\/\s*mm[\s]?3|x10\s*\^?\s*3\s*\/\s*[uµμ]l/i,
    rejectReason: "thousand/μL (looks like a CBC count, not semen pus cells in million/mL)",
  },
];

// Look up to 40 chars beyond the matched number to check for unit markers
// that would invalidate the reading (e.g. "/hpf" on pus cells).
const REJECT_LOOKAHEAD = 40;

function findValue(text, param) {
  const { key, keywords, guard, fallbackRegex, flagIfNear, rejectIfNear, rejectReason } = param;
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
      const after = text.slice(match.index + match[0].length, match.index + match[0].length + REJECT_LOOKAHEAD);
      // Hard reject — wrong-unit values that would silently mis-classify
      // (e.g. CBC WBC in thousand/μL looking like semen pus cells in million/mL).
      if (rejectIfNear && rejectIfNear.test(after)) {
        return { value, matched: match[0].trim(), unitMismatch: true, rawUnit: rejectReason, subtype };
      }
      if (flagIfNear) {
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

const MONTH_ABBR = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

// Returns age in years if the report mentions one directly or via DOB.
// Indian labs print these with wide formatting variation, so we try both:
//   "Age: 32 Y" / "Age 32 Years"
//   "DOB: 15/03/1990" / "Date of Birth: 15-Mar-1990"
function extractAge(text) {
  const ageMatch = text.match(/\bage\b\s*[:\-]?\s*(\d{1,3})\s*(?:y|yr|yrs|year|years)?\b/i);
  if (ageMatch) {
    const a = parseInt(ageMatch[1], 10);
    if (a >= 18 && a <= 80) return a;
  }

  const dobMatch = text.match(
    /(?:d\.?o\.?b\.?|date\s*of\s*birth|birth\s*date)\s*[:\-]?\s*(\d{1,2})[\/\-.\s]+(\d{1,2}|[a-z]{3,9})[\/\-.\s]+(\d{2,4})/i
  );
  if (!dobMatch) return null;

  const day = parseInt(dobMatch[1], 10);
  const monthRaw = dobMatch[2];
  const month = /^\d+$/.test(monthRaw)
    ? parseInt(monthRaw, 10)
    : MONTH_ABBR[monthRaw.toLowerCase().slice(0, 3)];
  let year = parseInt(dobMatch[3], 10);
  if (year < 100) year += year > 30 ? 1900 : 2000;
  if (!month || month > 12 || day < 1 || day > 31 || year < 1900) return null;

  const dob = new Date(year, month - 1, day);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age >= 18 && age <= 100 ? age : null;
}

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

  const age = extractAge(normalized);

  return {
    results,
    matched,
    subtypes,
    unitWarnings: warnings, // kept key-name for backward compat
    extras: age != null ? { age } : {},
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
  // CBC values that bled into the parser. Tell the user we ignored
  // the value so they don't think it's missing — and explain why.
  if (paramKey === "wbc" && found.rawUnit?.startsWith("thousand")) {
    return {
      value: found.value,
      rawUnit: found.rawUnit,
      title: `WBC value looks like a blood-count reading, not a semen reading`,
      message: `Your report looks like it includes a blood test alongside the semen analysis. We ignored the WBC line that was in thousand/μL (a CBC unit) because it doesn't apply here. If your semen report has a separate pus-cell count in million/mL, please enter that manually.`,
    };
  }
  return {
    value: found.value,
    rawUnit: found.rawUnit,
    title: `Unit mismatch on this value`,
    message: `Reported as ${found.value}${found.rawUnit ? " " + found.rawUnit : ""}, which doesn't match our expected unit. Please verify with your lab.`,
  };
}
