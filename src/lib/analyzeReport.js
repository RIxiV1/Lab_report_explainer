// FM Lab Report Explainer — Semen Analysis Rule Engine
//
// Reference: WHO Laboratory Manual for the Examination and Processing
// of Human Semen, 6th Edition (2021).
// ISBN: 978-92-4-003078-7
// https://www.who.int/publications/i/item/9789240030787
//
// Table 1 (p. 272): Lower reference limits (5th centile, 95% CI)
//   - Semen volume: 1.4 mL (1.3–1.5)
//   - Sperm concentration: 16 million/mL (15–18)
//   - Total motility: 42% (40–43)
//   - Progressive motility: 30% (29–31)
//   - Normal forms (strict criteria): 4% (3.0–4.0)
//   - pH: ≥ 7.2
//   - Peroxidase-positive leukocytes: < 1.0 × 10⁶/mL
//
// NOTE on volume: WHO 2021 defines only a lower reference limit for
// semen volume. There is no clinically defined upper bound, so we do
// not flag "high volume" as pathological.
// NOTE on pH: WHO 2021 states pH should be ≥ 7.2. No upper limit is
// formally defined; we retain a practical soft-ceiling for infection
// screening only.

import { PARAM_ORDER, PARAM_META, REQUIRED_PARAMS, TMSC_TIERS } from "./constants";

// Thresholds for classifying values.
//
// IMPORTANT — Source distinction:
//   normalMin / normalMax → WHO 2021 5th-centile reference limit
//                           (the only line WHO actually defines)
//   warningMin / warningMax → CLINICAL CONVENTION, not WHO. Picked to
//                           give users a tiered signal (Borderline vs
//                           Needs Focus). Defensible but should not be
//                           cited as "WHO recommends." If a regulator
//                           or doctor asks where the critical line
//                           comes from, the answer is "common practice
//                           in reproductive medicine," not WHO 2021.
//
// Motility has two variants:
// - total motility (a+b+c): normal ≥42%, warning 30–41%   [WHO 2021 / convention]
// - progressive motility (a+b): normal ≥30%, warning 20–29% [WHO 2021 / convention]
// The parser tags which variant was matched so we grade correctly.
const THRESHOLDS = {
  spermCount:          { normalMin: 16,  warningMin: 5    }, // 16 = WHO 2021 ref. limit; 5 = clinical convention
  motilityTotal:       { normalMin: 42,  warningMin: 30   }, // 42 = WHO 2021;            30 = clinical convention
  motilityProgressive: { normalMin: 30,  warningMin: 20   }, // 30 = WHO 2021;            20 = clinical convention
  morphology:          { normalMin: 4,   warningMin: 2    }, // 4  = WHO 2021;            2  = clinical convention
  wbc:                 { normalMax: 1.0, warningMax: 2.0  }, // 1.0 = WHO 2021;           2.0 = clinical convention (suggests infection workup)
  // volume and pH use dedicated classifiers below (range-based)
};

function classifySimple(value, normalMin, warningMin) {
  if (value >= normalMin) return "NORMAL";
  if (value >= warningMin) return "WARNING";
  return "CRITICAL";
}

function classifyInverted(value, normalMax, warningMax) {
  if (value <= normalMax) return "NORMAL";
  if (value <= warningMax) return "WARNING";
  return "CRITICAL";
}

// Volume: WHO 2021 defines only a lower reference limit (1.4 mL).
// - 1.4 mL line: WHO 2021 (cited)
// - 0.5 mL warning line: CLINICAL CONVENTION (not WHO). Below 0.5 mL
//   is hypospermia, often points to ductal/collection issues.
// No upper bound — high volume isn't pathological per WHO 2021.
function classifyVolume(value) {
  if (value >= 1.4) return "NORMAL";
  if (value >= 0.5) return "WARNING";
  return "CRITICAL";
}

// pH:
// - 7.2–8.0 normal: WHO 2021 only defines the lower limit (≥7.2);
//   the 8.0 upper soft-ceiling is CLINICAL CONVENTION (not WHO).
// - 7.0–7.19 + 8.0–8.5 warning: CLINICAL CONVENTION used to flag
//   possible silent infection (prostatitis) or collection issues.
// - Outside 7.0–8.5 critical: convention.
function classifyPH(value) {
  if (value >= 7.2 && value <= 8.0) return "NORMAL";
  if ((value >= 7.0 && value < 7.2) || (value > 8.0 && value <= 8.5)) return "WARNING";
  return "CRITICAL";
}

function getStatus(param, value, subtype) {
  switch (param) {
    case "spermCount": return classifySimple(value, THRESHOLDS.spermCount.normalMin, THRESHOLDS.spermCount.warningMin);
    case "motility": {
      const t = subtype === "progressive" ? THRESHOLDS.motilityProgressive : THRESHOLDS.motilityTotal;
      return classifySimple(value, t.normalMin, t.warningMin);
    }
    case "morphology": return classifySimple(value, THRESHOLDS.morphology.normalMin, THRESHOLDS.morphology.warningMin);
    case "volume":     return classifyVolume(value);
    case "pH":         return classifyPH(value);
    case "wbc":        return classifyInverted(value, THRESHOLDS.wbc.normalMax, THRESHOLDS.wbc.warningMax);
    default:           return "NORMAL";
  }
}

const CORE_PARAMS = ["spermCount", "motility", "morphology"];
const SECONDARY_PARAMS = ["volume", "pH", "wbc"];

const CRITICAL_PRIORITY = [
  { param: "motility",   key: "CRITICAL_MOTILITY",   label: "Critically low motility" },
  { param: "spermCount", key: "CRITICAL_COUNT",      label: "Critically low sperm count" },
  { param: "morphology", key: "CRITICAL_MORPHOLOGY", label: "Critically low morphology" },
];

// Returns true when a value has been meaningfully provided.
function hasValue(v) {
  return v !== null && v !== undefined && !Number.isNaN(v);
}

// ── TMSC: Total Motile Sperm Count ────────────────────────────────
// Formula: Volume (mL) × Concentration (M/mL) × (Total Motility / 100)
// Returns { value, tier, tierLabel, tierDescription } or null if
// required inputs are missing.
export function calculateTMSC(volume, spermCount, motility) {
  if (!hasValue(volume) || !hasValue(spermCount) || !hasValue(motility)) return null;
  const tmsc = volume * spermCount * (motility / 100);
  const rounded = Math.round(tmsc * 10) / 10;

  let tier;
  if (rounded >= TMSC_TIERS.NATURAL.min) tier = "NATURAL";
  else if (rounded >= TMSC_TIERS.IUI.min) tier = "IUI";
  else tier = "IVF";

  return {
    value: rounded,
    tier,
    tierLabel: TMSC_TIERS[tier].label,
    tierDescription: TMSC_TIERS[tier].description,
  };
}

export function analyzeReport(inputs) {
  const { ttcMonths, age, motilitySubtype } = inputs;

  const parameters = {};
  const statuses = {};

  // Only classify parameters the user actually provided.
  for (const p of PARAM_ORDER) {
    const value = inputs[p];
    if (!hasValue(value)) continue;
    const subtype = p === "motility" ? motilitySubtype : undefined;
    const status = getStatus(p, value, subtype);
    statuses[p] = status;
    const { whoRange, unit } = PARAM_META[p];
    const paramData = { value, status, whoRange, unit };
    // Surface the subtype so the UI can show "Progressive motility" vs
    // "Total motility" where relevant.
    if (p === "motility" && subtype) {
      paramData.subtype = subtype;
      paramData.whoRange = subtype === "progressive" ? "≥ 30% (progressive)" : "≥ 42% (total)";
    }
    parameters[p] = paramData;
  }

  const providedParams = Object.keys(parameters);
  const urgencyFlag = ttcMonths != null && ttcMonths > 12 ? "HIGH" : "NORMAL";
  const ageFlag = age != null && age > 40;

  const criticals = providedParams.filter((p) => statuses[p] === "CRITICAL");
  const warnings  = providedParams.filter((p) => statuses[p] === "WARNING");
  const concernCount = criticals.length + warnings.length;

  const tmsc = calculateTMSC(inputs.volume, inputs.spermCount, inputs.motility);

  let verdict, snippetKey, primaryIssue;

  if (criticals.length > 0) {
    verdict = "ACT_NOW";

    const coreCriticals = CORE_PARAMS.filter((p) => statuses[p] === "CRITICAL");

    if (coreCriticals.length === 3) {
      snippetKey = "ALL_THREE_LOW";
      primaryIssue = "All three core parameters critically low";
    } else {
      let matched = false;
      for (const entry of CRITICAL_PRIORITY) {
        if (statuses[entry.param] === "CRITICAL") {
          snippetKey = entry.key;
          primaryIssue = entry.label;
          matched = true;
          break;
        }
      }

      if (!matched) {
        if (statuses.wbc === "CRITICAL") {
          snippetKey = "ELEVATED_WBC";
          primaryIssue = "Elevated white blood cells";
        } else if (statuses.pH === "CRITICAL") {
          snippetKey = inputs.pH < 7.2 ? "ABNORMAL_PH_LOW" : "ABNORMAL_PH_HIGH";
          primaryIssue = "Abnormal pH level";
        } else if (statuses.volume === "CRITICAL") {
          // Only low volume is treated as pathological (WHO 2021).
          snippetKey = "LOW_VOLUME";
          primaryIssue = "Critically low volume";
        } else {
          snippetKey = "FALLBACK";
          primaryIssue = "Multiple parameters need attention";
        }
      }
    }
  } else if (warnings.length >= 3) {
    verdict = "ACT_NOW";
    snippetKey = "BORDERLINE_MULTIPLE";
    primaryIssue = "Multiple borderline parameters";
  } else if (warnings.length >= 1) {
    verdict = "ATTENTION";

    const coreWarnings = CORE_PARAMS.filter((p) => statuses[p] === "WARNING");

    if (coreWarnings.length === 2) {
      if (coreWarnings.includes("spermCount") && coreWarnings.includes("motility")) {
        snippetKey = "LOW_COUNT_LOW_MOTILITY";
        primaryIssue = "Borderline sperm count and motility";
      } else if (coreWarnings.includes("spermCount") && coreWarnings.includes("morphology")) {
        snippetKey = "LOW_COUNT_LOW_MORPHOLOGY";
        primaryIssue = "Borderline sperm count and morphology";
      } else {
        snippetKey = "LOW_MOTILITY_LOW_MORPHOLOGY";
        primaryIssue = "Borderline motility and morphology";
      }
    } else if (coreWarnings.length === 1) {
      if (coreWarnings[0] === "spermCount") {
        snippetKey = "ISOLATED_LOW_COUNT";
        primaryIssue = "Borderline sperm count";
      } else if (coreWarnings[0] === "motility") {
        snippetKey = "ISOLATED_LOW_MOTILITY";
        primaryIssue = "Borderline motility";
      } else {
        snippetKey = "ISOLATED_LOW_MORPHOLOGY";
        primaryIssue = "Borderline morphology";
      }
    } else {
      const secondary = SECONDARY_PARAMS.find((p) => statuses[p] === "WARNING");
      if (secondary === "volume") {
        snippetKey = "LOW_VOLUME";
        primaryIssue = "Borderline low volume";
      } else {
        snippetKey = "FALLBACK";
        primaryIssue = "Some parameters need attention";
      }
    }
  } else {
    verdict = "ALL_NORMAL";
    snippetKey = "ALL_NORMAL";
    primaryIssue = "All parameters within normal range";
  }

  // Check that all REQUIRED params were provided; if not, surface
  // a flag for the UI to hint at partial analysis.
  const missingRequired = REQUIRED_PARAMS.filter((p) => !hasValue(inputs[p]));

  return {
    verdict,
    parameters,
    primaryIssue,
    snippetKey,
    urgencyFlag,
    ageFlag,
    concernCount,
    tmsc,
    providedParams,
    missingRequired,
  };
}