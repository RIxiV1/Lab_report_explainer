// FM Lab Report Explainer — Semen Analysis Rule Engine
// WHO 2021 Reference Ranges

const THRESHOLDS = {
  spermCount: { normalMin: 16, warningMin: 5 },
  motility: { normalMin: 42, warningMin: 30 },
  morphology: { normalMin: 4, warningMin: 2 },
  volume: { normalMin: 1.4, normalMax: 7.6, warningMin: 0.5, warningMax: 10 },
  pH: { normalMin: 7.2, normalMax: 8.0, warningMax: 8.5 },
  wbc: { normalMax: 1, warningMax: 2 },
};

function classifySimple(value, normalMin, warningMin) {
  if (value >= normalMin) return "NORMAL";
  if (value >= warningMin) return "WARNING";
  return "CRITICAL";
}

function classifyVolume(value) {
  const t = THRESHOLDS.volume;
  if (value >= t.normalMin && value <= t.normalMax) return "NORMAL";
  if ((value >= t.warningMin && value < t.normalMin) || (value > t.normalMax && value <= t.warningMax)) return "WARNING";
  return "CRITICAL";
}

function classifyPH(value) {
  const t = THRESHOLDS.pH;
  if (value >= t.normalMin && value <= t.normalMax) return "NORMAL";
  if (value > t.normalMax && value <= t.warningMax) return "WARNING";
  return "CRITICAL";
}

function classifyWBC(value) {
  const t = THRESHOLDS.wbc;
  if (value < t.normalMax) return "NORMAL";
  if (value <= t.warningMax) return "WARNING"; // 1.0–2.0 is WARNING
  return "CRITICAL"; // >2.0
}

function getStatus(param, value) {
  switch (param) {
    case "spermCount": return classifySimple(value, THRESHOLDS.spermCount.normalMin, THRESHOLDS.spermCount.warningMin);
    case "motility": return classifySimple(value, THRESHOLDS.motility.normalMin, THRESHOLDS.motility.warningMin);
    case "morphology": return classifySimple(value, THRESHOLDS.morphology.normalMin, THRESHOLDS.morphology.warningMin);
    case "volume": return classifyVolume(value);
    case "pH": return classifyPH(value);
    case "wbc": return classifyWBC(value);
    default: return "NORMAL";
  }
}

const WHO_RANGES = {
  spermCount: { whoRange: "≥ 16 million/mL", unit: "million/mL" },
  motility: { whoRange: "≥ 42%", unit: "%" },
  morphology: { whoRange: "≥ 4% (Kruger)", unit: "%" },
  volume: { whoRange: "1.4 – 7.6 mL", unit: "mL" },
  pH: { whoRange: "7.2 – 8.0", unit: "" },
  wbc: { whoRange: "< 1 million/mL", unit: "million/mL" },
};

const PARAM_LABELS = {
  spermCount: "Sperm Count",
  motility: "Motility",
  morphology: "Morphology",
  volume: "Volume",
  pH: "pH",
  wbc: "WBC",
};

// Priority-ordered list for critical evaluation
const CRITICAL_PRIORITY = [
  { param: "motility", key: "CRITICAL_MOTILITY", label: "Critically low motility" },
  { param: "spermCount", key: "CRITICAL_COUNT", label: "Critically low sperm count" },
  { param: "morphology", key: "CRITICAL_MORPHOLOGY", label: "Critically low morphology" },
];

function determineCriticalVolumeKey(value) {
  return value < THRESHOLDS.volume.warningMin ? "LOW_VOLUME" : "HIGH_VOLUME";
}

function determineCriticalPHKey(value) {
  return value < THRESHOLDS.pH.normalMin ? "ABNORMAL_PH_LOW" : "ABNORMAL_PH_HIGH";
}

export function analyzeReport(inputs) {
  const { spermCount, motility, morphology, volume, pH, wbc, age, ttcMonths } = inputs;

  // Build parameter results
  const paramKeys = ["spermCount", "motility", "morphology", "volume", "pH", "wbc"];
  const parameters = {};
  const statuses = {};

  for (const p of paramKeys) {
    const value = inputs[p];
    const status = getStatus(p, value);
    statuses[p] = status;
    parameters[p] = { value, status, ...WHO_RANGES[p] };
  }

  // Tone flags
  const urgencyFlag = ttcMonths != null && ttcMonths > 12 ? "HIGH" : "NORMAL";
  const ageFlag = age != null && age > 40;

  // Collect criticals and warnings
  const criticals = paramKeys.filter((p) => statuses[p] === "CRITICAL");
  const warnings = paramKeys.filter((p) => statuses[p] === "WARNING");
  const concernCount = criticals.length + warnings.length;

  // --- Priority logic ---
  let verdict, snippetKey, primaryIssue;

  if (criticals.length > 0) {
    verdict = "ACT_NOW";

    // Check if all three core params are critical
    const coreCriticals = ["spermCount", "motility", "morphology"].filter((p) => statuses[p] === "CRITICAL");

    if (coreCriticals.length === 3) {
      snippetKey = "ALL_THREE_LOW";
      primaryIssue = "All three core parameters critically low";
    } else {
      // Check priority-ordered criticals (motility > count > morphology)
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
        // Volume, pH, WBC criticals
        if (statuses.volume === "CRITICAL") {
          snippetKey = determineCriticalVolumeKey(volume);
          primaryIssue = snippetKey === "LOW_VOLUME" ? "Critically low volume" : "Abnormally high volume";
        } else if (statuses.pH === "CRITICAL") {
          snippetKey = determineCriticalPHKey(pH);
          primaryIssue = snippetKey === "ABNORMAL_PH_LOW" ? "Abnormally low pH" : "Abnormally high pH";
        } else if (statuses.wbc === "CRITICAL") {
          snippetKey = "ELEVATED_WBC";
          primaryIssue = "Significantly elevated white blood cells";
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

    // Core trio for warning combos
    const coreWarnings = ["spermCount", "motility", "morphology"].filter((p) => statuses[p] === "WARNING");

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
      // Warnings only in volume/pH/wbc — map to existing snippet keys
      const secondary = ["volume", "pH", "wbc"].find((p) => statuses[p] === "WARNING");
      if (secondary === "volume") {
        snippetKey = volume < THRESHOLDS.volume.normalMin ? "LOW_VOLUME" : "HIGH_VOLUME";
        primaryIssue = volume < THRESHOLDS.volume.normalMin ? "Borderline low volume" : "Borderline high volume";
      } else if (secondary === "pH") {
        snippetKey = pH < THRESHOLDS.pH.normalMin ? "ABNORMAL_PH_LOW" : "ABNORMAL_PH_HIGH";
        primaryIssue = pH < THRESHOLDS.pH.normalMin ? "Borderline low pH" : "Borderline high pH";
      } else if (secondary === "wbc") {
        snippetKey = "ELEVATED_WBC";
        primaryIssue = "Elevated white blood cells";
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

  return {
    verdict,
    parameters,
    primaryIssue,
    snippetKey,
    urgencyFlag,
    ageFlag,
    concernCount,
  };
}
